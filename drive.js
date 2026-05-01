// Google Drive API Helper - Updated for Google Identity Services
// Handles image uploads to Google Drive

const GoogleDrive = {
    accessToken: null,
    folderId: null,
    tokenClient: null,
    
    // Initialize Google API
    async init() {
        return new Promise((resolve) => {
            // Initialize Google API client
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.google.apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                    });
                    
                    // Initialize token client for OAuth
                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CONFIG.google.clientId,
                        scope: 'https://www.googleapis.com/auth/drive.file',
                        callback: '', // Will be set per request
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
        return new Promise((resolve, reject) => {
            try {
                // Request access token
                this.tokenClient.callback = async (response) => {
                    if (response.error !== undefined) {
                        reject(response);
                        return;
                    }
                    
                    this.accessToken = response.access_token;
                    
                    // Get or create folder
                    await this.ensureFolder();
                    
                    // Return user info
                    const userInfo = {
                        getBasicProfile: () => ({
                            getName: () => 'User',
                            getEmail: () => '',
                            getImageUrl: () => ''
                        }),
                        getAuthResponse: () => ({
                            access_token: this.accessToken,
                            id_token: response.id_token || ''
                        })
                    };
                    
                    resolve(userInfo);
                };
                
                // Request token
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (error) {
                console.error('Google sign in error:', error);
                reject(error);
            }
        });
    },
    
    // Sign out
    async signOut() {
        try {
            if (this.accessToken) {
                google.accounts.oauth2.revoke(this.accessToken);
            }
            this.accessToken = null;
            this.folderId = null;
        } catch (error) {
            console.error('Google sign out error:', error);
        }
    },
    
    // Check if signed in
    isSignedIn() {
        return this.accessToken !== null;
    },
    
    // Get current user (simplified)
    getCurrentUser() {
        if (!this.isSignedIn()) return null;
        return {
            getBasicProfile: () => ({
                getImageUrl: () => ''
            })
        };
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
