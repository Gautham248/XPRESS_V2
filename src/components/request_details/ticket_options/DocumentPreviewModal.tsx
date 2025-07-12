import React from 'react';
import { Download, X, Trash2 } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentUrl: string;
  downloadUrl: string;
  onDelete?: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen, onClose, documentName, documentUrl, downloadUrl, onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="relative flex flex-col w-11/12 max-w-4xl h-[90vh] bg-white rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{documentName}</h3>
          <div className="flex items-center space-x-3">
            <a href={downloadUrl} download className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
            {onDelete && (
              <button onClick={onDelete} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-grow p-2 bg-gray-100">
          <iframe src={documentUrl} title={documentName} className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;