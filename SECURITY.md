# Security notes

## Google API key and OAuth client ID

The app uses a Google API key and OAuth client ID in browser-side React code. The OAuth client ID is not a secret, but it is tied to the university's Google Cloud project and should be replaced with an OAuth client ID from a project you control. A `REACT_APP_` variable removes these values from source files, but Create React App embeds their values in the built JavaScript. Treat the API key as a public browser key, not a secret.

Before deploying:

1. Create a Google Cloud project under an account you control. Enable Google Calendar API and Google Sheets API, create a new API key, and create an OAuth client ID for a Web application. Configure `REACT_APP_GOOGLE_API_KEY` and `REACT_APP_GOOGLE_CLIENT_ID` using these new credentials. The old university key has appeared in the public repository and its Git history; you cannot revoke it without project access, so contact the university administrator and ask them to disable it.
2. Restrict the new key by HTTP referrer to the exact production domain(s) and local development origins you use. Avoid broad wildcards where possible.
3. Restrict API access to only the Google APIs this app needs, currently Google Calendar API and Google Sheets API. Remove any other API permissions.
4. Review usage and billing in your own project. Ask the university administrator to review and disable the old key; only the project owner or someone with sufficient permissions can do this.
5. Confirm the spreadsheet's sharing permissions are intentional. The spreadsheet ID is not a credential; access is controlled by its sharing settings and API authorization.

## Local setup

Copy `client/.env.example` to `client/.env.local`, set both `REACT_APP_GOOGLE_API_KEY` and `REACT_APP_GOOGLE_CLIENT_ID` to credentials from your own Google Cloud project, and restart the React development server. Never commit `.env.local` or put service account private keys or OAuth client secrets in frontend code.
