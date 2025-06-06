import React, { useState, useEffect } from 'react';
import { TravelRequest, TicketOption, dummyTicketOptions } from '../../../data/mockData';
import SelectedView from './component_view/SelectedView';
import SelectTicketView from './component_view/SelectTicketView';
import UploadTicketView from './component_view/UploadTicketView';
import UploadTicketsModal, { Airline } from './UploadTicketsModal';
import { useModal } from '../confirmation_modal/hooks/useModal';
import ConfirmationModal from '../confirmation_modal/ConfirmationModal';
import { Edit, Trash } from 'lucide-react';
import StatusMessage from './StatusMessage';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    isOpen,
    title,
    content,
    buttons,
    openModal,
    closeModal,
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
      openModal('No options to upload.', () => {}, 'Upload Ticket Options');
      return;
    }
    const confirmUpload = () => {
      console.log('Uploading ticket options:', ticketOptions);
    };
    openModal('Are you sure you want to upload these ticket options?', confirmUpload, 'Upload Ticket Options');
  };

  const handleSelectOption = (optionId: string) => {
    if (userRole !== 'manager' && userRole !== 'duhead') return;

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
      openModal('Do you want to download the ticket?', () => {}, 'Download Ticket');
      return;
    }
    console.log('Downloading tickets for request:', travelRequest.id);
  };

  const handleUploadTickets = (agencyName: string, agencyExpense: string, totalExpense: string, file: File | null, airlines: Airline[]) => {
    console.log('Uploading tickets:', { agencyName, agencyExpense, totalExpense, file, airlines });
    setIsUploadModalOpen(false);
  };

  const handleApproveTickets = () => {
    console.log('Approving selected tickets');
    // Logic to approve tickets
  };

  const ClockIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  // Render logic based on role and status
  const renderContent = () => {
    const { status } = travelRequest;

    // Handle rejected status for all roles
    if (status === 'Rejected') {
      return (
        <StatusMessage
          bgColor="bg-red-50"
          borderColor="border-red-200"
          iconColor="text-red-500"
          titleColor="text-red-800"
          textColor="text-red-700"
          title="Request Rejected"
          message="Your travel request has been rejected. Please contact your manager for more details."
          icon={<ClockIcon />}
        />
      );
    }

    switch (userRole) {
      case 'admin':
        return renderAdminContent(status);
      case 'duhead':
        return renderDUHeadContent(status);
      case 'manager':
        return renderManagerContent(status);
      case 'employee':
        return renderEmployeeContent(status);
      default:
        return <div className="text-center p-4">Loading...</div>;
    }
  };

  const renderAdminContent = (status: string) => {
    if (status === 'DU Head Approved') {
      return (
        <SelectedView
          ticketOptions={ticketOptions}
          onUploadTickets={() => setIsUploadModalOpen(true)}
          buttons={['uploadTickets']}
          customButtons={[]}
        />
      );
    }

    if (['Tickets Selected', 'Tickets Dispatched', 'In-transit', 'Returned', 'Closed'].includes(status)) {
      return (
        <SelectedView
          ticketOptions={ticketOptions}
          onDownloadTickets={handleDownloadTickets}
          buttons={['downloadTickets']}
          customButtons={[]}
        />
      );
    }

    if (status === 'Pending') {
      return (
        <StatusMessage
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          iconColor="text-amber-500"
          titleColor="text-amber-800"
          textColor="text-amber-700"
          title="Pending Approval"
          message="This request is awaiting manager approval before ticket options can be configured."
          icon={<ClockIcon />}
        />
      );
    }

    // Default view for Admin
    return (
      <UploadTicketView
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
        customButtons={[
          {
            label: 'Clear All',
            icon: <Trash size={16} />,
            onClick: () => setTicketOptions([]),
            className: 'bg-red-500 text-white hover:bg-red-600',
            disabled: ticketOptions.length === 0,
          }
        ]}
      />
    );
  };

  const renderDUHeadContent = (status: string) => {
    if (status === 'Tickets Selected') {
      if (isEditMode) {
        return (
          <SelectTicketView
            ticketOptions={ticketOptions}
            onSelectOption={handleSelectOption}
            onUploadOptions={handleUploadOptions}
          />
        );
      }
      
      return (
        <SelectedView
          ticketOptions={ticketOptions}
          onDownloadTickets={handleDownloadTickets}
          buttons={['downloadTickets']}
          customButtons={[
            {
              label: 'Edit Tickets',
              icon: <Edit size={16} />,
              onClick: () => setIsEditMode(true),
              className: 'bg-blue-500 text-white hover:bg-blue-600',
            },
            {
              label: 'Approve Tickets',
              onClick: handleApproveTickets,
              className: 'bg-green-500 text-white hover:bg-green-600',
            }
          ]}
        />
      );
    }

    // Default DUHead view
    return renderEmployeeContent(status);
  };

  const renderManagerContent = (status: string) => {
    if (status === 'Pending') {
      return (
        <StatusMessage
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          iconColor="text-blue-500"
          titleColor="text-blue-800"
          textColor="text-blue-700"
          title="Action Required"
          message="This travel request is waiting for your approval. Please review and take action."
          icon={<CheckIcon />}
        />
      );
    }

    // After approval, if tickets are added
    // if (['Approved', 'Tickets Added'].includes(status)) {
    if (['Manager Approved'].includes(status) && ticketOptions.length != 0) {
      return (
        <SelectTicketView
          ticketOptions={ticketOptions}
          onSelectOption={handleSelectOption}
          onUploadOptions={handleUploadOptions}
        />
      );
    }

    // Show selected view for other statuses
    return (
      <SelectedView
        ticketOptions={ticketOptions}
        onDownloadTickets={handleDownloadTickets}
        buttons={['downloadTickets']}
        customButtons={[]}
      />
    );
  };

  const renderEmployeeContent = (status: string) => {
    if (!['Tickets Selected', 'DU Head Approved', 'Tickets Dispatched', 'In-transit', 'Returned', 'Closed'].includes(status)) {
      if (status === 'Pending') {
        return (
          <StatusMessage
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            iconColor="text-amber-500"
            titleColor="text-amber-800"
            textColor="text-amber-700"
            title="Under Review"
            message="Your travel request is currently under review. You'll be notified once approved."
            icon={<ClockIcon />}
          />
        );
      }
      
      return (
        <StatusMessage
          bgColor="bg-indigo-50"
          borderColor="border-indigo-200"
          iconColor="text-indigo-500"
          titleColor="text-indigo-800"
          textColor="text-indigo-700"
          title="Processing Request"
          message="Your travel request is being processed. Please check back for updates."
          icon={<ClockIcon />}
        />
      );
    }

    return (
      <SelectedView
        ticketOptions={ticketOptions}
        onDownloadTickets={handleDownloadTickets}
        buttons={['downloadTickets']}
        customButtons={[]}
      />
    );
  };

  return (
    <>
      <div className="h-[480px] overflow-y-auto border rounded-lg bg-white shadow mb-6">
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <h3 className="text-lg font-semibold">Tickets</h3>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {renderContent()}
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isOpen} 
        title={title} 
        content={content} 
        buttons={buttons} 
        onClose={closeModal} 
      />
      
      <UploadTicketsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirm={handleUploadTickets}
      />
    </>
  );
};

export default TicketOptionComponent;