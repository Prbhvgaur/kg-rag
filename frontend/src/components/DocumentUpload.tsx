import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { colors } from '../lib/design'
import { api } from '../lib/api'

interface DocumentUploadProps {
  onUploadStarted: (jobId: string) => void
  onUploadError: (error: string) => void
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadStarted, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    if (file.size > 20 * 1024 * 1024) {
      onUploadError('File is too large (max 20MB)')
      return
    }

    setIsUploading(true)
    setProgress(10) // Initial progress

    try {
      const result = await api.documents.upload(file)
      if (result.success && result.data) {
        onUploadStarted(result.data.job_id)
      } else {
        onUploadError(result.error || 'Upload failed')
      }
    } catch (err) {
      onUploadError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }, [onUploadStarted, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isUploading
  })

  return (
    <div 
      {...getRootProps()} 
      className={`relative p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center group
        ${isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 hover:border-amber-500/50 hover:bg-white/5'}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
        <div>
          <p className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {isUploading ? 'Uploading...' : isDragActive ? 'Drop it here!' : 'Drag & drop your PDF'}
          </p>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            {isUploading ? 'Sending file to server...' : 'or click to browse cables (Max 20MB)'}
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-500 animate-pulse">
            Processing...
          </p>
        </div>
      )}
    </div>
  )
}
