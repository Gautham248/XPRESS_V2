import React, { useState, useEffect } from 'react';
import { TravelRequest } from '../../../data/mockData';
import {
    Plus,
    Upload,
    Edit,
    Trash,
    Save,
    X,
    Download,
} from 'lucide-react';

interface TicketOption {
  id: string;
  description: string;
  selected: boolean;
}

interface TicketProps {
  travelRequest: TravelRequest;
}

interface User {
  id: string;
  email: string;
  role: string;
}

const TicketOptionComponent: React.FC<TicketProps> = ({ travelRequest }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([]);
  const [newOption, setNewOption] = useState<string>('');
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user: User = JSON.parse(userData);
      setUserRole(user.role);
    } else {
      setUserRole(null);
    }
  }, []);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setTicketOptions([
        ...ticketOptions,
        {
          id: `option-${Date.now()}`,
          description: newOption,
          selected: false,
        },
      ]);
      setNewOption('');
    }
  };

  const handleDeleteOption = (optionId: string) => {
    if (window.confirm('Delete this option?')) {
      setTicketOptions(ticketOptions.filter(option => option.id !== optionId));
    }
  };

  const handleUploadOptions = () => {
    if (ticketOptions.length === 0) {
      alert('No options to upload.');
      return;
    }
    if (window.confirm('Are you sure you want to upload these ticket options?')) {
      console.log('Uploading ticket options:', ticketOptions);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (userRole !== 'manager') return;
    const updatedOptions = ticketOptions.map(option =>
      option.id === optionId ? { ...option, selected: !option.selected } : option
    );
    setTicketOptions(updatedOptions);
  };

  const handleEditOption = (option: TicketOption) => {
    setEditingOption(option.id);
    setEditText(option.description);
  };

  const handleSaveEdit = (optionId: string) => {
    if (window.confirm('Save changes to this option?')) {
      const updatedOptions = ticketOptions.map(option =>
        option.id === optionId ? { ...option, description: editText } : option
      );
      setTicketOptions(updatedOptions);
      setEditingOption(null);
      setEditText('');
    }
  };

  const handleDownloadTickets = () => {
    if (travelRequest.status !== 'Tickets Selected') {
      alert('No tickets selected for download.');
      return;
    }
    console.log('Downloading tickets for request:', travelRequest.id);
  };

  const renderAdminView = () => (
    <div className="space-y-6">
      <div>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter ticket option"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />
        <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            onClick={handleAddOption}
        >
            <Plus size={16} /> Add Option
        </button>
      </div>

      {ticketOptions.length > 0 && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleUploadOptions}
        >
          <Upload size={16} />
          Upload Options
        </button>
      )}

      {ticketOptions.map(option => (
        <div key={option.id} className="p-4 border rounded-md bg-white shadow">
          {editingOption === option.id ? (
            <div>
              <textarea
                className="w-full p-2 border rounded-md"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                    onClick={() => handleSaveEdit(option.id)}
                >
                    <Save size={16} />
                    Save
                </button>
                <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => setEditingOption(null)}
                >
                    <X size={16} />
                    Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>{option.description}</span>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => handleEditOption(option)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteOption(option.id)}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderManagerView = () => (
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
                onChange={() => handleSelectOption(option.id)}
              />
              <span className="flex-1">{option.description}</span>
            </label>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => handleEditOption(option)}
              >
                <Edit size={16} />
              </button>
              <button
                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDeleteOption(option.id)}
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
          onClick={handleUploadOptions}
        >
          <Upload size={16} /> Upload Selected Option
        </button>
      )}
    </div>
  );

  const renderEmployeeView = () => {
    const selectedOption = ticketOptions.find(option => option.selected);
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
            onClick={handleDownloadTickets}
          >
            <Download size={16} /> Download Tickets
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 border rounded-xl bg-gray-50 shadow-md space-y-8 mb-6">
      <h3 className="text-xl font-bold text-gray-800">Ticket Options - Request #{travelRequest.id}</h3>
      {userRole === 'admin' && renderAdminView()}
      {userRole === 'manager' && renderManagerView()}
      {userRole === 'employee' && renderEmployeeView()}
      {!userRole && <p className="text-red-500">User not found. Please ensure you are logged in.</p>}
    </div>
  );
};

export default TicketOptionComponent;