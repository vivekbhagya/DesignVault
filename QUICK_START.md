# DesignVault - Quick Reference

## One-Time Setup Checklist

### 1. Supabase (5 mins)
- [ ] Create account at supabase.com
- [ ] Create new project
- [ ] Copy Project URL + anon key
- [ ] Run SQL to create `ideas` table
- [ ] Enable Google auth provider

### 2. Google Cloud (7 mins)
- [ ] Create project at console.cloud.google.com
- [ ] Enable Google Drive API
- [ ] Enable Google+ API
- [ ] Create OAuth consent screen
- [ ] Create OAuth credentials (get Client ID + Secret)
- [ ] Create API key
- [ ] Add redirect URIs

### 3. Configure App (2 mins)
- [ ] Open `config.js`
- [ ] Paste Supabase URL + anon key
- [ ] Paste Google Client ID + API key
- [ ] Save file

### 4. Test (1 min)
- [ ] Run `npm run dev` (or `python3 -m http.server 8000`)
- [ ] Open http://localhost:8000
- [ ] Sign in with Google
- [ ] Upload test image

### 5. Deploy (3 mins)
- [ ] Push to GitHub
- [ ] Import to Vercel
- [ ] Add production URL to Google OAuth origins
- [ ] Done! 🎉

---

## Daily Usage

### Desktop Workflow
1. Find inspiration (Pinterest, Behance, etc.)
2. Drag image directly to DesignVault
3. Add tags, colors, notes
4. Save

### Mobile Workflow
1. Screenshot inspiration
2. Open DesignVault bookmark
3. Upload from camera roll
4. Add tags and save

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add idea | Click `+ Add Idea` |
| Search | Click search bar |
| Add tag | Type + Enter in tag field |
| Add color | Type hex + Enter |
| Save | Click Save Idea |
| Cancel | ESC or click Cancel |

---

## File Structure

```
designvault/
├── index.html          # Main HTML
├── style.css           # All styles
├── config.js          # 👈 Edit this with your API keys
├── supabase.js        # Database logic
├── drive.js           # Google Drive upload
├── app.js             # Main app logic
├── SETUP_GUIDE.md     # Detailed setup instructions
└── README.md          # Project overview
```

---

## Common Tasks

### Change Drive Folder Name
`config.js` → line 10 → change `'DesignVault'` to your name

### Change App Colors
`style.css` → lines 1-12 → edit CSS variables

### Add More Tags
Just type them in the tag input when creating ideas!

### Filter by Multiple Tags
Check multiple tags in the sidebar

### Search Everything
Type in search bar - searches title, description, technique notes

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| "Configuration errors" | Check config.js has no placeholder values |
| Google sign-in fails | Verify redirect URIs in Google Cloud |
| Images won't upload | Check Drive API is enabled |
| Ideas don't appear | Check Supabase RLS policies created |
| 404 errors | Run SQL script again in Supabase |

Full guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## Support Links

- Supabase Dashboard: https://app.supabase.com
- Google Cloud Console: https://console.cloud.google.com
- Vercel Dashboard: https://vercel.com/dashboard
- Your Drive Folder: https://drive.google.com (search "DesignVault")

---

**Pro Tip**: Bookmark your deployed app on mobile home screen for instant access!
