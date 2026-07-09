# CoffeeMind AI v2.4 — Public Deployment Guide

This version is prepared for publishing as a public PWA link.

## Recommended path: GitHub + Vercel

1. Create a GitHub repository named `coffeemind-ai`.
2. Upload all files from this project root into the repository root.
3. Open Vercel and import the GitHub repository.
4. Use these settings:
   - Framework Preset: `Vite`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy.
6. Open the generated HTTPS URL.
7. On iPhone: Share → Add to Home Screen.
8. On Android: Chrome menu ⋮ → Install app / Add to Home screen.

## Alternative path: Netlify

1. Create a new site from Git.
2. Connect the same GitHub repository.
3. Use these settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Deploy.

## User data model in this version

This version stores each user's data locally in their browser/device through localStorage.

That means:
- every user has a separate journal;
- your journal does not mix with another user's journal;
- if a user changes device/browser, they should export/import through Data Vault;
- cloud accounts and sync are planned for a future Supabase version.
