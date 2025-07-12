'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Music, Upload, X, Check } from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: (linkId: string) => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string>('')
  
  const supabase = createClient()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      setSelectedFile(audioFile)
    } else {
      alert('Please upload an audio file')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file)
    } else {
      alert('Please upload an audio file')
    }
  }

  const generateLinkId = () => {
  // More robust ID generation with crypto API if available
  if (window.crypto && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36) + Date.now().toString(36);
  }
  // Fallback to original method if crypto not available
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

const uploadFile = async () => {
  if (!selectedFile) return;

  // Validate file before upload
  const validAudioTypes = [
    'audio/mpeg', 
    'audio/wav',
    'audio/x-wav',
    'audio/x-m4a',
    'audio/flac',
    'audio/aac',
    'audio/ogg'
  ];

  if (!validAudioTypes.includes(selectedFile.type)) {
    alert('Please upload a valid audio file (MP3, WAV, M4A, FLAC, AAC, or OGG)');
    return;
  }

  // 50MB file size limit
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  if (selectedFile.size > MAX_FILE_SIZE) {
    alert('File size exceeds 50MB limit');
    return;
  }

  setUploading(true);
  setProgress(0);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated - please sign in again');

    const linkId = generateLinkId();
    const sanitizedFilename = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${user.id}/${linkId}-${sanitizedFilename}`;

    // Real progress tracking
    const uploadProgress = (progress: number) => {
      setProgress(Math.min(90, Math.floor(progress * 90)));
    };

    // Upload to Supabase Storage with progress tracking
    let uploadedBytes = 0;
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      await supabase.storage
        .from('music-files')
        .upload(filePath, chunk, {
          upsert: i > 0, // Only upsert after first chunk
          contentType: selectedFile.type
        });

      uploadedBytes += chunk.size;
      setProgress(Math.min(90, Math.floor((uploadedBytes / selectedFile.size) * 100)));
    }

    // Save to database with additional metadata
    const { error: dbError } = await supabase
      .from('music_links')
      .insert({
        user_id: user.id,
        filename: selectedFile.name,
        file_path: filePath,
        link_id: linkId,
        is_premium: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        download_count: 0
      });

    if (dbError) throw dbError;

    // Finalize upload
    setProgress(100);
    setUploadComplete(true);
    setGeneratedLink(`${window.location.origin}/link/${linkId}`);
    onUploadComplete?.(linkId);

    // Track successful upload in analytics
    await supabase
      .from('upload_analytics')
      .insert({
        user_id: user.id,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        link_id: linkId
      });

  } catch (error: any) {
    console.error('Upload failed:', error);
    
    // More user-friendly error messages
    let errorMessage = 'Upload failed';
    if (error.message.includes('size exceeds')) {
      errorMessage = 'File too large (max 50MB)';
    } else if (error.message.includes('already exists')) {
      errorMessage = 'File with same name already exists';
    } else if (error.message.includes('Not authenticated')) {
      errorMessage = 'Session expired - please sign in again';
    }
    
    alert(`${errorMessage}: ${error.message}`);
  } finally {
    setUploading(false);
  }
}

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Link copied to clipboard!')
  }

  const reset = () => {
    setSelectedFile(null)
    setUploadComplete(false)
    setGeneratedLink('')
    setProgress(0)
  }

  if (uploadComplete) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
          <p className="text-gray-400 mb-4">Your secure link is ready</p>
          
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">Secure Link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded font-semibold text-sm transition-all"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-semibold transition-all"
            >
              Upload Another
            </button>
            <button
              onClick={() => window.open(generatedLink, '_blank')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded font-semibold transition-all"
            >
              Test Link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New Track</h2>
      
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging 
              ? 'border-cyan-400 bg-cyan-400/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Drag & drop your audio file here or click to browse
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supports MP3, WAV, FLAC, M4A (Max 50MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected File */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
            <Music className="h-8 w-8 text-cyan-400" />
            <div className="flex-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadFile}
            disabled={uploading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Create Secure Link'}
          </button>
        </div>
      )}
    </div>
  )
}