# DesignVault Setup Guide

Complete step-by-step guide to get DesignVault running.

---

## Overview

DesignVault needs:
1. **Supabase** - For storing metadata (free tier)
2. **Google Cloud Project** - For Drive API access (free)
3. **Vercel** - For hosting (free)

Total time: ~15 minutes

---

## Part 1: Supabase Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in with GitHub
3. Click "New Project"
   - Organization: Create new or select existing
   - Name: `designvault`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project"
4. Wait 2 minutes for setup

### Step 2: Get API Credentials

1. In your project dashboard, click "Settings" (gear icon) in sidebar
2. Click "API" under Project Settings
3. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 3: Create Database Table

1. Click "SQL Editor" in sidebar
2. Click "New Query"
3. Paste this SQL:

```sql
-- Create ideas table
CREATE TABLE ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tags TEXT[],
    source_url TEXT,
    color_palette TEXT[],
    technique_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ideas"
    ON ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
    ON ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
    ON ideas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
    ON ideas FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX ideas_user_id_idx ON ideas(user_id);
CREATE INDEX ideas_created_at_idx ON ideas(created_at DESC);
```

4. Click "Run" (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned"

### Step 4: Enable Google Auth

1. Click "Authentication" in sidebar
2. Click "Providers"
3. Find "Google" and click to expand
4. Toggle "Enable Sign in with Google" ON
5. **Keep this page open** - we'll come back to fill in Client ID and Secret

---

## Part 2: Google Cloud Setup (7 minutes)

### Step 1: Create Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click project dropdown at top → "New Project"
   - Project name: `DesignVault`
   - Click "Create"
3. Wait for project creation, then select it from dropdown

### Step 2: Enable APIs

1. Click "☰" menu → "APIs & Services" → "Library"
2. Search for "Google Drive API" → Click it → Click "Enable"
3. Go back to Library
4. Search for "Google+ API" → Click it → Click "Enable"

### Step 3: Create OAuth Consent Screen

1. Click "☰" menu → "APIs & Services" → "OAuth consent screen"
2. Choose "External" → Click "Create"
3. Fill in:
   - App name: `DesignVault`
   - User support email: Your email
   - Developer contact: Your email
   - Leave everything else default
4. Click "Save and Continue"
5. Click "Add or Remove Scopes"
   - Scroll down and manually add: `https://www.googleapis.com/auth/drive.file`
   - Click "Update" → "Save and Continue"
6. Click "Save and Continue" through remaining screens

### Step 4: Create OAuth Credentials

1. Click "Credentials" in left sidebar
2. Click "+ Create Credentials" → "OAuth client ID"
3. Fill in:
   - Application type: **Web application**
   - Name: `DesignVault Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:8000` (for testing)
     - `https://designvault.vercel.app` (your production domain - you can add more later)
   - Authorized redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback` (replace xxxxx with YOUR Supabase project URL)
4. Click "Create"
5. **Save these values:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxx`

### Step 5: Create API Key

1. Click "+ Create Credentials" → "API key"
2. Copy the API key: `AIzaSyxxxxx`
3. Click "Restrict Key"
4. Under "API restrictions":
   - Select "Restrict key"
   - Check "Google Drive API"
5. Click "Save"

### Step 6: Complete Supabase Google Auth

1. Go back to Supabase → Authentication → Providers → Google
2. Paste:
   - **Client ID**: From Step 4
   - **Client Secret**: From Step 4
3. Click "Save"

---

## Part 3: Configure DesignVault

### Update config.js

Open `config.js` and replace placeholder values:

```javascript
const CONFIG = {
    supabase: {
        url: 'https://xxxxx.supabase.co',  // From Part 1, Step 2
        anonKey: 'eyJhbGc...'  // From Part 1, Step 2
    },
    google: {
        clientId: 'xxxxx.apps.googleusercontent.com',  // From Part 2, Step 4
        apiKey: 'AIzaSyxxxxx',  // From Part 2, Step 5
        driveFolder: 'DesignVault'
    }
};
```

---

## Part 4: Test Locally

1. Open terminal in project folder
2. Start local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open browser: `http://localhost:8000`
4. Click "Sign in with Google"
5. Test uploading an idea!

---

## Part 5: Deploy to Vercel (3 minutes)

### Option A: GitHub + Vercel (Recommended)

1. Create GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/designvault.git
   git push -u origin main
   ```

2. Go to [https://vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "Add New..." → "Project"
5. Import your `designvault` repo
6. Click "Deploy"
7. Wait 1 minute
8. Your app is live! 🎉

### Option B: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   vercel
   ```
3. Follow prompts (all defaults work)

### Step 6: Update Google OAuth URLs

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add your Vercel URL to:
   - Authorized JavaScript origins: `https://your-app.vercel.app`
4. Save

---

## Troubleshooting

### "Configuration errors" message
- Check that you replaced ALL placeholder values in config.js
- Ensure no typos in URLs/keys

### Google sign-in fails
- Verify OAuth consent screen is configured
- Check redirect URIs match exactly
- Make sure Google+ API is enabled

### Images don't upload
- Check Google Drive API is enabled
- Verify API key has Drive API restriction
- Check browser console for errors

### Can't see uploaded ideas
- Check Supabase SQL was executed successfully
- Verify RLS policies are created
- Check browser console for auth errors

---

## Next Steps

1. **Mobile Access**: Add `https://your-app.vercel.app` to Google OAuth origins
2. **Custom Domain**: In Vercel → Settings → Domains
3. **PWA (Optional)**: Makes it installable on mobile (see PWA_GUIDE.md)

---

## Support

- Supabase Docs: https://supabase.com/docs
- Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
- Vercel Docs: https://vercel.com/docs

Need help? Check browser console for errors and compare with this guide.
