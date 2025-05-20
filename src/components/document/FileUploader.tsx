import React, { useState } from "react";
import { Upload, FileText, Trash2, AlertCircle, X } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  showValidation?: boolean;
  selectedFile: File | null;
}

function FileUploader({
  onFileSelect,
  showValidation = false,
  selectedFile,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const handleFileChange = (file: File | null | undefined) => {
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setError("File size exceeds 10MB. Please upload a smaller file.");
        onFileSelect(null);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewURL(url);
      setError(null);
      onFileSelect(file);
    } else {
      setError(null);
      onFileSelect(null);
      setPreviewURL(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
    event.target.value = "";
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

  const displayError =
    error || (showValidation && !selectedFile ? "File is required." : null);

  const handlePreview = () => {
    if (selectedFile) setShowPreview(true);
  };

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
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

        {!selectedFile && (
          <label
            htmlFor="document"
            className={`cursor-pointer flex flex-col items-center ${
              isDragging ? "pointer-events-none" : ""
            }`}
          >
            <Upload className="h-8 w-8 text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PDF, JPG, or PNG (max. 10MB)
            </span>
          </label>
        )}

        {selectedFile && (
          <div
            className="flex items-center justify-between bg-gray-50 border rounded px-4 py-2 cursor-pointer"
            onClick={handlePreview}
          >
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // prevent preview from opening
                handleRemoveFile();
              }}
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Remove file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {displayError && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{displayError}</span>
          </div>
        )}
      </div>
      {showPreview && previewURL && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-slate-100 rounded-md shadow-md p-3 max-w-3xl w-full max-h-[90vh] overflow-auto border border-gray-300">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-6">
              {selectedFile?.type.startsWith('image/') ? (
                <img
                  src={previewURL}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : selectedFile?.type === 'application/pdf' ? (
                <iframe
                  src={previewURL}
                  title="PDF Preview"
                  className="w-full h-[70vh] rounded"
                ></iframe>
              ) : (
                <p className="text-center text-sm text-gray-700">Preview not available for this file type.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FileUploader;
