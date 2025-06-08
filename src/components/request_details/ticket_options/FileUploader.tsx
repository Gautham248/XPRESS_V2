import React, { useCallback, useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  showValidation?: boolean;
  selectedFile: File | null;
  onUpload?: (file: File) => Promise<string>; // Optional cloud upload function
  isUploading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  showValidation = false,
  selectedFile,
  onUpload,
  isUploading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(() => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelect]);

  const handleUpload = useCallback(async () => {
    if (selectedFile && onUpload) {
      try {
        const fileUrl = await onUpload(selectedFile);
        console.log('File uploaded to:', fileUrl);
        // You might want to pass this URL back to the parent component
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  }, [selectedFile, onUpload]);

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : showValidation
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="hidden"
          accept="application/pdf"
          onChange={handleChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud
            className={`w-8 h-8 ${
              dragActive ? 'text-blue-500' : showValidation ? 'text-red-400' : 'text-gray-400'
            }`}
          />
          <div className="text-sm">
            <button
              type="button"
              onClick={handleButtonClick}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              Click to upload
            </button>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">PDF only (max. 10MB)</p>
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center space-x-2 overflow-hidden">
            <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="truncate">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onUpload && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                title="Upload to cloud"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-red-500 hover:text-red-700"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showValidation && !selectedFile && (
        <p className="mt-1 text-xs text-red-600">Please select a PDF file to upload</p>
      )}
    </div>
  );
};

export default FileUploader;