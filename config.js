// DesignVault Configuration
// Follow setup guides to fill these values

const CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID',
        apiKey: 'YOUR_GOOGLE_API_KEY',
        driveFolder: 'DesignVault'
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
