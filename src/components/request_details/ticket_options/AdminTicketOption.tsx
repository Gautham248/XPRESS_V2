import React, { useState } from 'react';
import { Plus, Upload, Edit, Trash, Save, X } from 'lucide-react';
import { TicketOption } from '../../../data/mockData';

interface Props {
  ticketOptions: TicketOption[];
  newOption: string;
  editingOption: string | null;
  editText: string;
  onChangeNewOption: (value: string) => void;
  onAddOption: () => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChangeEditText: (value: string) => void;
  onUploadOptions: () => void;
}

const AdminTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  newOption,
  editingOption,
  editText,
  onChangeNewOption,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onSaveEdit,
  onCancelEdit,
  onChangeEditText,
  onUploadOptions,
}) => {
  const [agencyName, setAgencyName] = useState('');

  return (
    <div className="space-y-4">
      {/* Travel Agency Input */}
      <div className="space-y-2">
        <h5 className="text-med font-medium text-gray-500">Travel Agency</h5>
        <input
          type="text"
          placeholder="Enter travel agency name"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
        />
      </div>

      {/* New Ticket Option */}
      <div className="space-y-2">
        <div className='flex justify-between'>
          <h5 className="text-med font-medium text-gray-500">Add New Ticket Option</h5>
          <div className="flex justify-between items-center">
            <button
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onAddOption}
            >
              <Plus size={12} />

              <p className='text-sm'>Add Option</p>
            </button>
          </div>
        </div>
        <textarea
          className="w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
          placeholder="Enter ticket option description"
          value={newOption}
          onChange={(e) => onChangeNewOption(e.target.value)}
        />

      </div>

      {/* Ticket Options List */}
      <div className="space-y-4">
        <h5 className="text-med font-medium text-gray-500">Existing Ticket Options</h5>
        {ticketOptions.length === 0 ? (
          <p className="text-gray-500 italic">No ticket options added yet.</p>
        ) : (
          ticketOptions.map((option) => (
            <div key={option.id} className="p-4 border rounded-md bg-white shadow-sm">
              {editingOption === option.id ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={editText}
                    onChange={(e) => onChangeEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-2 px-4 py-2 border text-white rounded hover:bg-blue-700"
                      onClick={() => onSaveEdit(option.id)}
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={onCancelEdit}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 whitespace-pre-wrap">{option.description}</span>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 px-1 py-1 text-yellow-400 rounded hover:"
                      onClick={() => onEditOption(option)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="flex items-center gap-1 px-1 py-1 text-red-400 rounded hover:"
                      onClick={() => onDeleteOption(option.id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="sticky -bottom-1 pt-4 bg-white flex justify-end">
        <button
          className={`flex items-center gap-2 px-6 py-2 justify-center text-white rounded ${ticketOptions.length > 0
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 cursor-not-allowed'
            }`}
          onClick={onUploadOptions}
          disabled={ticketOptions.length === 0}
        >
          Submit
        </button>
      </div>

    </div>
  );
};

export default AdminTicketOptionsView;
