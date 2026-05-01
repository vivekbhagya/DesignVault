// DesignVault Configuration
// Follow setup guides to fill these values

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://axicketcipwjucuerkeh.supabase.co',      anonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aWNrZXRjaXB3anVjdWVya2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTc0MjEsImV4cCI6MjA5MjQzMzQyMX0.tKdVm2g0nk80o_ftOP6mzF7LX-Qg_D0U27b_Tbyn9mg'
    },
    
    // Google Drive API Configuration
    google: {
        clientId: '525904531808-goo7d5p2n6bgisqbjm213tiftvd4jk4o.apps.googleusercontent.com', // e.g., xxxxx.apps.googleusercontent.com
        apiKey: 'AIzaSyDyp8SA0hniQAQzNC5Nho8Jyhn8uz_0oCc',
        driveFolder: 'DesignVault' // Folder name in your Drive
    }
};

// Validate configuration
function validateConfig() {
    const errors = [];
    
    if (CONFIG.supabase.url === 'YOUR_SUPABASE_URL') {
        errors.push('Supabase URL not configured');
    }
    if (CONFIG.supabase.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        errors.push('Supabase Anon Key not configured');
    }
    if (CONFIG.google.clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        errors.push('Google Client ID not configured');
    }
    if (CONFIG.google.apiKey === 'YOUR_GOOGLE_API_KEY') {
        errors.push('Google API Key not configured');
    }
    
    if (errors.length > 0) {
        console.error('❌ Configuration errors:', errors);
        alert('Please configure your API keys in config.js\n\nMissing:\n' + errors.join('\n'));
        return false;
    }
    
    console.log('✅ Configuration validated');
    return true;
}
