# GitHub OAuth Setup Guide

This guide explains how to set up GitHub OAuth authentication for the Kanji Decomposition Manager, allowing users to authenticate without manually creating Personal Access Tokens.

## Overview

The application uses GitHub OAuth to authenticate users. This requires:
1. A GitHub OAuth App
2. A backend service to securely exchange authorization codes for access tokens

## Quick Setup (Recommended: Vercel)

###  Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Kanji Decomposition Manager (or your preferred name)
   - **Homepage URL**: `https://your-domain.com` (or your GitHub Pages URL)
   - **Authorization callback URL**: `https://your-domain.com/` (same as homepage)
4. Click "Register application"
5. Note down your **Client ID**
6. Generate a **Client Secret** and note it down (keep this secret!)

### Step 2: Deploy to Vercel

1. Fork this repository
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Import your forked repository
5. In the project settings, add environment variables:
   - `GITHUB_CLIENT_ID`: Your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your OAuth App Client Secret
6. Deploy!

### Step 3: Update Client ID in Code

1. Edit `app.js`
2. Find the line `const GITHUB_CLIENT_ID = 'Ov23liibHbYtMy5FxJVj';`
3. Replace with your OAuth App Client ID
4. Commit and push (Vercel will auto-deploy)

## Alternative: Deploy to Netlify

### Step 1: Create OAuth App (same as above)

### Step 2: Deploy to Netlify

1. Fork this repository
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your forked repository
5. Configure build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
6. Add environment variables in Site settings → Build & deploy → Environment:
   - `GITHUB_CLIENT_ID`: Your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your OAuth App Client Secret
7. Deploy!

### Step 3: Update Functions

Netlify Functions need to be in a `netlify/functions` directory. Move the `api` folder:

```bash
mkdir -p netlify/functions
mv api/oauth-callback.js netlify/functions/
```

Update `app.js` to use the Netlify function endpoint:
```javascript
const OAUTH_CALLBACK_API = window.location.origin + '/.netlify/functions/oauth-callback';
```

## Alternative: Deploy Your Own Backend

If you prefer to use your own backend server, you can implement the OAuth exchange endpoint using the provided `api/oauth-callback.js` as a reference.

The endpoint should:
1. Accept a `code` query parameter
2. Exchange it for an access token with GitHub
3. Return the token as JSON: `{ "token": "..." }`

## Testing

Once deployed:
1. Visit your deployed application
2. Click "Login with GitHub"
3. Authorize the application
4. You should be redirected back and logged in automatically!

## Security Notes

- Never commit your `GITHUB_CLIENT_SECRET` to the repository
- Always use environment variables for secrets
- The serverless function keeps your client secret secure on the backend
- Access tokens are stored in the browser's sessionStorage and are cleared when the session ends

## Troubleshooting

### "Failed to complete authentication" error

- Check that your environment variables are correctly set in Vercel/Netlify
- Verify that your OAuth App callback URL matches your deployment URL
- Check the browser console and serverless function logs for detailed errors

### "OAuth app not configured" error

- Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables are set in your deployment platform
- Redeploy after adding environment variables

### Redirect loop

- Ensure the `GITHUB_CLIENT_ID` in `app.js` matches your OAuth App
- Check that the callback URL in your OAuth App settings is correct

## For Local Development

To test OAuth locally:

1. Install [ngrok](https://ngrok.com/) or similar tool to expose localhost
2. Start ngrok: `ngrok http 8080`
3. Update your OAuth App callback URL to the ngrok URL
4. Set environment variables locally
5. Run the serverless function locally (see Vercel/Netlify local dev docs)

## Questions?

Open an issue in the repository if you need help with OAuth setup!
