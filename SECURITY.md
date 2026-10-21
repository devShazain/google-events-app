# Security notes

## Google API key

The app uses a Google API key in browser-side React code. A `REACT_APP_` variable removes the key from source files, but Create React App embeds its value in the built JavaScript. Treat it as a public browser key, not a secret.

Before deploying:

1. In Google Cloud Console, rotate the previously exposed API key and update the deployment environment variable `REACT_APP_GOOGLE_API_KEY` with the new key. The old key has appeared in the public repository and its Git history, so removing it from the current source does not invalidate it.
2. Restrict the new key by HTTP referrer to the exact production domain(s) and local development origins you use. Avoid broad wildcards where possible.
3. Restrict API access to only the Google APIs this app needs, currently Google Calendar API and Google Sheets API. Remove any other API permissions.
4. Review Google Cloud usage and billing for unexpected activity, and disable the old key after confirming the replacement works.
5. Confirm the spreadsheet's sharing permissions are intentional. The spreadsheet ID is not a credential; access is controlled by its sharing settings and API authorization.

## Local setup

Copy `client/.env.example` to `client/.env.local`, set `REACT_APP_GOOGLE_API_KEY` to the restricted key, and restart the React development server. Never commit `.env.local` or put service account private keys or OAuth client secrets in frontend code.
