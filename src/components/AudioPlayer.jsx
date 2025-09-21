import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { createAuthenticatedAudioUrl, revokeAudioUrl } from '../utils/audioUtils';

const AudioPlayer = ({ filename, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const audioRef = useRef(null);

  // Create authenticated audio URL when filename changes
  useEffect(() => {
    if (filename) {
      setLoading(true);
      setError(null);
      
      createAuthenticatedAudioUrl(filename)
        .then(url => {
          setBlobUrl(url);
          console.log('🎵 Audio ready for playback:', url);
        })
        .catch(err => {
          console.error('❌ Failed to create audio URL:', err);
          setError('Failed to load audio');
          onError?.('Audio authentication failed');
        })
        .finally(() => setLoading(false));
    }

    // Cleanup previous blob URL
    return () => {
      if (blobUrl) {
        revokeAudioUrl(blobUrl);
      }
    };
  }, [filename, onError]);

  const playAudio = async () => {
    if (!blobUrl) {
      onError?.('No audio URL available');
      return;
    }

    try {
      setError(null);

      if (!audioRef.current) {
        audioRef.current = new Audio(blobUrl);
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('❌ Audio playback error:', e);
          setError('Audio playback failed');
          setIsPlaying(false);
          onError?.('Audio playback failed');
        });

        audioRef.current.addEventListener('loadstart', () => {
          console.log('🎵 Audio loading started');
        });

        audioRef.current.addEventListener('canplay', () => {
          console.log('✅ Audio can play');
        });
      }

      await audioRef.current.play();
      setIsPlaying(true);
      console.log('🎶 Audio playing successfully');
    } catch (error) {
      console.error('❌ Audio play error:', error);
      setError(error.message);
      setIsPlaying(false);
      onError?.(`Audio error: ${error.message}`);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (blobUrl) {
        revokeAudioUrl(blobUrl);
      }
    };
  }, [blobUrl]);

  // Reset audio when blob URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [blobUrl]);

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <VolumeX className="h-4 w-4" />
        <span>Audio unavailable</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 text-sm">
        <div className="loading-spinner w-3 h-3 border-2"></div>
        <span>Loading audio...</span>
      </div>
    );
  }

  if (!blobUrl) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={isPlaying ? pauseAudio : playAudio}
        disabled={loading}
        className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors disabled:opacity-50"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {isPlaying ? 'Pause' : 'Play'} Audio
        </span>
      </button>
      
      {isPlaying && (
        <button
          onClick={resetAudio}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default AudioPlayer;
