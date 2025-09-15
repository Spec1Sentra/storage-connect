# Storage Connection

This repository contains the source code for the Storage Connection application.

## Structure

- `/expo-app`: The React Native mobile application.
- `/supabase`: Supabase backend configuration, including migrations and functions.
- `/website`: The static marketing website.
- `/.github/workflows`: GitHub Actions for CI/CD.

## Getting Started

To run the mobile application locally, follow these steps:

1.  **Navigate to the app directory:**
    ```bash
    cd expo-app
    ```

2.  **Install dependencies:**
    This project uses npm.
    ```bash
    npm install
    ```
    *Note: In some environments, `devDependencies` may not install correctly. If you encounter issues running scripts like `tsc` or `jest`, you may need to troubleshoot the npm installation.*

3.  **Run the application:**
    You can run the app on Android, iOS, or web.
    ```bash
    # To run on Android
    npm run android

    # To run on iOS
    npm run ios

    # To run in the web browser
    npm run web
    ```
