import React from 'react';
import { Download, X } from 'lucide-react';

interface TicketPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketUrl: string;
  downloadUrl: string;
}

const TicketPreviewModal: React.FC<TicketPreviewModalProps> = ({
  isOpen,
  onClose,
  ticketUrl,
  downloadUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-11/12 max-w-4xl h-[90vh] bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Ticket Preview</h3>
          <div className="flex items-center space-x-4">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 focus:outline-none"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-grow p-2 bg-gray-100">
          {ticketUrl ? (
            <iframe
              src={ticketUrl}
              title="Ticket Preview"
              className="w-full h-full border-0"
              frameBorder="0"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              Loading preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewModal;