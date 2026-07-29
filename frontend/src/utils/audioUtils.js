// src/utils/audioUtils.js
export const createAuthenticatedAudioUrl = async (filename) => {
  if (!filename) {
    throw new Error('No filename provided');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // ✅ FIXED: Consistent URL construction
  const baseUrl = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE || window.location.origin)
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

  // Mistake i was doing              
  //const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  /* the above code will work in production as in prod as it "OR operator" it will (API_BASE)
     true and BE req will go to render but in locally as api base is true(because it is present) so the req 
     was going the render and not on my BE localhost which was mismatch of BE request   */

  // Remove trailing slash and ensure single /api path
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const audioUrl = `${cleanBaseUrl}/api/voice/download/${filename}`;

  console.log('🎵 Fetching authenticated audio:', audioUrl);

  try {
    const response = await fetch(audioUrl, {
      method: 'GET', // ✅ ADDED: Explicit method
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'audio/*' // ✅ ADDED: Accept header
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Audio fetch failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    // ✅ ADDED: Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('audio/')) {
      console.warn('⚠️ Unexpected content type:', contentType);
    }

    const blob = await response.blob();

    // ✅ ADDED: Check blob size
    if (blob.size === 0) {
      throw new Error('Received empty audio file');
    }

    const blobUrl = URL.createObjectURL(blob);

    console.log('✅ Created blob URL for audio:', blobUrl, `(${blob.size} bytes)`);
    return blobUrl;

  } catch (error) {
    console.error('❌ Error creating authenticated audio URL:', error);

    // ✅ ADDED: More specific error messages
    if (error.name === 'TypeError') {
      throw new Error('Network error - check if backend is running');
    }

    throw error;
  }
};

export const revokeAudioUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
      console.log('🗑️ Revoked blob URL:', url);
    } catch (error) {
      console.warn('Failed to revoke blob URL:', error);
    }
  }
};

// ✅ ADDED: Helper function to test audio endpoint
export const testAudioEndpoint = async () => {
  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE || window.location.origin)
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const testUrl = `${baseUrl.replace(/\/+$/, '')}/api/voice/health`;

  try {
    const response = await fetch(testUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('🔍 Audio endpoint test:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('❌ Audio endpoint test failed:', error);
    return false;
  }
};
