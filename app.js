// DesignVault Main Application
// Manages UI state and coordinates between Drive and Supabase

const App = {
    state: {
        ideas: [],
        filteredIdeas: [],
        activeTags: [],
        currentIdea: null,
        editMode: false
    },
    
    elements: {},
    
    // Initialize app
    async init() {
        console.log('🚀 Initializing DesignVault...');
        
        // Get DOM elements
        this.cacheElements();
        
        // Attach event listeners
        this.attachEvents();
        
        // Initialize services
        if (!SupabaseDB.init()) {
            alert('Failed to initialize database. Please check your configuration.');
            return;
        }
        
        const driveReady = await GoogleDrive.init();
        
        
        // Check for existing session
        await this.checkAuth();
    },
    
    // Cache DOM elements
    cacheElements() {
        // Screens
        this.elements.authScreen = document.getElementById('authScreen');
        this.elements.appScreen = document.getElementById('appScreen');
        
        // Auth
        this.elements.googleSignIn = document.getElementById('googleSignIn');
        this.elements.signOutBtn = document.getElementById('signOutBtn');
        this.elements.userAvatar = document.getElementById('userAvatar');
        
        // Header
        this.elements.searchInput = document.getElementById('searchInput');
        this.elements.addBtn = document.getElementById('addBtn');
        
        // Sidebar
        this.elements.tagFilters = document.getElementById('tagFilters');
        this.elements.clearFilters = document.getElementById('clearFilters');
        this.elements.totalIdeas = document.getElementById('totalIdeas');
        
        // Content
        this.elements.loadingState = document.getElementById('loadingState');
        this.elements.emptyState = document.getElementById('emptyState');
        this.elements.ideasGrid = document.getElementById('ideasGrid');
        
        // Modals
        this.elements.ideaModal = document.getElementById('ideaModal');
        this.elements.viewModal = document.getElementById('viewModal');
        
        // Form elements
        this.elements.ideaForm = document.getElementById('ideaForm');
        this.elements.uploadArea = document.getElementById('uploadArea');
        this.elements.imageInput = document.getElementById('imageInput');
        this.elements.uploadPrompt = document.getElementById('uploadPrompt');
        this.elements.imagePreview = document.getElementById('imagePreview');
        this.elements.previewImg = document.getElementById('previewImg');
        this.elements.removeImage = document.getElementById('removeImage');
        this.elements.titleInput = document.getElementById('titleInput');
        this.elements.descInput = document.getElementById('descInput');
        this.elements.tagInput = document.getElementById('tagInput');
        this.elements.tagsList = document.getElementById('tagsList');
        this.elements.sourceInput = document.getElementById('sourceInput');
        this.elements.colorInput = document.getElementById('colorInput');
        this.elements.addColorBtn = document.getElementById('addColorBtn');
        this.elements.colorsList = document.getElementById('colorsList');
        this.elements.techniqueInput = document.getElementById('techniqueInput');
        this.elements.ideaId = document.getElementById('ideaId');
        this.elements.saveBtn = document.getElementById('saveBtn');
        this.elements.cancelBtn = document.getElementById('cancelBtn');
        this.elements.saveBtnText = document.getElementById('saveBtnText');
        this.elements.saveBtnLoader = document.getElementById('saveBtnLoader');
        this.elements.modalTitle = document.getElementById('modalTitle');
    },
    
    // Attach event listeners
    attachEvents() {
        // Auth
        this.elements.googleSignIn.addEventListener('click', () => this.handleSignIn());
        this.elements.signOutBtn.addEventListener('click', () => this.handleSignOut());
        
        // Header
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.addBtn.addEventListener('click', () => this.openAddModal());
        
        // Sidebar
        this.elements.clearFilters.addEventListener('click', () => this.clearFilters());
        
        // Upload
        this.elements.uploadArea.addEventListener('click', () => this.elements.imageInput.click());
        this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.elements.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        this.elements.removeImage.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeSelectedImage();
        });
        
        // Tags
        this.elements.tagInput.addEventListener('keydown', (e) => this.handleTagInput(e));
        document.querySelectorAll('.tag-suggestion').forEach(el => {
            el.addEventListener('click', (e) => this.addTag(e.target.dataset.tag));
        });
        
        // Colors
        this.elements.addColorBtn.addEventListener('click', () => this.addColor());
        this.elements.colorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addColor();
            }
        });
        
        // Modal
        this.elements.saveBtn.addEventListener('click', () => this.saveIdea());
        this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
        document.querySelectorAll('.modal-close').forEach(el => {
            el.addEventListener('click', () => this.closeModal());
        });
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.addEventListener('click', () => this.closeModal());
        });
        
        // View modal actions
        document.getElementById('editIdeaBtn').addEventListener('click', () => {
            this.closeViewModal();
            this.openEditModal(this.state.currentIdea);
        });
        document.getElementById('deleteIdeaBtn').addEventListener('click', () => this.handleDelete());
    },
    
    // Check authentication
    async checkAuth() {
        const session = await SupabaseDB.getSession();
        
        if (session && GoogleDrive.isSignedIn()) {
            await this.handleAuthSuccess();
        } else {
            this.showAuthScreen();
        }
    },
    
    // Handle sign in
async handleSignIn() {
    try {
        const { data, error } = await SupabaseDB.client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/drive.file',
                redirectTo: window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000' 
                    : window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please try again.');
    }
},
    
    // Handle successful auth
    async handleAuthSuccess() {
        const session = await SupabaseDB.getSession();
        if (!session) return;
        
        SupabaseDB.setUser(session.user);
        
        const googleUser = GoogleDrive.getCurrentUser();
        if (googleUser) {
            const profile = googleUser.getBasicProfile();
            this.elements.userAvatar.src = profile.getImageUrl();
        }
        
        this.showAppScreen();
        await this.loadIdeas();
    },
    
    // Handle sign out
    async handleSignOut() {
        await GoogleDrive.signOut();
        await SupabaseDB.client.auth.signOut();
        this.showAuthScreen();
        this.state.ideas = [];
        this.state.filteredIdeas = [];
    },
    
    // Show auth screen
    showAuthScreen() {
        this.elements.authScreen.classList.remove('hidden');
        this.elements.appScreen.classList.add('hidden');
    },
    
    // Show app screen
    showAppScreen() {
        this.elements.authScreen.classList.add('hidden');
        this.elements.appScreen.classList.remove('hidden');
    },
    
    // Load all ideas
    async loadIdeas() {
        this.showLoading();
        
        try {
            this.state.ideas = await SupabaseDB.getIdeas();
            this.state.filteredIdeas = [...this.state.ideas];
            this.renderIdeas();
            this.updateStats();
            this.renderTagFilters();
        } catch (error) {
            console.error('Load ideas error:', error);
            alert('Failed to load ideas.');
        }
    },
    
    // Show loading state
    showLoading() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.emptyState.classList.add('hidden');
        this.elements.ideasGrid.classList.add('hidden');
    },
    
    // Render ideas grid
    renderIdeas() {
        this.elements.loadingState.classList.add('hidden');
        
        if (this.state.filteredIdeas.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.ideasGrid.classList.add('hidden');
            return;
        }
        
        this.elements.emptyState.classList.add('hidden');
        this.elements.ideasGrid.classList.remove('hidden');
        
        this.elements.ideasGrid.innerHTML = this.state.filteredIdeas.map(idea => `
            <div class="idea-card" data-id="${idea.id}">
                <img src="${idea.image_url}" alt="${idea.title || 'Idea'}" class="idea-image" />
                <div class="idea-content">
                    ${idea.title ? `<h3 class="idea-title">${this.escapeHtml(idea.title)}</h3>` : ''}
                    ${idea.description ? `<p class="idea-desc">${this.escapeHtml(idea.description)}</p>` : ''}
                    ${idea.tags && idea.tags.length > 0 ? `
                        <div class="idea-tags">
                            ${idea.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Attach click handlers
        document.querySelectorAll('.idea-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const idea = this.state.ideas.find(i => i.id === id);
                if (idea) this.openViewModal(idea);
            });
        });
    },
    
    // Update stats
    updateStats() {
        this.elements.totalIdeas.textContent = this.state.ideas.length;
    },
    
    // Render tag filters
    renderTagFilters() {
        const allTags = new Set();
        this.state.ideas.forEach(idea => {
            if (idea.tags) {
                idea.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        if (allTags.size === 0) {
            this.elements.tagFilters.innerHTML = '<p style="color: var(--text-light); font-size: 0.875rem;">No tags yet</p>';
            return;
        }
        
        this.elements.tagFilters.innerHTML = Array.from(allTags).map(tag => `
            <label class="filter-tag ${this.state.activeTags.includes(tag) ? 'active' : ''}">
                <input type="checkbox" ${this.state.activeTags.includes(tag) ? 'checked' : ''} data-tag="${tag}" />
                <span>${this.escapeHtml(tag)}</span>
            </label>
        `).join('');
        
        // Attach handlers
        this.elements.tagFilters.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => this.handleTagFilter(e.target.dataset.tag, e.target.checked));
        });
    },
    
    // Handle tag filter
    handleTagFilter(tag, checked) {
        if (checked) {
            this.state.activeTags.push(tag);
        } else {
            this.state.activeTags = this.state.activeTags.filter(t => t !== tag);
        }
        
        this.applyFilters();
    },
    
    // Clear filters
    clearFilters() {
        this.state.activeTags = [];
        this.applyFilters();
        this.renderTagFilters();
    },
    
    // Apply filters
    applyFilters() {
        if (this.state.activeTags.length === 0) {
            this.state.filteredIdeas = [...this.state.ideas];
        } else {
            this.state.filteredIdeas = this.state.ideas.filter(idea => {
                return this.state.activeTags.some(tag => idea.tags && idea.tags.includes(tag));
            });
        }
        
        this.renderIdeas();
    },
    
    // Handle search
    async handleSearch(query) {
        if (!query.trim()) {
            this.state.filteredIdeas = [...this.state.ideas];
            this.renderIdeas();
            return;
        }
        
        const results = await SupabaseDB.searchIdeas(query);
        this.state.filteredIdeas = results;
        this.renderIdeas();
    },
    
    // Open add modal
    openAddModal() {
        this.state.editMode = false;
        this.state.currentIdea = null;
        this.elements.modalTitle.textContent = 'Add New Idea';
        this.elements.saveBtnText.textContent = 'Save Idea';
        this.resetForm();
        this.elements.ideaModal.classList.remove('hidden');
    },
    
    // Open edit modal
    openEditModal(idea) {
        this.state.editMode = true;
        this.state.currentIdea = idea;
        this.elements.modalTitle.textContent = 'Edit Idea';
        this.elements.saveBtnText.textContent = 'Update Idea';
        this.populateForm(idea);
        this.elements.ideaModal.classList.remove('hidden');
    },
    
    // Open view modal
    openViewModal(idea) {
        this.state.currentIdea = idea;
        
        document.getElementById('viewTitle').textContent = idea.title || 'Untitled';
        document.getElementById('viewImage').src = idea.image_url;
        
        const details = document.querySelector('.view-details');
        details.innerHTML = '';
        
        if (idea.description) {
            details.innerHTML += `
                <div class="view-section">
                    <h4>Description</h4>
                    <p>${this.escapeHtml(idea.description)}</p>
                </div>
            `;
        }
        
        if (idea.tags && idea.tags.length > 0) {
            details.innerHTML += `
                <div class="view-section">
                    <h4>Tags</h4>
                    <div class="idea-tags">
                        ${idea.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (idea.source_url) {
            details.innerHTML += `
                <div class="view-section">
                    <h4>Source</h4>
                    <p><a href="${idea.source_url}" target="_blank" style="color: var(--primary)">${idea.source_url}</a></p>
                </div>
            `;
        }
        
        if (idea.color_palette && idea.color_palette.length > 0) {
            details.innerHTML += `
                <div class="view-section">
                    <h4>Color Palette</h4>
                    <div class="colors-list">
                        ${idea.color_palette.map(color => `
                            <div class="color-item">
                                <div class="color-swatch" style="background: ${color}"></div>
                                <span class="color-code">${color}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (idea.technique_notes) {
            details.innerHTML += `
                <div class="view-section">
                    <h4>Technique Notes</h4>
                    <p>${this.escapeHtml(idea.technique_notes)}</p>
                </div>
            `;
        }
        
        details.innerHTML += `
            <div class="view-section timestamp">
                <p>Created ${this.formatDate(idea.created_at)}</p>
            </div>
        `;
        
        this.elements.viewModal.classList.remove('hidden');
    },
    
    // Close view modal
    closeViewModal() {
        this.elements.viewModal.classList.add('hidden');
    },
    
    // Close modal
    closeModal() {
        this.elements.ideaModal.classList.add('hidden');
        this.elements.viewModal.classList.add('hidden');
        this.resetForm();
    },
    
    // Reset form
    resetForm() {
        this.elements.ideaForm.reset();
        this.elements.uploadPrompt.classList.remove('hidden');
        this.elements.imagePreview.classList.add('hidden');
        this.elements.previewImg.src = '';
        this.elements.tagsList.innerHTML = '';
        this.elements.colorsList.innerHTML = '';
        this.elements.ideaId.value = '';
    },
    
    // Populate form
    populateForm(idea) {
        this.elements.ideaId.value = idea.id;
        this.elements.titleInput.value = idea.title || '';
        this.elements.descInput.value = idea.description || '';
        this.elements.sourceInput.value = idea.source_url || '';
        this.elements.techniqueInput.value = idea.technique_notes || '';
        
        // Show image preview
        this.elements.previewImg.src = idea.image_url;
        this.elements.uploadPrompt.classList.add('hidden');
        this.elements.imagePreview.classList.remove('hidden');
        
        // Populate tags
        if (idea.tags) {
            idea.tags.forEach(tag => this.addTag(tag));
        }
        
        // Populate colors
        if (idea.color_palette) {
            idea.color_palette.forEach(color => this.addColorToList(color));
        }
    },
    
    // Handle drag over
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.uploadArea.classList.add('drag-over');
    },
    
    // Handle drop
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.displayImagePreview(files[0]);
        }
    },
    
    // Handle image select
    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.displayImagePreview(file);
        }
    },
    
    // Display image preview
    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.elements.previewImg.src = e.target.result;
            this.elements.uploadPrompt.classList.add('hidden');
            this.elements.imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    },
    
    // Remove selected image
    removeSelectedImage() {
        this.elements.imageInput.value = '';
        this.elements.previewImg.src = '';
        this.elements.uploadPrompt.classList.remove('hidden');
        this.elements.imagePreview.classList.add('hidden');
    },
    
    // Handle tag input
    handleTagInput(e) {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            this.addTag(e.target.value.trim());
            e.target.value = '';
        }
    },
    
    // Add tag
    addTag(tag) {
        tag = tag.toLowerCase();
        
        // Check if already added
        const existing = Array.from(this.elements.tagsList.children).find(
            el => el.dataset.tag === tag
        );
        if (existing) return;
        
        const tagEl = document.createElement('div');
        tagEl.className = 'tag-item';
        tagEl.dataset.tag = tag;
        tagEl.innerHTML = `
            <span>${this.escapeHtml(tag)}</span>
            <button type="button" class="tag-remove">&times;</button>
        `;
        
        tagEl.querySelector('.tag-remove').addEventListener('click', () => tagEl.remove());
        this.elements.tagsList.appendChild(tagEl);
    },
    
    // Add color
    addColor() {
        const color = this.elements.colorInput.value.trim();
        if (!color) return;
        
        // Validate hex color
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            alert('Please enter a valid hex color (e.g., #FF5733)');
            return;
        }
        
        this.addColorToList(color);
        this.elements.colorInput.value = '';
    },
    
    // Add color to list
    addColorToList(color) {
        // Check if already added
        const existing = Array.from(this.elements.colorsList.children).find(
            el => el.dataset.color === color
        );
        if (existing) return;
        
        const colorEl = document.createElement('div');
        colorEl.className = 'color-item';
        colorEl.dataset.color = color;
        colorEl.innerHTML = `
            <div class="color-swatch" style="background: ${color}"></div>
            <span class="color-code">${color}</span>
            <button type="button" class="color-remove">&times;</button>
        `;
        
        colorEl.querySelector('.color-remove').addEventListener('click', () => colorEl.remove());
        this.elements.colorsList.appendChild(colorEl);
    },
    
    // Save idea
    async saveIdea() {
        // Validate
        const hasImage = this.state.editMode || this.elements.imageInput.files.length > 0;
        if (!hasImage) {
            alert('Please select an image');
            return;
        }
        
        // Show loading
        this.elements.saveBtn.disabled = true;
        this.elements.saveBtnText.classList.add('hidden');
        this.elements.saveBtnLoader.classList.remove('hidden');
        
        try {
            let imageUrl = this.state.editMode ? this.state.currentIdea.image_url : null;
            
            // Upload new image if provided
            if (this.elements.imageInput.files.length > 0) {
                const file = this.elements.imageInput.files[0];
                const timestamp = Date.now();
                const filename = `${timestamp}_${file.name}`;
                
                const result = await GoogleDrive.uploadImage(file, filename);
                imageUrl = result.imageUrl;
            }
            
            // Collect tags
            const tags = Array.from(this.elements.tagsList.children).map(el => el.dataset.tag);
            
            // Collect colors
            const colors = Array.from(this.elements.colorsList.children).map(el => el.dataset.color);
            
            // Prepare data
            const ideaData = {
                image_url: imageUrl,
                title: this.elements.titleInput.value.trim() || null,
                description: this.elements.descInput.value.trim() || null,
                tags: tags.length > 0 ? tags : null,
                source_url: this.elements.sourceInput.value.trim() || null,
                color_palette: colors.length > 0 ? colors : null,
                technique_notes: this.elements.techniqueInput.value.trim() || null
            };
            
            if (this.state.editMode) {
                await SupabaseDB.updateIdea(this.state.currentIdea.id, ideaData);
            } else {
                await SupabaseDB.createIdea(ideaData);
            }
            
            this.closeModal();
            await this.loadIdeas();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save idea. Please try again.');
        } finally {
            this.elements.saveBtn.disabled = false;
            this.elements.saveBtnText.classList.remove('hidden');
            this.elements.saveBtnLoader.classList.add('hidden');
        }
    },
    
    // Handle delete
    async handleDelete() {
        if (!confirm('Are you sure you want to delete this idea?')) return;
        
        try {
            await SupabaseDB.deleteIdea(this.state.currentIdea.id);
            this.closeViewModal();
            await this.loadIdeas();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete idea.');
        }
    },
    
    // Utility: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Utility: Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return date.toLocaleDateString();
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => App.init());
