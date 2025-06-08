import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SelectedView from './component_view/SelectedView';
import SelectTicketView from './component_view/SelectTicketView';
import UploadTicketView from './component_view/UploadTicketView';
import UploadTicketsModal, { Airline } from './UploadTicketsModal';
import { useModal } from '../confirmation_modal/hooks/useModal';
import ConfirmationModal from '../confirmation_modal/ConfirmationModal';
import { Edit, Loader2, Check, Clock } from 'lucide-react';
import StatusMessage from './StatusMessage';
import { INDEX_TO_STATUS_MAP } from '../TravelRequestDetails';

// --- API Related Interfaces ---
interface ApiTravelRequestDetail {
  currentStatusId: number;
}
interface TravelRequestDetailApiResponse {
  isSuccess: boolean;
  result: ApiTravelRequestDetail;
  statusCode: number;
  errorMessages: string[];
}
interface ApiTicketOptionItem {
  optionId: number;
  requestId: string;
  createdByUserId: number;
  optionDescription: string;
  createdAt: string;
  isSelected: boolean;
}
interface TicketOptionApiResponse {
  isSuccess: boolean;
  result: ApiTicketOptionItem[];
  statusCode: number;
  errorMessages: string[];
}
interface AddTicketOptionPayload {
  optionDescription: string;
  createdByUserId: number;
}
interface EditTicketOptionPayload {
  optionDescription: string;
}
interface SelectTicketOptionPayload {
  selectingUserId: number;
  comments: string;
}

// --- Component Specific Types ---
interface TicketProps {
  requestId: string;
}
interface User {
  userId: string;
  email: string;
  role: string;
}
// This is the structure expected by child components
interface UITicketOption {
  id: string;
  description: string;
  selected: boolean;
}

const API_BASE_URL = 'http://localhost:5030/api';

const TicketOptionComponent: React.FC<TicketProps> = ({ requestId }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [travelRequestStatus, setTravelRequestStatus] = useState<string | null>(null);
  const [ticketOptionsFromApi, setTicketOptionsFromApi] = useState<ApiTicketOptionItem[]>([]);

  const [newOptionText, setNewOptionText] = useState<string>('');
  const [editingOptionApiItem, setEditingOptionApiItem] = useState<ApiTicketOptionItem | null>(null); // Stores the full ApiTicketOptionItem for editing
  const [editText, setEditText] = useState<string>('');

  const [isUploadTicketsFileModalOpen, setIsUploadTicketsFileModalOpen] = useState(false);
  const [isEditModeDUHead, setIsEditModeDUHead] = useState(false);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isOpen: isConfirmModalOpen,
    title: confirmModalTitle,
    content: confirmModalContent,
    buttons: confirmModalButtons,
    openModal: openConfirmModal,
    closeModal: closeConfirmModal,
  } = useModal();

  // Effect to get current user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      setError("User not found. Please log in.");
    }
  }, []);

  const fetchTravelRequestData = useCallback(async () => {
    if (!requestId) {
      setError("Request ID is missing.");
      setIsLoadingStatus(false);
      return;
    }
    setIsLoadingStatus(true);
    setError(null);
    try {
      console.log("Fetching data for request ID:", requestId);

      const response = await axios.get<TravelRequestDetailApiResponse>(`${API_BASE_URL}/TravelRequest/${requestId}`);

      if (response.data.isSuccess && response.data.result) {
        const statusId = response.data.result.currentStatusId;
        const statusName = INDEX_TO_STATUS_MAP[statusId] || 'PendingReview';
        
        console.log(`Mapped status ID ${statusId} to:`, statusName);
        setTravelRequestStatus(statusName);
        
        await fetchTicketOptions(requestId);
      } else {
        const errorMsg = response.data.errorMessages?.join(', ') || 'Failed to fetch travel request status.';
        setError(errorMsg);
        console.error("API returned unsuccessful:", errorMsg);
      }
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? `HTTP ${err.response?.status}: ${err.message}`
        : 'An error occurred while fetching request status.';

      console.error("API Error:", {
        message: errorMsg,
        config: axios.isAxiosError(err) ? err.config : null,
        response: axios.isAxiosError(err) ? err.response : null
      });

      setError(errorMsg);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [requestId]);

  const fetchTicketOptions = useCallback(async (currentRequestId: string) => {
    if (!currentRequestId) return;
    setIsLoadingOptions(true);
    // setError(null); // Don't clear general error, only option-specific if needed
    try {
      const response = await axios.get<TicketOptionApiResponse>(`${API_BASE_URL}/travelrequests/${currentRequestId}/ticketoptions`);
      if (response.data.isSuccess && response.data.result) {
        setTicketOptionsFromApi(response.data.result);
      } else {
        setTicketOptionsFromApi([]);
        if (response.data.errorMessages?.length) {
          setError(prev => prev ? `${prev}\n${response.data.errorMessages.join(', ')}` : response.data.errorMessages.join(', '));
        }
      }
    } catch (err) {
      console.error("Error fetching ticket options:", err);
      setError(prev => prev ? `${prev}\n${axios.isAxiosError(err) ? err.message : 'Error fetching options.'}` : (axios.isAxiosError(err) ? err.message : 'Error fetching options.'));
      setTicketOptionsFromApi([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchTravelRequestData();
  }, [fetchTravelRequestData]);


  const mapApiToUIOptions = (apiOptions: ApiTicketOptionItem[]): UITicketOption[] => {
    return apiOptions.map(option => ({
      id: option.optionId.toString(),
      description: option.optionDescription,
      selected: option.isSelected,
    }));
  };

  const uiTicketOptions: UITicketOption[] = mapApiToUIOptions(ticketOptionsFromApi);
  console.log("UI Ticket Options: ", uiTicketOptions);

  const handleAddOption = async () => {
    if (!newOptionText.trim() || !currentUser || !requestId) return;
    const id = parseInt(currentUser.userId, 10);
    console.log(id);
    
    if (isNaN(id)) { setError("Invalid user ID."); return; }

    const payload: AddTicketOptionPayload = { optionDescription: newOptionText, createdByUserId: id };
    setIsLoadingOptions(true);
    try {
      const response = await axios.post<TicketOptionApiResponse>(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions`, payload);
      if (response.data.isSuccess) {
        setNewOptionText('');
        await fetchTicketOptions(requestId);
      } else { setError(response.data.errorMessages?.join(', ') || 'Failed to add option.'); }
    } catch (err) {
      console.error("Error adding option:", err);
      setError(axios.isAxiosError(err) ? err.message : 'An error occurred while adding option.');
    } finally { setIsLoadingOptions(false); }
  };

  const handleDeleteOption = async (optionIdString: string) => {
    const optionId = parseInt(optionIdString, 10);
    if (isNaN(optionId) || !requestId) return;
    openConfirmModal('Delete this option?', async () => {
      setIsLoadingOptions(true);
      try {
        const response = await axios.delete<{ isSuccess: boolean, errorMessages?: string[] }>(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/${optionId}`);
        if (response.data.isSuccess) { await fetchTicketOptions(requestId); }
        else { setError(response.data.errorMessages?.join(', ') || 'Failed to delete option.'); }
      } catch (err) {
        console.error("Error deleting option:", err);
        setError(axios.isAxiosError(err) ? err.message : 'An error occurred while deleting option.');
      } finally { setIsLoadingOptions(false); }
    }, 'Delete Option');
  };

  const handleSelectOption = async (optionIdString: string) => {
    if ((currentUser?.role !== 'manager' && currentUser?.role !== 'duhead') || !requestId) return;
    const optionId = parseInt(optionIdString, 10);
    const id = parseInt(currentUser!.userId, 10);
    if (isNaN(optionId) || isNaN(id)) { setError("Invalid option or user ID."); return; }

    const payload: SelectTicketOptionPayload = { selectingUserId: id, comments: "" };
    setIsLoadingOptions(true);
    try {
      const response = await axios.put<{ isSuccess: boolean, errorMessages?: string[] }>(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/${optionId}/select`, payload);
      if (response.data.isSuccess) { await fetchTicketOptions(requestId); }
      else { setError(response.data.errorMessages?.join(', ') || 'Failed to select option.'); }
    } catch (err) {
      console.error("Error selecting option:", err);
      setError(axios.isAxiosError(err) ? err.message : 'An error occurred while selecting option.');
    } finally { setIsLoadingOptions(false); }
  };

  // Child UploadTicketView passes the full UITicketOption
  const handleInitiateEditOption = (uiOptionToEdit: UITicketOption) => {
    const apiOption = ticketOptionsFromApi.find(opt => opt.optionId.toString() === uiOptionToEdit.id);
    if (apiOption) {
      setEditingOptionApiItem(apiOption);
      setEditText(apiOption.optionDescription);
    } else {
      console.warn("Could not find API option for UI option:", uiOptionToEdit);
      setError("Failed to find option data for editing.");
    }
  };

  const handleSaveEdit = async () => { // Child UploadTicketView passes option.id, but we use editingOptionApiItem
    if (!editingOptionApiItem || !editText.trim() || !requestId) return;
    const payload: EditTicketOptionPayload = { optionDescription: editText };
    openConfirmModal('Save changes to this option?', async () => {
      setIsLoadingOptions(true);
      try {
        const response = await axios.put<{ isSuccess: boolean, errorMessages?: string[] }>(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/${editingOptionApiItem.optionId}`, payload);
        if (response.data.isSuccess) {
          setEditingOptionApiItem(null); setEditText('');
          await fetchTicketOptions(requestId);
        } else { setError(response.data.errorMessages?.join(', ') || 'Failed to save edit.'); }
      } catch (err) {
        console.error("Error saving edit:", err);
        setError(axios.isAxiosError(err) ? err.message : 'An error occurred while saving edit.');
      } finally { setIsLoadingOptions(false); }
    }, 'Edit Option');
  };

  const handleUploadActualTickets = (agencyName: string, agencyExpense: string, totalExpense: string, file: File | null, airlines: Airline[]) => {
    console.log('Uploading actual tickets (files):', { agencyName, agencyExpense, totalExpense, file, airlines });
    // API call for uploading actual ticket files and details
    setIsUploadTicketsFileModalOpen(false);
    setError("Actual ticket upload API call not yet implemented.");
  };

  // Handler for Admin finalizing provided options
  const handleFinalizeOptionsUploadByAdmin = async () => {
    if (ticketOptionsFromApi.length === 0) {
      setError("Please add at least one ticket option before finalizing.");
      return;
    }
    openConfirmModal("Finalize and submit these ticket options for selection?", async () => {
      console.log("Admin finalizing ticket options - API call to update TR status needed");
      // Example: await axios.put(`${API_BASE_URL}/travelrequests/${requestId}/updateStatus`, { newStatus: 'OptionsForDUApproval' });
      // After successful status update:
      // await fetchTravelRequestData(); // Re-fetch everything
      setError("Admin Finalize Options API call not yet implemented.");
    }, "Submit Ticket Options");
  };

  // Handler for DU Head (or Manager) approving a selected option
  const handleApproveSelectedOptionByApprover = async () => {
    const selectedOption = ticketOptionsFromApi.find(opt => opt.isSelected);
    if (!selectedOption) {
      setError("No ticket option is selected for approval.");
      return;
    }
    const newStatus = currentUser?.role === 'duhead' ? 'DU Head Approved' : 'Manager Final Approved'; // Example status
    openConfirmModal(`Approve the selected ticket option and set status to "${newStatus}"?`, async () => {
      console.log(`${currentUser?.role} approving selected tickets - API call to update TR status needed`);
      // Example: await axios.put(`${API_BASE_URL}/travelrequests/${requestId}/updateStatus`, { newStatus });
      // After successful status update:
      // await fetchTravelRequestData(); // Re-fetch everything
      // if (currentUser?.role === 'duhead') setIsEditModeDUHead(false);
      setError("Approver's Finalize Selection API call not yet implemented.");
    }, "Approve Ticket Option");
  };

  const renderContent = () => {
    if (isLoadingStatus || !currentUser) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /> <span className="ml-2">Loading request details...</span></div>;
    }
    if (!travelRequestStatus) {
      console.log(travelRequestStatus);

      return <StatusMessage title="Error" message={error || "Could not load travel request status."} bgColor="bg-red-50" borderColor="border-red-200" iconColor="text-red-500" titleColor="text-red-800" textColor="text-red-700" icon={<Clock className="h-6 w-6" />} />;
    }
    if (error && !isLoadingOptions) {
      return <StatusMessage title="Error" message={error} bgColor="bg-red-50" borderColor="border-red-200" iconColor="text-red-500" titleColor="text-red-800" textColor="text-red-700" icon={<Clock className="h-6 w-6" />} />;
    }
    if (travelRequestStatus === 'Rejected') {
      return <StatusMessage title="Request Rejected" message="Your travel request has been rejected." icon={<Clock className="h-6 w-6" />} bgColor="bg-red-50" borderColor="border-red-200" iconColor="text-red-500" titleColor="text-red-800" textColor="text-red-700" />;
    }

    switch (currentUser.role) {
      case 'admin': return renderAdminContent(travelRequestStatus);
      case 'duhead': return renderDUHeadContent(travelRequestStatus);
      case 'manager': return renderManagerContent(travelRequestStatus);
      case 'employee': return renderEmployeeContent(travelRequestStatus);
      default: return <div className="text-center p-4">Unknown user role.</div>;
    }
  };

  const renderAdminContent = (status: string) => {
    // Admin uploads actual tickets after DU Head approves selection
    if (status === 'DUApproved') {
      return (
        <SelectedView
          ticketOptions={uiTicketOptions}
          onUploadTickets={() => setIsUploadTicketsFileModalOpen(true)}
          buttons={['uploadTickets']}
          customButtons={[]}
        />
      );
    }
    // Admin can view/download selected tickets in later stages
    if (['OptionSelected', 'TicketDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return (
        <SelectedView
          ticketOptions={uiTicketOptions}
          onDownloadTickets={() => console.log("Admin: Download initiated for selected tickets")}
          // buttons={['downloadTickets']}
          customButtons={[]}
        />
      );
    }
    // Admin creates/manages ticket *options* if status is 'Manager Approved' (or a similar state before options are finalized by admin)
    if (status === 'Verified') {
      return (
        <UploadTicketView
          ticketOptions={uiTicketOptions}
          newOption={newOptionText}
          editingOption={editingOptionApiItem ? editingOptionApiItem.optionId.toString() : null}
          editText={editText}
          onChangeNewOption={setNewOptionText}
          onAddOption={handleAddOption}
          onEditOption={handleInitiateEditOption} // Correctly passed
          onDeleteOption={handleDeleteOption}
          onSaveEdit={() => handleSaveEdit()} // Child passes ID, but our handler uses state
          onCancelEdit={() => { setEditingOptionApiItem(null); setEditText(''); }}
          onChangeEditText={setEditText}
          onUploadOptions={handleFinalizeOptionsUploadByAdmin} // For "Upload All Options" button
          customButtons={[ /* ... existing custom button ... */]}
        />
      );
    }
    return <StatusMessage title="Awaiting Action" message={`Request status: ${status}. Options management may be pending or completed.`} icon={<Clock className="h-6 w-6" />} bgColor="bg-gray-50" borderColor="border-gray-200" iconColor="text-gray-500" titleColor="text-gray-800" textColor="text-gray-700" />;
  };

  const renderDUHeadContent = (status: string) => {
    // Example status where DU Head selects/approves: 'OptionsForDUApproval'
    if (status === 'OptionSelected') {
      if (isEditModeDUHead) {
        return (
          <SelectTicketView
            ticketOptions={uiTicketOptions}
            onSelectOption={handleSelectOption}
            onUploadOptions={handleApproveSelectedOptionByApprover} // "Upload Selected Options" button finalizes
          />
        );
      }
      const selectedViewButtons: ('downloadTickets' | 'uploadTickets' | 'confirmTicketOption')[] = [];
      const canConfirm = uiTicketOptions.some(o => o.selected);
      if (canConfirm) {
        // selectedViewButtons.push('downloadTickets'); // If DUHead can download at this stage
        selectedViewButtons.push('confirmTicketOption');
      }

      return (
        <SelectedView
          ticketOptions={uiTicketOptions}
          buttons={selectedViewButtons}
          onConfirmTicketOption={canConfirm ? handleApproveSelectedOptionByApprover : undefined}
          // onDownloadTickets={canConfirm ? () => console.log("DUHead: Download") : undefined}
          customButtons={[
            {
              label: isEditModeDUHead ? 'View Selected' : 'Change Selection',
              icon: <Edit size={16} />,
              onClick: () => setIsEditModeDUHead(!isEditModeDUHead),
              className: 'bg-blue-500 text-white hover:bg-blue-600',
            }
            // The 'Approve Selected Ticket' is now part of `buttons` if `confirmTicketOption` is included
          ]}
        />
      );
    }
    if (['DUApproved', 'TicketDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return renderEmployeeContent(status);
    }
    return <StatusMessage title="Processing" message={`Request status: ${status}. Waiting for options or previous approvals.`} icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
  };

  const renderManagerContent = (status: string) => {
    if (status === 'PendingReview') {
      return <StatusMessage title="Action Required" message="This travel request is waiting for your approval (main request)." icon={<Check className="h-6 w-6" />} bgColor="bg-blue-50" borderColor="border-blue-200" iconColor="text-blue-500" titleColor="text-blue-800" textColor="text-blue-700" />;
    }
    // Example status for Manager selection: 'OptionsForManagerApproval'
    if (status === 'OptionsListed') {
      // Assuming manager selection is similar to DU Head selection
      return (
        <SelectTicketView
          ticketOptions={uiTicketOptions}
          onSelectOption={handleSelectOption}
          onUploadOptions={handleApproveSelectedOptionByApprover} // Manager finalizes selection
        />
      );
    }
    if (status === 'OptionSelected') {
      return (
        <SelectedView
          ticketOptions={uiTicketOptions}
          onDownloadTickets={() => console.log("Manager: Download initiated")}
          // buttons={['downloadTickets']}
          customButtons={[]}
        />
      );
    }
    if (['', 'DUApproved', 'TicketDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return (
        <SelectedView
          ticketOptions={uiTicketOptions}
          onDownloadTickets={() => console.log("Manager: Download initiated")}
          buttons={['downloadTickets']}
          customButtons={[]}
        />
      );
    }
    return <StatusMessage title="Processing" message={`Request status: ${status}. Ticket options may be pending or handled by other roles.`} icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
  };

  const renderEmployeeContent = (status: string) => {
    if (!['OptionSelected', 'DUApproved', 'TicketDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      let msg = status === 'Pending' ? "Your travel request is currently under review." : "Your travel request is being processed.";
      return <StatusMessage title={status === 'Pending' ? "Under Review" : "Processing Request"} message={msg} icon={<Clock className="h-6 w-6" />} bgColor="bg-amber-50" borderColor="border-amber-200" iconColor="text-amber-500" titleColor="text-amber-800" textColor="text-amber-700" />;
    }
    const selectedOption = uiTicketOptions.find(opt => opt.selected);
    if (!selectedOption && !['Closed', 'Returned'].includes(status)) {
      return <StatusMessage title="Awaiting Tickets" message="Ticket details will be available here once finalized." icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
    }
    return (
      <SelectedView
        ticketOptions={uiTicketOptions}
        onDownloadTickets={selectedOption ? () => console.log("Employee: Download initiated") : undefined}
        buttons={selectedOption ? ['downloadTickets'] : []}
        customButtons={[]}
      />
    );
  };

  return (
    <>
      <div className="h-[480px] overflow-y-auto border rounded-lg bg-white shadow mb-6">
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <h3 className="text-lg font-semibold">Ticket Options</h3>
          {isLoadingOptions && <Loader2 className="inline-block ml-2 h-5 w-5 animate-spin text-blue-500" />}
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {renderContent()}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen} title={confirmModalTitle} content={confirmModalContent}
        buttons={confirmModalButtons} onClose={closeConfirmModal}
      />
      <UploadTicketsModal
        isOpen={isUploadTicketsFileModalOpen} onClose={() => setIsUploadTicketsFileModalOpen(false)}
        onConfirm={handleUploadActualTickets}
      />
    </>
  );
};

export default TicketOptionComponent;