// src/components/FileUploader.tsx

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { DocumentType } from './types';
import { X } from 'lucide-react';

// BackendDocumentRecord now uses Date | null for date fields
export interface BackendDocumentRecord {
  id: number;
  idType: string;
  userId: number;
  documentPath: string;
  uploadDate: Date; // Date object in frontend state after parsing
  createdBy: number;
  passportNumber?: string | null;
  passportIssueDate?: Date | null;
  passportExpiryDate?: Date | null;
  issuingCountry?: string | null;
  visaNumber?: string | null;
  visaIssueDate?: Date | null;
  visaExpiryDate?: Date | null;
  visaClass?: string | null;
  issuingPost?: string | null;
  aadharNumber?: string | null;
  aadharName?: string | null;
}

const parseDateString = (dateInput: string | Date | null | undefined): Date | null => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) {
            console.warn("Invalid date string received for parsing:", dateInput);
            return null;
        }
        return d;
    } catch (e) {
        console.warn("Error parsing date string:", dateInput, e);
        return null;
    }
};

interface FileUploaderProps {
  docType: DocumentType;
  onFileSelect: (file: File | null) => void;
  showValidation: boolean;
  selectedFile: File | null;
  onUploadError?: (error: string) => void;
  onRecordCreated: (record: BackendDocumentRecord, uploadedFile: File) => void; 
}

const saveDocumentPathToBackend = async (documentUrl: string, docType: DocumentType): Promise<BackendDocumentRecord> => {
  try {
    const apiPayload = {
      idType: docType.charAt(0).toUpperCase() + docType.slice(1),
      userId: 1, 
      documentPath: documentUrl,
      uploadDate: new Date().toISOString(),
      createdBy: 1, 
      passportNumber: "", 
      passportIssueDate: null, 
      passportExpiryDate: null,
      issuingCountry: "",
      visaNumber: "",
      visaIssueDate: null,
      visaExpiryDate: null,
      visaClass: "",
      issuingPost: "",
      aadharNumber: "",
      aadharName: "", 
    };
    
    const response = await axios.post<any>(
        'http://localhost:5030/api/Documents', 
        apiPayload, 
        { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, timeout: 15000 }
    );
    
    const rawData = response.data;
    if (!rawData || typeof rawData.id === 'undefined') {
      throw new Error('Backend response did not include an ID for the created record.');
    }
    const processedRecord: BackendDocumentRecord = {
        ...rawData,
        uploadDate: parseDateString(rawData.uploadDate) || new Date(0),
        passportIssueDate: parseDateString(rawData.passportIssueDate),
        passportExpiryDate: parseDateString(rawData.passportExpiryDate),
        visaIssueDate: parseDateString(rawData.visaIssueDate),
        visaExpiryDate: parseDateString(rawData.visaExpiryDate),
    };
    
    return processedRecord;
  } catch (error) {
    let errorMessage = 'Unknown server error during POST';
     if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Server error (${error.response.status})`;
        const responseData = error.response.data;
        if (responseData) {
          if (typeof responseData === 'string') errorMessage += `: ${responseData}`;
          else if (responseData.message) errorMessage += `: ${responseData.message}`;
          else if (responseData.error) errorMessage += `: ${responseData.error}`;
          else if (responseData.title) errorMessage += `: ${responseData.title}`;
          else if (responseData.errors) errorMessage += `: ${JSON.stringify(responseData.errors)}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error: Could not connect to server during POST';
      } else {
        errorMessage = `Request setup error during POST: ${error.message}`;
      }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

function FileUploader({ 
  docType, 
  onFileSelect, 
  showValidation, 
  selectedFile,
  onUploadError,
  onRecordCreated
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelection = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError); // Set internal state to show error message
      onFileSelect(null); // Inform parent the selection is invalid
      setPreviewURL(null);
      return;
    }
    // If valid, clear previous errors and update state
    setUploadError(null);
    onFileSelect(file);
    const url = URL.createObjectURL(file);
    setPreviewURL(file.type === 'application/pdf' ? `${url}#view=FitH` : url);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    } else { 
      onFileSelect(null); 
      setPreviewURL(null); 
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragAreaClick = () => { fileInputRef.current?.click(); };
  const handlePreview = () => { if (selectedFile && previewURL) setShowPreview(true); };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "firstUpload"); 
      const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dugfqlrog/auto/upload", { 
        method: "POST",
        body: formData,
      });
      const cloudinaryData = await cloudinaryResponse.json();
      if (cloudinaryData.secure_url) {
        setPreviewURL(selectedFile.type === 'application/pdf' ? `${cloudinaryData.secure_url}#view=FitH` : cloudinaryData.secure_url);
        try {
          const newRecord = await saveDocumentPathToBackend(cloudinaryData.secure_url, docType);
          onRecordCreated(newRecord, selectedFile);
        } catch (backendError: any) {
          const errorMessage = `File uploaded, but DB save failed: ${backendError.message}. Try saving details or re-upload.`;
          setUploadError(errorMessage);
          onUploadError?.(errorMessage);
        }
      } else {
        const cloudError = cloudinaryData.error?.message || "Cloudinary upload failed";
        setUploadError(`Failed to upload file to cloud: ${cloudError}. Please try again.`);
        onUploadError?.(`Cloudinary upload failed: ${cloudError}`);
      }
    } catch (error: any) {
      const generalErrorMessage = `Upload failed: ${error.message}. Please try again.`;
      setUploadError(generalErrorMessage);
      onUploadError?.(generalErrorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ --- data-testid added here --- ✅ */}
      <input data-testid="file-input" ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={isUploading} className="hidden" />
      
      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleDragAreaClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver ? 'border-blue-500 bg-blue-50' : selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <div><p className="text-sm font-medium text-gray-900">{selectedFile.name}</p><p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p></div>
            </div><button onClick={handlePreview} className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium">Preview</button>
          </div>
        </div>
      )}

      {showValidation && !selectedFile && !uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">Please select a file to upload</div>
        </div>
      )}

      {/* ✅ --- data-testid added here --- ✅ */}
      {uploadError && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{uploadError}</div>
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
      <div className="flex justify-end">
        <button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
            !selectedFile || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg'}`}>
          {isUploading ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Uploading...</span></>)
          : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" /></svg><span>Upload File</span></>)}
        </button>
      </div>
    </div>
  );
}
export default FileUploader;