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
    <div className="space-y-6">
      {/* Travel Agency Name Input */}
      <div>
        <h5 className="text-md font-medium mb-2">Travel Agency:</h5>
        <input
          type="text"
          placeholder="Enter travel agency name"
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
        />
      </div>
      <hr />
      <h5 className="text-md font-medium">Ticket Option:</h5>

      <div>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter ticket option"
          value={newOption}
          onChange={(e) => onChangeNewOption(e.target.value)}
        />
        <div className='flex justify-between'>
          {ticketOptions.length > 0 ? (
            <button
              className=" mt-2 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={onUploadOptions}
            >
              <Upload size={16} />
              Upload Options
            </button>
          ) : (<button
            className=" mt-2 flex items-center gap-2 px-4 py-2 bg-gray-300 text-white rounded"
            onClick={onUploadOptions}
            disabled={true}
          >
            <Upload size={16} />
            Upload Options
          </button>)}

          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            onClick={onAddOption}
          >
            <Plus size={16} /> Add Option
          </button>
        </div>
      </div>


      {ticketOptions.length === 0 ? (
        <p className="text-gray-500 italic">No ticket options added yet.</p>
      ) : (ticketOptions.map(option => (
        <div key={option.id} className="p-4 border rounded-md bg-white shadow">
          {editingOption === option.id ? (
            <div>
              <textarea
                className="w-full p-2 border rounded-md"
                value={editText}
                onChange={(e) => onChangeEditText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  onClick={() => onSaveEdit(option.id)}
                >
                  <Save size={16} /> Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                  onClick={onCancelEdit}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>{option.description}</span>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => onEditOption(option)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
  );
};

export default AdminTicketOptionsView;
