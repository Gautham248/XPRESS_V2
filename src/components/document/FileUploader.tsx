import React, { useState } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  showValidation?: boolean;
  selectedFile: File | null;
}

function FileUploader({ onFileSelect, showValidation = false, selectedFile }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null | undefined) => {
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setError('File size exceeds 10MB. Please upload a smaller file.');
        onFileSelect(null);
        return;
      }

      setError(null);
      onFileSelect(file);
    } else {
      setError(null);
      onFileSelect(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0] ?? null;
    handleFileChange(file);
  };

  const handleRemoveFile = () => {
    handleFileChange(null);
  };

  const displayError = error || (showValidation && !selectedFile ? 'File is required.' : null);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="document"
        className="hidden"
        onChange={handleInputChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <label
        htmlFor="document"
        className={`cursor-pointer flex flex-col items-center ${
          isDragging ? 'pointer-events-none' : ''
        }`} // Disable click during drag
      >
        <Upload className="h-8 w-8 text-gray-500 mb-2" />
        <span className="text-sm font-medium text-gray-700">
          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
        </span>
        <span className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max. 10MB)</span>
      </label>
      {selectedFile && (
        <button
          type="button"
          onClick={handleRemoveFile}
          className="mt-2 text-gray-500 hover:text-red-600 transition-colors"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {displayError && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploader;