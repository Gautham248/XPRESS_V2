import React, { useState, useEffect } from 'react';
import { TravelRequest } from '../../../data/mockData';
import AdminTicketOptionsView from './AdminTicketOption';
import ManagerTicketOptionsView from './ManagerTicketOption';
import EmployeeTicketOptionsView from './EmployeeTicketOption';
import { dummyTicketOptions } from '../../../data/mockData';
import { useModal } from '../confirmation_modal/hooks/useModal';
import ConfirmationModal from '../confirmation_modal/ConfirmationModal';

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
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>(dummyTicketOptions);
  const [newOption, setNewOption] = useState<string>('');
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const {
    isOpen,
    title,
    content,
    buttons,
    openModal,
    closeModal
  } = useModal();

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
    openModal('Delete this option?', () => {
      setTicketOptions(ticketOptions.filter(option => option.id !== optionId));
    }, 'Delete Option');
  };

  const handleUploadOptions = () => {
    if (ticketOptions.length === 0) {
      openModal('No options to upload.', () => { }, 'Upload Ticket Options');
      return;
    }
    const confirmUpload = () => {
      console.log('Uploading ticket options:', ticketOptions);
    };
    openModal('Are you sure you want to upload these ticket options?', confirmUpload, 'Upload Ticket Options');
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
    const confirmSave = () => {
      const updatedOptions = ticketOptions.map(option =>
        option.id === optionId ? { ...option, description: editText } : option
      );
      setTicketOptions(updatedOptions);
      setEditingOption(null);
      setEditText('');
    };
    openModal('Save changes to this option?', confirmSave, 'Edit Option');
  };

  const handleDownloadTickets = () => {
    if (travelRequest.status !== 'Tickets Selected') {
      openModal('No tickets selected for download.', () => { }, 'Download Tickets');
      return;
    }
    console.log('Downloading tickets for request:', travelRequest.id);
  };

  return (
    <>
      <div className="relative card border rounded-lg bg-white">
        <div className="sticky top-0 z-10 bg-white">
          <h3 className="text-lg font-semibold pb-4">Tickets</h3>
        </div>

        <div className="h-[325px] overflow-y-auto p-1">
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
              status={travelRequest.status}
            />
          )}

          {userRole === 'manager' && (
            <ManagerTicketOptionsView
              ticketOptions={ticketOptions}
              onSelectOption={handleSelectOption}
              onEditOption={handleEditOption}
              onDeleteOption={handleDeleteOption}
              onUploadOptions={handleUploadOptions}
              requestStatus={travelRequest.status}
            />
          )}

          {userRole === 'employee' && (
            <EmployeeTicketOptionsView
              ticketOptions={ticketOptions}
              onDownloadTickets={handleDownloadTickets}
              requestStatus={travelRequest.status}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        title={title}
        content={content}
        buttons={buttons}
        onClose={closeModal}
      />
    </>
  );
};

export default TicketOptionComponent;