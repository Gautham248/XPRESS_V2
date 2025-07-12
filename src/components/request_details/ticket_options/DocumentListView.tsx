import React from 'react';
import { Button } from '@mui/material';
import { Upload, FileText, Download, Trash2, Loader2, Ban } from 'lucide-react';

interface DocumentListViewProps {
  documentType: 'Accommodation' | 'Insurance';
  documentPaths: string[];
  isModifiable: boolean;
  onUploadClick: () => void;
  onPreview: (path: string, index: number) => void;
  onDelete: (index: number) => void;
  isLoading: boolean;
}

const DocumentListView: React.FC<DocumentListViewProps> = ({
  documentType,
  documentPaths,
  isModifiable,
  onUploadClick,
  onPreview,
  onDelete,
  isLoading,
}) => {

  // Helper function to extract a readable name from a URL
  const getDocName = (url: string, index: number) => {
    try {
      // Decode the URL to handle characters like %2F
      const decodedUrl = decodeURIComponent(url);
      // Get the last part of the path
      const filename = new URL(decodedUrl).pathname.split('/').pop();
      return filename || `${documentType} Document ${index + 1}`;
    } catch {
      return `${documentType} Document ${index + 1}`;
    }
  };

  return (
    <div className="space-y-4 p-2">
      <h4 className="text-md font-semibold text-gray-800">{documentType} Documents</h4>
      
      {/* Conditionally render the list or a "not found" message */}
      {documentPaths.length > 0 ? (
        <div className="space-y-2">
          {documentPaths.map((path, index) => {
            // The download URL for these is the path itself
            const downloadUrl = path;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                {/* Main clickable area for previewing */}
                <div
                  onClick={() => onPreview(path, index)}
                  className="flex items-center gap-3 flex-grow cursor-pointer min-w-0" // min-w-0 prevents text overflow issues
                >
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-800">{`${documentType} Document ${index + 1}`}</p>
                    <p className="text-xs text-gray-500 truncate">{getDocName(path, index)}</p>
                  </div>
                </div>

                {/* Action buttons on the right */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {/* Delete Button */}
                  {isModifiable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                      title={`Delete ${documentType} Document ${index + 1}`}
                      className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}

                  {/* Download Button */}
                  <a
                    href={downloadUrl}
                    download
                    title={`Download ${documentType} Document ${index + 1}`}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // The placeholder view when no documents are present
        <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <Ban className="w-8 h-8 mb-2 text-gray-400"/>
            <p>No {documentType} documents have been uploaded.</p>
        </div>
      )}

      {/* Upload button at the bottom (only shows if modifiable) */}
      {isModifiable && (
        <div className="flex justify-center pt-4 border-t mt-4">
          <Button
            variant="contained"
            onClick={onUploadClick}
            startIcon={isLoading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
            disabled={isLoading}
          >
            {isLoading ? `Saving...` : `Upload New ${documentType} Doc`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentListView;