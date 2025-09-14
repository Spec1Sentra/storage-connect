# Supabase Functions

This directory contains all the server-side logic for the Storage Connection application, implemented as Deno-based Supabase Edge Functions.

## Local Testing

To test these functions locally, you need the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.

1.  **Set up environment variables:** Create a file named `.env` in the `supabase/` directory with the required secrets, such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and a base64-encoded `GCLOUD_SERVICE_ACCOUNT`.

2.  **Start the functions server:** Run the following command from the root of the repository:
    ```bash
    supabase functions serve --env-file ./supabase/.env --no-verify-jwt
    ```
    The `--no-verify-jwt` flag is useful for local testing, as it allows you to call functions without a valid user JWT. For functions that require user authentication, you will need to pass a valid `Authorization: Bearer [TOKEN]` header.

3.  **Invoke functions:** Use a tool like `curl` to send requests to the local server, which typically runs at `http://localhost:54321/functions/v1/`.

---

## Function Reference & Test Commands

Below are example `curl` commands for each function. Replace `[YOUR_SUPABASE_JWT]` with a valid JWT for an authenticated user, and update UUIDs to match data in your local database.

### `get_signed_upload_url`

Generates a secure URL for uploading a file.

```bash
curl -i -X POST http://localhost:54321/functions/v1/get_signed_upload_url \
  -H "Authorization: Bearer [YOUR_SUPABASE_JWT]" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test-image.jpg"}'
```

### `create_thumbnail`

This function is designed to be triggered automatically by a storage event when a new image is uploaded to the `item-raw` bucket. To test manually, you would need to simulate the webhook payload that Supabase sends.

### `ai_tag_items`

Processes images to generate tags, perform moderation, and check for PII. This should be called after the client has successfully uploaded images.

```bash
curl -i -X POST http://localhost:54321/functions/v1/ai_tag_items \
  -H "Authorization: Bearer [YOUR_SUPABASE_JWT]" \
  -H "Content-Type: application/json" \
  -d '{
        "item_id": "00000000-0000-0000-0000-000000000000",
        "images": [
          { "path": "[USER_ID]/[TIMESTAMP]-test-image.jpg" }
        ]
      }'
```

### `search_items`

Searches for items based on various criteria.

```bash
curl -i -X POST http://localhost:54321/functions/v1/search_items \
  -H "Content-Type: application/json" \
  -d '{
        "q": "red box",
        "tags": ["furniture"],
        "lat": 34.05,
        "lng": -118.25,
        "radius_km": 50,
        "limit": 10,
        "offset": 0
      }'
```

### `expire_listings`

Updates the status of expired items. This is intended to be run by a cron job.

```bash
curl -i -X POST http://localhost:54321/functions/v1/expire_listings \
  -H "Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]"
```

### `alert_matches`

Finds matching saved searches for a new item and creates notifications. This would typically be called after `ai_tag_items` is complete.

```bash
curl -i -X POST http://localhost:54321/functions/v1/alert_matches \
  -H "Content-Type: application/json" \
  -d '{"item_id": "00000000-0000-0000-0000-000000000000"}'
```
