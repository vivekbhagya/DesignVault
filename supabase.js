// Supabase Database Helper
// Handles all database operations

const SupabaseDB = {
    client: null,
    currentUser: null,
    
    // Initialize Supabase client
    init() {
        if (!validateConfig()) return false;
        
        try {
            this.client = supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.anonKey
            );
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            console.error('❌ Supabase init failed:', error);
            return false;
        }
    },
    
    // Get current session
    async getSession() {
        const { data, error } = await this.client.auth.getSession();
        if (error) {
            console.error('Get session error:', error);
            return null;
        }
        return data.session;
    },
    
    // Set current user
    setUser(user) {
        this.currentUser = user;
    },
    
    // Get all ideas for current user
    async getIdeas() {
        if (!this.currentUser) return [];
        
        const { data, error } = await this.client
            .from('ideas')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Get ideas error:', error);
            return [];
        }
        
        return data || [];
    },
    
    // Create new idea
    async createIdea(ideaData) {
        if (!this.currentUser) throw new Error('Not authenticated');
        
        const { data, error } = await this.client
            .from('ideas')
            .insert([{
                user_id: this.currentUser.id,
                ...ideaData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Create idea error:', error);
            throw error;
        }
        
        return data;
    },
    
    // Update existing idea
    async updateIdea(id, updates) {
        if (!this.currentUser) throw new Error('Not authenticated');
        
        const { data, error } = await this.client
            .from('ideas')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', this.currentUser.id)
            .select()
            .single();
        
        if (error) {
            console.error('Update idea error:', error);
            throw error;
        }
        
        return data;
    },
    
    // Delete idea
    async deleteIdea(id) {
        if (!this.currentUser) throw new Error('Not authenticated');
        
        const { error } = await this.client
            .from('ideas')
            .delete()
            .eq('id', id)
            .eq('user_id', this.currentUser.id);
        
        if (error) {
            console.error('Delete idea error:', error);
            throw error;
        }
        
        return true;
    },
    
    // Search ideas
    async searchIdeas(query) {
        if (!this.currentUser) return [];
        
        const { data, error } = await this.client
            .from('ideas')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,technique_notes.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Search error:', error);
            return [];
        }
        
        return data || [];
    },
    
    // Filter by tags
    async filterByTags(tags) {
        if (!this.currentUser || !tags.length) return this.getIdeas();
        
        const { data, error } = await this.client
            .from('ideas')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .contains('tags', tags)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Filter error:', error);
            return [];
        }
        
        return data || [];
    }
};

// Export for use in app
window.SupabaseDB = SupabaseDB;
