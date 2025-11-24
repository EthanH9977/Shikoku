<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

# Shikoku Travel Log

A smart, cloud-synced travel itinerary planner.

## 🚀 Vercel Deployment Setup (Important!)

To make the Google Drive integration work, you must set the following **Environment Variables** in your Vercel Project Settings:

1.  Go to **Settings** -> **Environment Variables**.
2.  Add `GOOGLE_CLIENT_EMAIL`: The email from your Service Account JSON.
3.  Add `GOOGLE_PRIVATE_KEY`: The private key from your Service Account JSON (copy the whole string including `-----BEGIN...`).
4.  **Redeploy** your project for changes to take effect.

View your app in AI Studio: https://ai.studio/apps/drive/1cUPNjM00FhoV7eIIvNfP_LR-6EPRMK8m

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
