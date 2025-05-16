import React, { useState, useEffect } from 'react';
import { TravelRequest } from '../../../data/mockData';
import AdminTicketOptionsView from './AdminTicketOption';
import ManagerTicketOptionsView from './ManagerTicketOption';
import EmployeeTicketOptionsView from './EmployeeTicketOption';

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

const dummyTicketOptions = [
  {
    id: 'option-1',
    description: 'Flight Booking',
    selected: false
  },
  {
    id: 'option-2',
    description: 'Hotel Reservation',
    selected: false
  },
  {
    id: 'option-3',
    description: 'Travel Insurance',
    selected: true
  }
];

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

  return (
    <div className="p-8 border rounded-xl bg-gray-50 shadow-md space-y-8 mb-6">
      <h3 className="text-xl font-bold text-gray-800">Ticket Options - Request #{travelRequest.id}</h3>
      {userRole === 'admin' && (
        <AdminTicketOptionsView
          ticketOptions={ticketOptions}
          newOption={newOption}
          editingOption={editingOption}
          editText={editText}
          onChangeNewOption={setNewOption}
          onAddOption={handleAddOption}
          onEditOption={handleEditOption}
          onDeleteOption={handleDeleteOption}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingOption(null)}
          onChangeEditText={setEditText}
          onUploadOptions={handleUploadOptions}
        />
      )}

      {userRole === 'manager' && (
        <ManagerTicketOptionsView
          ticketOptions={ticketOptions}
          onSelectOption={handleSelectOption}
          onEditOption={handleEditOption}
          onDeleteOption={handleDeleteOption}
          onUploadOptions={handleUploadOptions}
        />
      )}

      {userRole === 'employee' && (
        <EmployeeTicketOptionsView
          ticketOptions={ticketOptions}
          onDownloadTickets={handleDownloadTickets}
        />
      )}

    </div>
  );
};

export default TicketOptionComponent;