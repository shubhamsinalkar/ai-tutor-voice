// src/utils/audioUtils.js
export const createAuthenticatedAudioUrl = async (filename) => {
  if (!filename) {
    throw new Error('No filename provided');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const audioUrl = `${baseUrl}/api/voice/download/${filename}`;
  
  console.log('🎵 Fetching authenticated audio:', audioUrl);
  
  try {
    const response = await fetch(audioUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    console.log('✅ Created blob URL for audio:', blobUrl);
    return blobUrl;
  } catch (error) {
    console.error('❌ Error creating authenticated audio URL:', error);
    throw error;
  }
};

export const revokeAudioUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
