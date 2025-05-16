import React from 'react';
import { TicketOption } from '../../../data/mockData';
import { Download } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
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
              className={`p-4 border rounded-md ${
                option.selected ? 'bg-blue-100 border-blue-500 font-semibold' : ''
              }`}
            >
              {option.description}
            </div>
          ))}
        </div>
      )}
      {selectedOption && (
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
