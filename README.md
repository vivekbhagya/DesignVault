# 🎨 DesignVault

Your visual idea bank. Save inspiration from anywhere, access from any device.

![DesignVault](https://img.shields.io/badge/status-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **📱 Cross-Device**: Upload from mobile, organize on desktop
- **🎯 Quick Capture**: Drag-drop images with notes
- **🏷️ Smart Tagging**: Filter by tags, search across everything
- **🎨 Color Palettes**: Save color references with each idea
- **🔒 Your Data**: Images stored in YOUR Google Drive (2TB free!)
- **⚡ Fast**: Masonry grid, instant search
- **🌙 Zero Deploy**: Free forever on Vercel

---

## 🚀 Quick Start

1. **Clone & Setup**
   ```bash
   git clone https://github.com/yourusername/designvault.git
   cd designvault
   ```

2. **Configure APIs** (15 mins)
   - Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) step-by-step
   - You'll need: Supabase account + Google Cloud account (both free)

3. **Test Locally**
   ```bash
   npm run dev
   # Open http://localhost:8000
   ```

4. **Deploy**
   ```bash
   npm run deploy
   # Or push to GitHub and import in Vercel
   ```

---

## 📦 Tech Stack

- **Frontend**: Vanilla JavaScript (no framework, blazing fast)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Google Drive API (your 2TB space)
- **Auth**: Google OAuth
- **Hosting**: Vercel

---

## 🎯 Use Cases

Perfect for:
- **Graphic Designers**: Save poster/thumbnail references
- **UI/UX Designers**: Collect interface patterns
- **Students**: Build visual research libraries
- **Creatives**: Organize inspiration boards

---

## 📱 Workflow

1. **See inspiration** on Instagram/Pinterest/Behance
2. **Screenshot or share** to DesignVault
3. **Add context**: tags, colors, technique notes
4. **Browse later** when designing, filtered by tag/color

---

## 🔧 Configuration

Edit `config.js`:

```javascript
const CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_ANON_KEY'
    },
    google: {
        clientId: 'YOUR_CLIENT_ID',
        apiKey: 'YOUR_API_KEY',
        driveFolder: 'DesignVault'
    }
};
```

Full setup instructions: [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📊 Database Schema

```sql
ideas (
    id UUID PRIMARY KEY,
    user_id UUID,
    image_url TEXT,
    title TEXT,
    description TEXT,
    tags TEXT[],
    source_url TEXT,
    color_palette TEXT[],
    technique_notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

---

## 🎨 Customization

### Change Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #6366f1;  /* Main color */
    --secondary: #ec4899;  /* Accent */
}
```

### Change Folder Name
In `config.js`, change:
```javascript
driveFolder: 'YourFolderName'
```

---

## 🐛 Troubleshooting

**Sign-in fails?**
- Check Google OAuth redirect URIs
- Verify Supabase project URL in Google Cloud

**Images won't upload?**
- Ensure Google Drive API is enabled
- Check API key restrictions

**Can't see ideas?**
- Verify Supabase RLS policies created
- Check browser console for errors

Full troubleshooting: [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 🚧 Roadmap

- [ ] Auto color palette extraction
- [ ] PWA (install as mobile app)
- [ ] Bulk upload
- [ ] Export to PDF moodboard
- [ ] Collaboration (share boards)
- [ ] Browser extension
- [ ] AI auto-tagging

---

## 📄 License

MIT License - feel free to use for personal or commercial projects!

---

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Backend as a Service
- [Google Drive API](https://developers.google.com/drive) - File storage
- [Vercel](https://vercel.com) - Hosting

---

## 💬 Support

Questions? Found a bug?
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Open an issue on GitHub
3. Check browser console for errors

---

**Made with ❤️ for designers who collect too many screenshots**
