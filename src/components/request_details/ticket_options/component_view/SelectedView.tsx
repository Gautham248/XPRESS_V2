import React from 'react';
import { TicketOption } from '../../../../data/mockData';
import { Download, Upload, Check, Ticket } from 'lucide-react';

interface CustomButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface Props {
  ticketOptions: TicketOption[];
  onDownloadTickets?: () => void;
  onUploadTickets?: () => void;
  onConfirmTicketOption?: () => void;
  buttons?: ('downloadTickets' | 'uploadTickets' | 'confirmTicketOption')[];
  customButtons?: CustomButton[];
}

const SelectedView: React.FC<Props> = ({
  ticketOptions,
  onDownloadTickets,
  onUploadTickets,
  onConfirmTicketOption,
  buttons = [],
  customButtons = [],
}) => {
  const selectedOption = ticketOptions.find(opt => opt.selected);

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
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-md">
                    <Check size={12} />
                    Selected
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-600"></div>
                </>
              )}
              <div className={`relative z-10 ${option.selected ? 'font-semibold text-slate-800 pr-20' : 'text-slate-600'}`}>
                {option.selected && (
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Selected Ticket</span>
                  </div>
                )}
                {option.description}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedOption && (
        <div className="flex justify-end gap-3">
          {buttons.includes('downloadTickets') && onDownloadTickets && (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onDownloadTickets}
            >
              <Download size={18} /> Download Tickets
            </button>
          )}
          {buttons.includes('uploadTickets') && onUploadTickets && (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onUploadTickets}
            >
              <Upload size={18} /> Upload Tickets
            </button>
          )}
          {buttons.includes('confirmTicketOption') && onConfirmTicketOption && (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onConfirmTicketOption}
            >
              <Check size={18} /> Confirm Ticket Option
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
  );
};

export default SelectedView;