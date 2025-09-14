import { create } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { crypto } from "https://deno.land/std@0.159.0/crypto/mod.ts";

/**
 * Generates a Google Cloud access token from a service account.
 * @param serviceAccount The service account JSON object.
 * @returns A promise that resolves to the access token.
 */
export async function getGoogleAuthToken(serviceAccount: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-vision",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
  };

  // The private key needs to be in a specific format.
  // The service account file provides it in a PEM-like format,
  // we need to extract the base64 part for the Web Crypto API.
  const privateKey = serviceAccount.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const key = await crypto.subtle.importKey(
    "pkcs8",
    _base64ToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const jwt = await create(header, payload, key);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get Google auth token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

function _base64ToArrayBuffer(b64: string) {
  const byteString = atob(b64);
  const len = byteString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return bytes.buffer;
}
