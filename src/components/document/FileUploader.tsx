// src/components/FileUploader.tsx

import React, { useState, useRef, useEffect } from 'react';
import { DocumentType } from './types';
import { X } from 'lucide-react';

interface FileUploaderProps {
  docType: DocumentType;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

function FileUploader({
  docType,
  onFileSelect,
  selectedFile
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up the object URL when the component unmounts or the file changes
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid file (PDF, JPG, PNG)';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelection = (file: File | null) => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }

    if (!file) {
      setError(null);
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    setError(null);
    onFileSelect(file);
    const url = URL.createObjectURL(file);
    setPreviewURL(file.type === 'application/pdf' ? `${url}#view=FitH` : url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelection(file || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelection(file || null);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileSelection(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragAreaClick = () => { fileInputRef.current?.click(); };
  const handlePreview = () => { if (selectedFile && previewURL) setShowPreview(true); };

  return (
    <div className="space-y-4">
      <input data-testid="file-input" ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />

      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleDragAreaClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver ? 'border-blue-500 bg-blue-50' : selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">{selectedFile ? 'File Selected' : `Drop your ${docType} document here`}</h3>
            {selectedFile ? (
              <div className="space-y-1"><p className="text-sm font-medium text-green-700">{selectedFile.name}</p><p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p><p className="text-xs text-blue-600">Click to change file</p></div>
            ) : (
              <div className="space-y-1"><p className="text-sm text-gray-600">or <span className="text-blue-600 font-medium">browse to choose a file</span></p><p className="text-xs text-gray-500">Supports PDF, JPG, PNG (max 10MB)</p></div>
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0"><svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></div>
              <div><p className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">{selectedFile.name}</p><p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p></div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handlePreview} className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium">Preview</button>
                <button onClick={handleRemoveFile} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" aria-label="Remove file">
                    <X size={20} />
                </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {showPreview && previewURL && selectedFile && (
         <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-md p-3 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <button className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-gray-800 hover:text-red-500 transition-colors z-10" onClick={() => setShowPreview(false)} aria-label="Close preview"><X className="w-6 h-6" /></button>
            <div className="pt-8 h-full">
              {selectedFile.type.startsWith('image/') ? (<img src={previewURL} alt="Preview" className="max-w-full max-h-[calc(90vh-4rem)] object-contain mx-auto" />)
              : selectedFile.type === 'application/pdf' ? (<iframe src={previewURL} title="PDF Preview" className="w-full h-full rounded" style={{ minHeight: '500px', height: 'calc(90vh - 4rem)' }} />)
              : (<p className="text-center text-sm text-gray-700">Preview not available for this file type.</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FileUploader;