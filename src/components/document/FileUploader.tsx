import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null | undefined) => void;
  showValidation?: boolean; // New prop to trigger validation display
}

function FileUploader({ onFileSelect, showValidation = false }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Track drag state for visual feedback;pnkn; 

  const handleFileChange = (file: File | null | undefined) => {
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxSizeInBytes) {
        setError('File size exceeds 10MB. Please upload a smaller file.');
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setError(null);
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ;
    handleFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default behavior (e.g., opening the file)
    setIsDragging(true); // Show visual feedback
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false); // Remove visual feedback
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false); // Reset drag state
    const file = event.dataTransfer.files[0]; // Get the first dropped file
    handleFileChange(file);
  };

  // Determine the error message to display
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
      <label htmlFor="document" className="cursor-pointer flex flex-col items-center">
        <Upload className="h-8 w-8 text-gray-500 mb-2" />
        <span className="text-sm font-medium text-gray-700">
          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
        </span>
        <span className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max. 10MB)</span>
      </label>
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