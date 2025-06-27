import React from 'react';
import { Upload, Check, FileText, Download, Ticket, Eye } from 'lucide-react';

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
  requestId: string;
  ticketOptions: UITicketOption[];
  documentPaths?: string | string[];
  onPreviewTickets: (url: string, index: number) => void;
  onUploadTickets?: () => void;
  onConfirmTicketOption?: () => void;
  buttons?: ('uploadTickets' | 'confirmTicketOption')[];
  customButtons?: CustomButton[];
}

const SelectedView: React.FC<Props> = ({
  requestId,
  ticketOptions,
  documentPaths = [],
  onPreviewTickets,
  onUploadTickets,
  onConfirmTicketOption,
  buttons = [],
  customButtons = [],
}) => {
  const selectedOption = ticketOptions.find(opt => opt.selected);

  const getPathsArray = (pathsArg: string[] | string): string[] => {
    if (Array.isArray(pathsArg)) return pathsArg;
    if (typeof pathsArg === 'string') {
      try {
        const parsed = JSON.parse(pathsArg);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [pathsArg].filter(Boolean);
      } catch (e) {
        return pathsArg ? [pathsArg] : [];
      }
    }
    return [];
  };

  const paths = getPathsArray(documentPaths);

  const getDocName = (url: string, index: number) => {
    try {
        const filename = new URL(url).pathname.split('/').pop();
        return filename || `Ticket Document ${index + 1}`;
    } catch {
        return `Ticket Document ${index + 1}`;
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
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 border-2 shadow-lg transform scale-100 relative overflow-hidden'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.selected && (
                <>
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-md">
                    <Check size={12} />
                    Selected
                  </div>
                  <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                </>
              )}
              <div className={`relative z-10 ${option.selected ? 'font-semibold text-slate-800 pr-20' : 'text-slate-600'}`}>
                {option.selected && (
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Selected Ticket</span>
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOption && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Attached Tickets:</h4>
            {paths.length > 0 ? (
              <div className="space-y-2">
                {paths.map((docUrl, index) => {
                  const downloadUrl = `http://localhost:5030/api/TravelRequest/${requestId}/downloadticket?index=${index}`;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div
                        onClick={() => onPreviewTickets(docUrl, index)}
                        className="flex items-center gap-3 flex-grow cursor-pointer"
                      >
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800">{`Ticket Document ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate">{getDocName(docUrl, index)}</p>
                        </div>
                      </div>

                      <a
                        href={downloadUrl}
                        download
                        title={`Download Ticket ${index + 1}`}
                        className="p-2 ml-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-blue-600 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  );
                })}
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
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  onClick={onUploadTickets}
                >
                  <Upload size={18} /> Upload More
                </button>
              )}
              {buttons.includes('confirmTicketOption') && onConfirmTicketOption && (
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  onClick={onConfirmTicketOption}
                >
                  <Check size={18} /> Confirm Option
                </button>
              )}
              {customButtons.map((button, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    button.className || 'bg-gray-500 text-white hover:bg-gray-600'
                  } ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
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