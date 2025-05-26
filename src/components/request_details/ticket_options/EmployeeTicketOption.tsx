import React from 'react';
import { TicketOption } from '../../../data/mockData';
import { Download } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
  // details: string[];
  onDownloadTickets: () => void;
  requestStatus: string;
}

const EmployeeTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  // details,
  onDownloadTickets,
  requestStatus,
}) => {
  const selectedOption = ticketOptions.find(opt => opt.selected);
  const hasSelectedOptions = ticketOptions.some(option => option.selected);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Your Ticket</h4>
      
      {requestStatus.toLowerCase() === 'pending' ? (
        <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Waiting for approval</p>
        </div>
      ) : requestStatus.toLowerCase() === 'rejected' ? (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Request has been rejected</p>
        </div>
      ) : ticketOptions.length === 0 ? (
        <div className="p-6 text-center bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-medium">No ticket options available yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {ticketOptions.map(option => (
              <div
                key={option.id}
                className={`p-4 border rounded-md shadow ${
                  option.selected 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {option.selected && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <span className={`flex-1 ${option.selected ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                    {option.description}
                  </span>
                  {option.selected && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasSelectedOptions && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium">
                ✓ Your ticket option has been confirmed
              </p>
            </div>
          )}
        </>
      )}

      {selectedOption && requestStatus.toLowerCase() === 'tickets dispatched' && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onDownloadTickets}
        >
          <Download size={16} /> Download Tickets
        </button>
      )}
    </div>
  );
};

export default EmployeeTicketOptionsView;