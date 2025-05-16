import React from 'react';
import { TicketOption } from '../../../data/mockData';
import { Edit, Trash, Upload } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
  onSelectOption: (id: string) => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onUploadOptions: () => void;
}

const ManagerTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  onSelectOption,
  onEditOption,
  onDeleteOption,
  onUploadOptions
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Select Tickets</h4>
      {ticketOptions.length === 0 ? (
        <p>No ticket options available.</p>
      ) : (
        ticketOptions.map(option => (
          <div
            key={option.id}
            className={`p-4 border rounded-md shadow flex items-center justify-between ${
              option.selected ? 'bg-blue-100 border-blue-500' : ''
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer w-full">
              <input
                type="checkbox"
                checked={option.selected}
                onChange={() => onSelectOption(option.id)}
              />
              <span className="flex-1">{option.description}</span>
            </label>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => onEditOption(option)}
              >
                <Edit size={16} />
              </button>
              <button
                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => onDeleteOption(option.id)}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))
      )}
      {ticketOptions.some(option => option.selected) && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={onUploadOptions}
        >
          <Upload size={16} /> Upload Selected Option
        </button>
      )}
    </div>
  );
};

export default ManagerTicketOptionsView;
