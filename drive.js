// Google Drive API Helper
// Handles image uploads to Google Drive

const GoogleDrive = {
    accessToken: null,
    folderId: null,
    
    // Initialize Google API
    async init() {
        return new Promise((resolve) => {
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.google.apiKey,
                        clientId: CONFIG.google.clientId,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                        scope: 'https://www.googleapis.com/auth/drive.file'
                    });
                    console.log('✅ Google Drive initialized');
                    resolve(true);
                } catch (error) {
                    console.error('❌ Google Drive init failed:', error);
                    resolve(false);
                }
            });
        });
    },
    
    // Sign in with Google
    async signIn() {
        try {
            const googleUser = await gapi.auth2.getAuthInstance().signIn();
            this.accessToken = googleUser.getAuthResponse().access_token;
            
            // Get or create DesignVault folder
            await this.ensureFolder();
            
            return googleUser;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    },
    
    // Sign out
    async signOut() {
        try {
            await gapi.auth2.getAuthInstance().signOut();
            this.accessToken = null;
            this.folderId = null;
        } catch (error) {
            console.error('Google sign out error:', error);
        }
    },
    
    // Check if signed in
    isSignedIn() {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    },
    
    // Get current user
    getCurrentUser() {
        if (!this.isSignedIn()) return null;
        return gapi.auth2.getAuthInstance().currentUser.get();
    },
    
    // Ensure DesignVault folder exists
    async ensureFolder() {
        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: `name='${CONFIG.google.driveFolder}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            if (response.result.files && response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
                console.log('✅ Found DesignVault folder:', this.folderId);
            } else {
                // Create folder
                const createResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: CONFIG.google.driveFolder,
                        mimeType: 'application/vnd.google-apps.folder'
                    },
                    fields: 'id'
                });
                this.folderId = createResponse.result.id;
                console.log('✅ Created DesignVault folder:', this.folderId);
            }
        } catch (error) {
            console.error('Folder error:', error);
            throw error;
        }
    },
    
    // Upload image to Drive
    async uploadImage(file, filename) {
        if (!this.accessToken) {
            throw new Error('Not authenticated with Google');
        }
        
        if (!this.folderId) {
            await this.ensureFolder();
        }
        
        try {
            // Create metadata
            const metadata = {
                name: filename || file.name,
                mimeType: file.type,
                parents: [this.folderId]
            };
            
            // Create form data
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);
            
            // Upload
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });
            
            if (!response.ok) {
                throw new Error('Upload failed: ' + response.statusText);
            }
            
            const data = await response.json();
            
            // Make file publicly accessible
            await this.makePublic(data.id);
            
            // Return direct image URL
            const imageUrl = `https://drive.google.com/uc?export=view&id=${data.id}`;
            
            console.log('✅ Image uploaded:', imageUrl);
            return {
                fileId: data.id,
                imageUrl: imageUrl,
                viewLink: data.webViewLink
            };
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },
    
    // Make file publicly accessible
    async makePublic(fileId) {
        try {
            await gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
        } catch (error) {
            console.error('Permission error:', error);
            // Non-fatal, continue anyway
        }
    },
    
    // Delete file from Drive
    async deleteFile(fileId) {
        if (!this.accessToken) return;
        
        try {
            await gapi.client.drive.files.delete({
                fileId: fileId
            });
            console.log('✅ File deleted from Drive:', fileId);
        } catch (error) {
            console.error('Delete error:', error);
            // Non-fatal
        }
    }
};

// Export for use in app
window.GoogleDrive = GoogleDrive;
