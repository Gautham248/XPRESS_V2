import React, { useState, useCallback, memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import FileUploader from './FileUploader'; // Assumes this is a reusable component

/**
 * The props for our new, generic document upload modal.
 */
interface UploadDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // The key difference: onConfirm returns an array of URLs, not complex ticket data.
    onConfirm: (fileUrls: string[]) => void;
    documentType: 'Accommodation' | 'Insurance';
}

// Your Cloudinary details
const CLOUDINARY_CLOUD_NAME = "dnwdvq7iv";
const CLOUDINARY_UPLOAD_PRESET = "TicketUpload"; // You can use the same preset

const UploadDocumentsModal: React.FC<UploadDocumentsModalProps> = memo(({
    isOpen,
    onClose,
    onConfirm,
    documentType,
}) => {
    // --- State Management ---
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // --- File Selection & Validation ---
    const handleFileSelect = useCallback((files: File[]) => {
        setUploadError(null);
        // Frontend validation for file size
        const oversizedFile = files.find(file => file.size > 10 * 1024 * 1024); // 10MB limit
        if (oversizedFile) {
            setUploadError(`Error: File "${oversizedFile.name}" exceeds the 10MB size limit.`);
            return;
        }
        setSelectedFiles(files);
    }, []);

    // --- Cloudinary Upload Logic (reused from your ticket modal) ---
    const uploadFileToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Cloudinary upload failed for ${file.name}`);
        }
        const data = await response.json();
        return data.secure_url;
    };

    // --- Modal Actions ---
    const handleClose = useCallback(() => {
        setSelectedFiles([]);
        setUploadError(null);
        setIsSubmitting(false);
        onClose();
    }, [onClose]);

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            setUploadError("Please select at least one document to upload.");
            return;
        }

        setIsSubmitting(true);
        setUploadError(null);

        try {
            // Upload all selected files to Cloudinary in parallel
            const uploadPromises = selectedFiles.map(file => uploadFileToCloudinary(file));
            const uploadedFileUrls = await Promise.all(uploadPromises);
            
            // Pass the array of resulting URLs to the parent component
            onConfirm(uploadedFileUrls);
            handleClose();

        } catch (error) {
            console.error("Error during Cloudinary upload process:", error);
            setUploadError(error instanceof Error ? error.message : "An unknown upload error occurred.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Upload {documentType} Documents</h2>
                    <button onClick={handleClose} disabled={isSubmitting} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        selectedFiles={selectedFiles}
                        showValidation={!!uploadError && selectedFiles.length === 0}
                    />
                    {uploadError && <p className="mt-1 text-xs text-red-600 text-center">{uploadError}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t">
                    <button onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-white border rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting || selectedFiles.length === 0} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center min-w-[120px] justify-center">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UploadDocumentsModal;