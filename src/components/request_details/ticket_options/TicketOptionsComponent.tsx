import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import SelectedView from './component_view/SelectedView';
import SelectTicketView from './component_view/SelectTicketView';
import UploadTicketView from './component_view/UploadTicketView';
import UploadTicketsModal, { AirlineTicketData } from './UploadTicketsModal';
import { useModal } from '../confirmation_modal/hooks/useModal';
import ConfirmationModal from '../confirmation_modal/ConfirmationModal';
import { Edit, Loader2, Check, Clock } from 'lucide-react';
import StatusMessage from './StatusMessage';
import { INDEX_TO_STATUS_MAP } from '../TravelRequestDetails';
import { TravelRequestApiResponse, TravelRequestData } from '../TravelInfoBanner';

// --- API Related Interfaces ---
interface ApiTravelRequestDetail {
  currentStatusId: number;
  transportation: string;
  uploadedTicketPdfPath?: string;
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
  onPreviewTicket: (url: string, index: number) => void;
  ticketDocumentPath?: string | string[];
  isModifiable: boolean;
  onDeleteTicket?: (index: number) => void;
}
interface User {
  userId: string;
  userEmail: string;
  role: string;
  userDU: string;
}
interface UITicketOption {
  id: string;
  description: string;
  selected: boolean;
  filePath?: string;
}

const API_BASE_URL = 'http://localhost:5030/api';

const TicketOptionComponent: React.FC<TicketProps> = ({ requestId, onPreviewTicket, ticketDocumentPath, isModifiable, onDeleteTicket }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [travelRequestStatus, setTravelRequestStatus] = useState<string | null>(null);
  const [transportationType, setTransportationType] = useState('');
  const [ticketOptionsFromApi, setTicketOptionsFromApi] = useState<ApiTicketOptionItem[]>([]);

  const [newOptionText, setNewOptionText] = useState<string>('');
  const [editingOptionApiItem, setEditingOptionApiItem] = useState<ApiTicketOptionItem | null>(null); // Stores the full ApiTicketOptionItem for editing
  const [editText, setEditText] = useState<string>('');

  const [isUploadTicketsFileModalOpen, setIsUploadTicketsFileModalOpen] = useState(false);
  const [isEditModeDUHead, setIsEditModeDUHead] = useState(false);

  const [pendingSelectedOptionId, setPendingSelectedOptionId] = useState<string | null>(null);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTravelRequestDetails] = useState<ApiTravelRequestDetail | null>(null);
  const [, setTravelRequest] = useState<TravelRequestData | null>(null);
  const [, setLoading] = useState(false);

  const [departmentName, setDepartmentName] = useState<string>('');

  const {
    isOpen: isConfirmModalOpen,
    title: confirmModalTitle,
    content: confirmModalContent,
    buttons: confirmModalButtons,
    openModal: openConfirmModal,
    closeModal: closeConfirmModal,
  } = useModal();

 
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
      
    } else {
      setError("User not found. Please log in.");
    }
  }, []);

  const apiUrl = 'http://localhost:5030/api/TravelRequest/infobanner';

  useEffect(() => {

  if (!requestId) {
        setError("No request ID provided");
        setLoading(false);
        return;
      }

    const fetchTravelRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${apiUrl}/${requestId}`;
        const response = await axios.get<TravelRequestApiResponse>(url);
        setTransportationType(response.data.result[0]?.travelModeName);
        
        
        if (response.data.isSuccess && response.data.result.length > 0) {
          const apiData = response.data.result[0];
            // console.log(apiData);
          setDepartmentName(apiData.departmentName || '');
          // Transform API data to component format
          const transformedData: TravelRequestData = {
            requestId: apiData.requestId,
            travelerName: apiData.employeeName,
            departmentCode: apiData.departmentName,
            projectManager: apiData.projectManager,
            projectCode: apiData.projectCode,
            transportationType: apiData.travelModeName,
            source: `${apiData.sourcePlace}, ${apiData.sourceCountry}`,
            destination: `${apiData.destinationPlace}, ${apiData.destinationCountry}`,
            phoneNumber: apiData.phoneNumber
          };
          
          setTravelRequest(transformedData);
        } else {
          if (response.data.errorMessages && response.data.errorMessages.length > 0) {
            setError(response.data.errorMessages.join(', '));
          } else if (response.data.isSuccess && response.data.result.length === 0) {
            setError("No travel request found");
          } else {
            setError("Failed to retrieve travel request data.");
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError<any>;
          if (axiosErr.response) {
            setError(axiosErr.response.data?.message || axiosErr.response.data?.errorMessages?.join(', ') || axiosErr.message || "An error occurred with the server response.");
          } else if (axiosErr.request) {
            setError(axiosErr.message || "Network error: Could not connect to server.");
          } else {
            setError(axiosErr.message || "Error setting up request.");
          }
        } else if (err instanceof Error) {
          setError(err.message || "An unexpected error occurred.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTravelRequest();
  }, [requestId, apiUrl]);

  const fetchTravelRequestData = useCallback(async () => {
    if (!requestId) {
      setError("Request ID is missing.");
      setIsLoadingStatus(false);
      return;
    }
    setIsLoadingStatus(true);
    setError(null);
    try {

      const response = await axios.get<TravelRequestDetailApiResponse>(`${API_BASE_URL}/TravelRequest/${requestId}`);

      if (response.data.isSuccess && response.data.result) {
        setTravelRequestDetails(response.data.result);
        const statusId = response.data.result.currentStatusId;
        const statusName = INDEX_TO_STATUS_MAP[statusId];

        // const transportType = response.data.result.transportation?.toLowerCase() || '';
        // setTransportationType(transportType);

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


  const mapApiToUIOptions = (
    apiOptions: ApiTicketOptionItem[],
  ): UITicketOption[] => {
    return apiOptions.map(option => ({
      id: option.optionId.toString(),
      description: option.optionDescription,
      selected: option.isSelected,
    }));
  };

  const uiTicketOptions: UITicketOption[] = mapApiToUIOptions(ticketOptionsFromApi);

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
      } catch (err)
      {
        console.error("Error deleting option:", err);
        setError(axios.isAxiosError(err) ? err.message : 'An error occurred while deleting option.');
      } finally { setIsLoadingOptions(false); }
    }, 'Delete Option');
  };

  const handlePendingSelectionChange = (optionId: string) => {
    setPendingSelectedOptionId(optionId);
  };
  
  const handleSelectOption = async (optionIdString: string) => {
    const isAuthorizedRole = currentUser?.role === 'manager' || 
                             currentUser?.role === 'duhead' || 
                             (currentUser?.userDU === 'EMT');

    if (!isAuthorizedRole || !requestId) {
        console.warn("Select option called by an unauthorized user or without a request ID.");
        return;
    }
    const optionId = parseInt(optionIdString, 10);
    const id = parseInt(currentUser.userId, 10);
    if (isNaN(optionId) || isNaN(id)) { setError("Invalid option or user ID."); return; }

    const payload: SelectTicketOptionPayload = { selectingUserId: id, comments: "" };
    setIsLoadingOptions(true);
    try {
      const response = await axios.put<{ isSuccess: boolean, errorMessages?: string[] }>(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/${optionId}/select`, payload);
      if (response.data.isSuccess) { 
        await fetchTravelRequestData(); 
        setPendingSelectedOptionId(null); // Clear pending selection on success
        setIsEditModeDUHead(false);
      }
      else { setError(response.data.errorMessages?.join(', ') || 'Failed to select option.'); }
    } catch (err) {
      console.error("Error selecting option:", err);
      setError(axios.isAxiosError(err) ? err.message : 'An error occurred while selecting option.');
    } finally { setIsLoadingOptions(false); }
  };

  const handleConfirmSelectionByApprover = async () => {
    if (!pendingSelectedOptionId) {
        setError("Please select an option before uploading.");
        return;
    }
    
    const isEmtUser = currentUser?.userDU === 'EMT';

    if (isEmtUser) {
      await handleEmtSelectAndApprove(pendingSelectedOptionId);
    } else {
      await handleSelectOption(pendingSelectedOptionId);
    }
  };

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

  const handleSaveEdit = async () => {
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

  const handleUploadActualTickets = async (data: AirlineTicketData) => { 
    console.log('Attempting to upload actual tickets. Data received:', data);
    console.log('Current Travel Request ID:', requestId);

    if (!requestId) {
      setError("Travel Request ID is missing. Cannot upload ticket details.");
      setIsUploadTicketsFileModalOpen(false);
      return;
    }

    setError(null);

    try {
      const payload = {
        TravelAgencyName: data.travelAgencyName,
        AgencyBookingCharge: data.agencyBookingCharge,
        TotalExpense: data.totalExpense,
        PdfFilePath: data.pdfFilePath, // Cloudinary URL
        Airlines: data.airlines.map(al => ({
          Name: al.name,
          Cost: al.cost
        }))
      };

      console.log('Payload for backend:', payload);

      const response = await axios.put(
        `${API_BASE_URL}/TravelRequest/${requestId}/uploadticketdetails`,
        payload
      );

      console.log('Backend response from ticket upload:', response.data);

      if (response.data && response.data.isSuccess) {
        setIsUploadTicketsFileModalOpen(false);

        await fetchTravelRequestData();
      } else {
        const errorMsg = response.data?.errorMessages?.join(', ') || 'Failed to upload ticket details. Please try again.';
        setError(errorMsg);
        console.error("Backend returned unsuccessful ticket upload:", errorMsg);
      }

    } catch (err) {
      console.error("Error during ticket details upload API call:", err);
      let errorMsg = 'An unexpected error occurred while uploading ticket details.';
      if (axios.isAxiosError(err)) {
        errorMsg = `API Error: ${err.response?.data?.errorMessages?.join(', ') || err.message || 'Server communication error.'}`;
        if (err.response?.data?.errors) {
          const modelStateErrors = Object.values(err.response.data.errors).flat().join('\n');
          errorMsg += `\nDetails: ${modelStateErrors}`;
        }
      }
      setError(errorMsg);
    } finally {
    }
  };

  const handleClearAllOptionsByAdmin = async () => {
    if (ticketOptionsFromApi.length === 0) {
      setError("There are no ticket options to clear.");
      return;
    }
    openConfirmModal("Are you sure you want to delete ALL ticket options?", async () => {
      setIsLoadingOptions(true);
      try {
        const response = await axios.delete(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/all`);
        if (response.data.isSuccess) {
          await fetchTicketOptions(requestId); // Refresh the list
        } else {
          setError(response.data.errorMessages?.join(', ') || "Failed to clear all options.");
        }
      } catch (err) {
        console.error("Error clearing all options:", err);
        setError(axios.isAxiosError(err) ? err.message : 'An error occurred while clearing options.');
      } finally {
        setIsLoadingOptions(false);
      }
    }, "Clear All Options");
  };

  const handleApproveTicketByDUHead = async () => {
    const selectedOption = ticketOptionsFromApi.find(opt => opt.isSelected);
    if (!selectedOption) {
      setError("No ticket option is selected for approval.");
      return;
    }
    if (currentUser?.role !== 'duhead') return;

    const newStatusId = 5; // 5 = DUApproved
    const userId = parseInt(currentUser.userId, 10);
    if (isNaN(userId)) {
        setError("Invalid User ID.");
        return;
    }
    
    openConfirmModal(`Approve the selected ticket option and set status to "DU Approved"?`, async () => {
        setIsLoadingStatus(true);
        try {
            const payload = {
                requestId: requestId,
                newStatusId: newStatusId,
                userId: userId,
                comments: `Ticket option ${selectedOption.optionId} approved by DU Head.`,
                actionType: "Approve"
            };

            const response = await axios.put(`${API_BASE_URL}/TravelRequest/${requestId}/updatestatus`, payload);
            
            if(response.data.isSuccess) {
                setIsEditModeDUHead(false);
                await fetchTravelRequestData(); // Re-fetch all data to show new status
            } else {
                setError(response.data.errorMessages?.join(', ') || 'Failed to approve ticket option.');
            }
        } catch (err) {
            console.error("Error approving ticket option:", err);
            setError(axios.isAxiosError(err) ? err.message : 'An error occurred while approving the ticket.');
        } finally {
            setIsLoadingStatus(false);
        }
    }, "Approve Ticket Option");
  };

  const handleSelectAndApproveByDUHead = async () => {
    if (!pendingSelectedOptionId) {
      setError("Please select an option to approve.");
      return;
    }
    if (!currentUser || currentUser.role !== 'duhead') return;

    const userId = parseInt(currentUser.userId, 10);
    const optionId = parseInt(pendingSelectedOptionId, 10);
    if (isNaN(userId) || isNaN(optionId)) {
      setError("Invalid user or option ID.");
      return;
    }

    setIsLoadingOptions(true);
    setError(null);
    try {
      const selectPayload: SelectTicketOptionPayload = { selectingUserId: userId, comments: "Option selected by DU Head during approval." };
      const selectResponse = await axios.put(`${API_BASE_URL}/travelrequests/${requestId}/ticketoptions/${optionId}/select`, selectPayload);

      if (!selectResponse.data.isSuccess) {
        throw new Error(selectResponse.data.errorMessages?.join(', ') || 'Failed to select the ticket option.');
      }

      const approvePayload = {
        requestId: requestId,
        newStatusId: 5, // 5 = DUApproved
        userId: userId,
        comments: `Ticket option ${optionId} approved by DU Head.`,
        actionType: "Approve"
      };
      const approveResponse = await axios.put(`${API_BASE_URL}/TravelRequest/${requestId}/updatestatus`, approvePayload);
      
      if (approveResponse.data.isSuccess) {
        await fetchTravelRequestData();
        setPendingSelectedOptionId(null);
        setIsEditModeDUHead(false);
      } else {
         throw new Error(approveResponse.data.errorMessages?.join(', ') || 'The option was selected, but failed to update status to DU Approved.');
      }

    } catch (err) {
      console.error("Error during DU Head select and approve process:", err);
      const errorData = (err as any).response?.data;
      setError(errorData?.errorMessages?.join(', ') || (err as Error).message || 'An error occurred during the approval process.');
      await fetchTravelRequestData();
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // EMT Ticket selection with DU Head approval bypass
  const handleEmtSelectAndApprove = async (optionIdString: string) => {
      if (!currentUser || !requestId) return;

      const optionId = parseInt(optionIdString, 10);
      const userId = parseInt(currentUser.userId, 10);
      if (isNaN(optionId) || isNaN(userId)) {
          setError("Invalid option or user ID.");
          return;
      }

      const endpoint = `${API_BASE_URL}/Approvals/${requestId}/ticketoptions/${optionId}/emt-select-and-approve`;
      const payload: SelectTicketOptionPayload = { selectingUserId: userId, comments: "Option selected and auto-approved for EMT." };

      setIsLoadingOptions(true);
      try {
          const response = await axios.put(endpoint, payload);
          if (response.data.isSuccess) {
              await fetchTravelRequestData();
          } else {
              setError(response.data.errorMessages?.join(', ') || 'Failed to select and approve option.');
          }
      } catch (err) {
          console.error("Error during EMT select and approve:", err);
          setError(axios.isAxiosError(err) ? err.message : 'An error occurred during the process.');
      } finally {
          setIsLoadingOptions(false);
      }
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
    if (travelRequestStatus === 'Cancelled') {
      return <StatusMessage title="Request Cancelled" message="This travel request has been cancelled." bgColor="bg-gray-50" borderColor="border-gray-200" iconColor="text-gray-500" titleColor="text-gray-800" textColor="text-gray-700" icon={<Clock className="h-6 w-6" />} />;
    }
    if (departmentName.toLowerCase() === 'emt') {
      return renderEMTContent(travelRequestStatus);
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
    if (status === 'DUApproved') {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onUploadTickets={() => setIsUploadTicketsFileModalOpen(true)}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          buttons={['uploadTickets']}
          customButtons={[]}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
        />
      );
    }

    if (['TicketsDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          buttons={[]}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
        />
      );
    }
    
    if (status === 'OptionSelected') {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          customButtons={[]}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
        />
      );
    }

    if (status === 'Approved' || status === 'OptionsListed') {
      return (
        <UploadTicketView
          ticketOptions={uiTicketOptions}
          newOption={newOptionText}
          editingOption={editingOptionApiItem ? editingOptionApiItem.optionId.toString() : null}
          editText={editText}
          onChangeNewOption={setNewOptionText}
          onAddOption={handleAddOption}
          onEditOption={handleInitiateEditOption}
          onDeleteOption={handleDeleteOption}
          onSaveEdit={() => handleSaveEdit()}
          onCancelEdit={() => { setEditingOptionApiItem(null); setEditText(''); }}
          onChangeEditText={setEditText}
          onUploadOptions={handleClearAllOptionsByAdmin} 
          customButtons={[]}
        />
      );
    }

    return <StatusMessage title="Awaiting Action" message={"Options management may be pending or completed."} icon={<Clock className="h-6 w-6" />} bgColor="bg-gray-50" borderColor="border-gray-200" iconColor="text-gray-500" titleColor="text-gray-800" textColor="text-gray-700" />;
  };

    const renderDUHeadContent = (status: string) => {
    if (status === 'OptionsListed' || (status === 'OptionSelected' && isEditModeDUHead)) {
      return (
        <SelectTicketView
          ticketOptions={uiTicketOptions}
          onSelectOption={handlePendingSelectionChange}
          onUploadOptions={handleSelectAndApproveByDUHead}
          selectedOptionId={pendingSelectedOptionId}
        />
      );
    }

    if (status === 'OptionSelected' && !isEditModeDUHead) {
      const selectedViewButtons: ('uploadTickets' | 'confirmTicketOption')[] = [];
      const canConfirm = uiTicketOptions.some(o => o.selected);
      if (canConfirm) {
        selectedViewButtons.push('confirmTicketOption');
      }

      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          buttons={selectedViewButtons}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
          onConfirmTicketOption={canConfirm ? handleApproveTicketByDUHead : undefined}
          customButtons={[
            {
              label: 'Change Selection',
              icon: <Edit size={16} />,
              onClick: () => {
                const currentlySelected = uiTicketOptions.find(o => o.selected);
                if (currentlySelected) {    
                    setPendingSelectedOptionId(currentlySelected.id);
                }
                setIsEditModeDUHead(true);
              },
              className: 'bg-blue-500 text-white hover:bg-blue-600',
            }
          ]}
        />
      );
    }

    if (status === 'DUApproved') {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          customButtons={[]}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
        />
      )
    }

    if (['DUApproved', 'TicketsDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return renderEmployeeContent(status);
    }
    
    return <StatusMessage title="Processing" message={`Request status: ${status}. Waiting for previous approvals.`} icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
  };

  const renderManagerContent = (status: string) => {
    if (status === 'PendingReview') {
      return <StatusMessage title="Action Required" message="This travel request is waiting for your approval." icon={<Check className="h-6 w-6" />} bgColor="bg-blue-50" borderColor="border-blue-200" iconColor="text-blue-500" titleColor="text-blue-800" textColor="text-blue-700" />;
    }
    if (status === 'OptionsListed') {
      return (
        <SelectTicketView
          ticketOptions={uiTicketOptions}
          onSelectOption={handlePendingSelectionChange}
          onUploadOptions={handleConfirmSelectionByApprover}
          selectedOptionId={pendingSelectedOptionId}
        />
      );
    }
    if (status === 'OptionSelected') {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          isModifiable={isModifiable}
          customButtons={[]}
          onDeleteTicket={onDeleteTicket}
        />
      );
    }
    if (['DUApproved', 'TicketsDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          buttons={[]}
          isModifiable={isModifiable}
          customButtons={[]}
          onDeleteTicket={onDeleteTicket}
        />
      );
    }
    return <StatusMessage title="Processing" message={`Request status: ${status}. Ticket options may be pending or handled by other roles.`} icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
  };

  const renderEmployeeContent = (status: string) => {
    if (!['OptionSelected', 'DUApproved', 'TicketsDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
      let msg = status === 'Pending' ? "Your travel request is currently under review." : "Your travel request is being processed.";
      return <StatusMessage title={status === 'Pending' ? "Under Review" : "Processing Request"} message={msg} icon={<Clock className="h-6 w-6" />} bgColor="bg-amber-50" borderColor="border-amber-200" iconColor="text-amber-500" titleColor="text-amber-800" textColor="text-amber-700" />;
    }
    const selectedOption = uiTicketOptions.find(opt => opt.selected);
    if (!selectedOption && !['Closed', 'Returned'].includes(status)) {
      return <StatusMessage title="Awaiting Tickets" message="Ticket details will be available here once finalized." icon={<Clock className="h-6 w-6" />} bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" titleColor="text-indigo-800" textColor="text-indigo-700" />;
    }
    return (
      <SelectedView
        requestId={requestId}
        ticketOptions={uiTicketOptions}
        onPreviewTickets={onPreviewTicket}
        documentPaths={ticketDocumentPath}
        buttons={selectedOption ? [] : []}
        isModifiable={isModifiable}
        customButtons={[]}
        onDeleteTicket={onDeleteTicket}
      />
    );
  };

  // console.log("Department: " + departmentName);
  const renderEMTContent = (status: string) => {
    if (status == 'Approved') {
      return renderAdminContent(status);
    }
    
    if (status === 'OptionsListed') {
      return (
        <SelectTicketView
          ticketOptions={uiTicketOptions}
          onSelectOption={handlePendingSelectionChange}
          onUploadOptions={handleConfirmSelectionByApprover}
          selectedOptionId={pendingSelectedOptionId}
        />
      );
    }
    
    if (status === 'OptionSelected') {
      return (
        <SelectedView
          requestId={requestId}
          ticketOptions={uiTicketOptions}
          onPreviewTickets={onPreviewTicket}
          documentPaths={ticketDocumentPath}
          isModifiable={isModifiable}
          onDeleteTicket={onDeleteTicket}
          customButtons={[]}
        />
      );
    }

    if (['DUApproved', 'TicketsDispatched', 'InTransit', 'Returned', 'Closed'].includes(status)) {
       if (currentUser?.role === 'admin') {
            return renderAdminContent(status);
        } else {
            return renderEmployeeContent(status);
        }
    }

    if (status === 'PendingReview') {
        return <StatusMessage title="Pending EMT Action" message="This request is pending review. Ticket options will be available after approval." icon={<Clock className="h-6 w-6" />} bgColor="bg-blue-50" borderColor="border-blue-200" iconColor="text-blue-500" titleColor="text-blue-800" textColor="text-blue-700" />;
    }

    return <StatusMessage title="Processing" message={`Request status: ${status}.`} icon={<Clock className="h-6 w-6" />} bgColor={''} borderColor={''} iconColor={''} titleColor={''} textColor={''} />;
  };

  return (
    <>
      <div className="h-[480px] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white p-2">
          <h4 className="text-md font-semibold text-gray-800">Ticket Options and Documents</h4>
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
        transportationType={transportationType}
      />
    </>
  );
};

export default TicketOptionComponent;