// --- FILE: SelectedView.tsx ---

import React from 'react';
import { Upload, Check, FileText } from 'lucide-react'; // Import FileText

// Define UITicketOption locally since filePath is removed from the parent's version
interface UITicketOption {
  id: string;
  description: string;
  selected: boolean;
}

interface CustomButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface Props {
  ticketOptions: UITicketOption[];
  documentPaths?: string | string[]; // New prop for document URLs
  onPreviewTickets: (url: string) => void; // Updated function signature
  onUploadTickets?: () => void;
  onConfirmTicketOption?: () => void;
  buttons?: ('uploadTickets' | 'confirmTicketOption')[];
  customButtons?: CustomButton[];
}

const SelectedView: React.FC<Props> = ({
  ticketOptions,
  documentPaths = [], // Default to an empty array
  onPreviewTickets,
  onUploadTickets,
  onConfirmTicketOption,
  buttons = [],
  customButtons = [],
}) => {
  const selectedOption = ticketOptions.find(opt => opt.selected);

  const getPathsArray = (documentPaths: string[] | string) => {
    if (Array.isArray(documentPaths)) {
      return documentPaths;
    }
    if (typeof documentPaths === 'string') {
      try {
        const parsed = JSON.parse(documentPaths);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return documentPaths ? [documentPaths] : [];
      }
    }
    return [];
  };

  const paths = getPathsArray(documentPaths);
  // console.log("Paths:", paths);
  // paths.forEach((url, index) => console.log(index, url));

  const getDocName = (url: string, index: number) => {
      try {
          const filename = new URL(url).pathname.split('/').pop();
          return filename || `Ticket ${index + 1}`;
      } catch {
          return `Ticket ${index + 1}`;
      }
  }

  return (
    <div className="space-y-6">
      {ticketOptions.length === 0 ? (
        <p>No ticket options available yet.</p>
      ) : (
        <div className="space-y-2">
          {ticketOptions.map(option => (
            <div
              key={option.id}
              className={`p-4 border rounded-md transition-all duration-300 ${
                option.selected
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 border-2 shadow-lg'
                  : 'bg-white border-gray-200'
              }`}
            >
              {option.selected && (
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-md">
                  <Check size={12} />
                  Selected
                </div>
              )}
              <div className="relative z-10">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOption && (
        <div className="space-y-4">
          {/* ========================================================== */}
          {/* >> CHANGE 3c of 3: New dynamic document list << */}
          {/* ========================================================== */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Attached Tickets:</h4>
            {paths.length > 0 ? (
              <div className="space-y-2">
                {paths.map((docUrl, index) => (
                  <button
                    key={index}
                    onClick={() => onPreviewTickets(docUrl)} // Pass the specific URL
                    className="w-full flex items-center text-left gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{`Ticket Document ${index + 1}`}</p>
                      <p className="text-xs text-gray-500 truncate">{getDocName(docUrl, index)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No ticket documents have been uploaded for this option.</p>
            )}
          </div>
          
          {/* Section for other action buttons */}
          {(buttons.length > 0 || customButtons.length > 0) && (
            <div className="flex justify-end gap-3 border-t pt-4 mt-4">
              {buttons.includes('uploadTickets') && onUploadTickets && (
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                  onClick={onUploadTickets}
                >
                  <Upload size={18} /> Upload More
                </button>
              )}
              {buttons.includes('confirmTicketOption') && onConfirmTicketOption && (
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700"
                  onClick={onConfirmTicketOption}
                >
                  <Check size={18} /> Confirm Option
                </button>
              )}
              {customButtons.map((button, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${button.className || 'bg-gray-500 text-white hover:bg-gray-600'} ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={button.onClick}
                  disabled={button.disabled}
                >
                  {button.icon}
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedView;