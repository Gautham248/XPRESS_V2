import React from 'react';
import { TicketOption } from '../../../data/mockData';
import { Download, Ticket, Check } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
  // details: string[];
  onDownloadTickets: () => void;
}

const EmployeeTicketOptionsView: React.FC<Props> = ({
  ticketOptions,  
  onDownloadTickets,
}) => {
  const selectedOption = ticketOptions.find(opt => opt.selected);
 
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Your Ticket</h4>
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
                  {/* Selected indicator badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-md">
                    <Check size={12} />
                    Selected
                  </div>
                 
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
                 
                  {/* Left border accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-600"></div>
                </>
              )}
             
              <div className={`relative z-10 ${option.selected ? 'font-semibold text-slate-800 pr-20' : 'text-slate-600'}`}>
                {option.selected && (
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Your Selected Ticket</span>
                  </div>
                )}
                {option.description}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedOption && (
        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            onClick={onDownloadTickets}
          >
            <Download size={18} /> Download Tickets
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeTicketOptionsView;