import React, { useCallback, useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  /**
   * Callback function triggered when files are selected or removed.
   * @param files The updated array of selected File objects.
   */
  onFileSelect: (files: File[]) => void;
  /**
   * The currently selected files to display.
   */
  selectedFiles: File[];
  /**
   * Optional async function to handle the upload of a single file.
   * The parent component is responsible for managing the upload state.
   * @param file The file to upload.
   * @returns A promise that resolves with the uploaded file's URL or identifier.
   */
  onUpload?: (file: File) => Promise<string>;
  /**
   * An array of file names that are currently in the process of uploading.
   * Used to show a loading state for individual files.
   */
  uploadingFiles?: string[];
  /**
   * If true, displays a validation error message when no files are selected.
   */
  showValidation?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  selectedFiles,
  onUpload,
  uploadingFiles = [],
  showValidation = false,
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

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files).filter(
        (file) => file.type === 'application/pdf'
      );

      if (newFiles.length === 0) return;

      // Prevent adding duplicate files based on name
      const currentFileNames = new Set(selectedFiles.map((f) => f.name));
      const uniqueNewFiles = newFiles.filter(
        (file) => !currentFileNames.has(file.name)
      );

      if (uniqueNewFiles.length > 0) {
        onFileSelect([...selectedFiles, ...uniqueNewFiles]);
      }
    },
    [onFileSelect, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      processFiles(e.target.files);
    },
    [processFiles]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (fileToRemove: File) => {
      const updatedFiles = selectedFiles.filter((file) => file !== fileToRemove);
      onFileSelect(updatedFiles);
      // Allows re-selecting the same file after removing it
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedFiles, onFileSelect]
  );

  const handleUpload = useCallback(
    async (fileToUpload: File) => {
      if (onUpload) {
        try {
          const fileUrl = await onUpload(fileToUpload);
          console.log(`File '${fileToUpload.name}' uploaded to:`, fileUrl);
          // The parent component should handle success state (e.g., removing from list or showing a checkmark)
        } catch (error) {
          console.error(`Upload failed for '${fileToUpload.name}':`, error);
          // The parent component should handle the error state
        }
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : showValidation && selectedFiles.length === 0
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
          multiple // <-- Allow multiple file selection
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud
            className={`w-8 h-8 ${
              dragActive
                ? 'text-blue-500'
                : showValidation && selectedFiles.length === 0
                ? 'text-red-400'
                : 'text-gray-400'
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
          <p className="text-xs text-gray-500">PDFs only (max. 10MB per file)</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
          {selectedFiles.map((file) => {
            const isUploading = uploadingFiles.includes(file.name);
            return (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {onUpload && (
                    <button
                      type="button"
                      onClick={() => handleUpload(file)}
                      disabled={isUploading}
                      className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => removeFile(file)}
                    disabled={isUploading}
                    className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showValidation && selectedFiles.length === 0 && (
        <p className="mt-1 text-xs text-red-600">Please select at least one PDF file to upload.</p>
      )}
    </div>
  );
};

export default FileUploader;