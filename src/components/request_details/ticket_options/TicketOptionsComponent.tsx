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

    const updatedOptions = ticketOptions.map(option => {
      if (option.id === optionId) {
        return { ...option, selected: !option.selected };
      } else {
        return { ...option, selected: false };
      }
    });

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
      <div className="h-[480px] overflow-y-auto border rounded-lg bg-white shadow mb-6">
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <h3 className="text-lg font-semibold">Tickets</h3>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {
            travelRequest.status === 'Rejected' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-lg font-semibold text-red-800">Request Rejected</h3>
                </div>
                <p className="text-red-700">Your travel request has been rejected. Please contact your manager for more details.</p>
              </div>
            ) : (
              <>
                {userRole === 'admin' && (
                  ['Tickets Selected', 'Tickets Dispatched', 'DU Head Approved', 'In-transit', 'Returned', 'Closed'].includes(travelRequest.status) ? (
                    <EmployeeTicketOptionsView
                      ticketOptions={ticketOptions}
                      onDownloadTickets={handleDownloadTickets}
                    />
                  ) : travelRequest.status === 'Pending' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-amber-800">Pending Approval</h3>
                      </div>
                      <p className="text-amber-700">This request is awaiting manager approval before ticket options can be configured.</p>
                    </div>
                  ) : (
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
                  )
                )}
                {userRole === 'manager' && (
                  travelRequest.status === 'Pending' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">Action Required</h3>
                      </div>
                      <p className="text-blue-700">This travel request is waiting for your approval. Please review and take action.</p>
                    </div>
                  ) : ['Tickets Selected', 'Tickets Dispatched', 'DU Head Approved', 'In-transit', 'Returned', 'Closed'].includes(travelRequest.status) ? (
                    <EmployeeTicketOptionsView
                      ticketOptions={ticketOptions}
                      onDownloadTickets={handleDownloadTickets}
                    />
                  ) : (
                    <ManagerTicketOptionsView
                      ticketOptions={ticketOptions}
                      onSelectOption={handleSelectOption}
                      onEditOption={handleEditOption}
                      onDeleteOption={handleDeleteOption}
                      onUploadOptions={handleUploadOptions}
                    />
                  )
                )}
                {userRole === 'employee' && (
                  ['Tickets Selected', 'Tickets Dispatched', 'DU Head Approved', 'In-transit', 'Returned', 'Closed'].includes(travelRequest.status) ? (
                    <EmployeeTicketOptionsView
                      ticketOptions={ticketOptions}
                      onDownloadTickets={handleDownloadTickets}
                    />
                  ) : travelRequest.status === 'Pending' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-amber-800">Under Review</h3>
                      </div>
                      <p className="text-amber-700">Your travel request is currently under review. You'll be notified once approved.</p>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <h3 className="text-lg font-semibold text-indigo-800">Processing Request</h3>
                      </div>
                      <p className="text-indigo-700">Your travel request is being processed. Please check back for updates.</p>
                    </div>
                  )
                )}
              </>
            )
          }
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