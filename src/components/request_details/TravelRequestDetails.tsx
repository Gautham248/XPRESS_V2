import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Check, X, FileText, ChevronLeft, Download, MessageSquare, Lock, Loader2,
  Slash
} from 'lucide-react';
import ApprovalTimeline from './ApprovalTimeline';
import TravelInfo from './TravelInfo';
import TicketComponent from './ticket_options/TicketOptionsComponent';
import TravelInfoBanner from './TravelInfoBanner';
import { useModal } from './confirmation_modal/hooks/useModal';
import ConfirmationModal, { ButtonConfig } from './confirmation_modal/ConfirmationModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import TicketPreviewModal from './ticket_options/TicketPreviewModal';

// --- TYPE DEFINITIONS ---
export interface ComponentTravelRequest {
  id: string;
  userId: number;
  outboundDepartureDate: string;
  returnDepartureDate: string;
  outboundArrivalDate?: string;
  returnArrivalDate?: string;
  purpose: string;
  submissionDate: string;
  transportation?: string;
  destination?: string;
  sourcePlace?: string;
  sourceCountry?: string;
  destinationCountry?: string;
  isAccommodationRequired?: boolean;
  isPickUpRequired?: boolean;
  isDropOffRequired?: boolean;
  pickupPlace?: string;
  dropoffPlace?: string;
  comments?: string;
  isVegetarian?: boolean;
  attendedCct?: boolean;
  travelAgencyName?: string;
  totalExpense?: number;
  ticketDocumentPath?: string;
  updatedAt?: string;
  employeeName?: string;
  isInternational?: boolean;
  isRoundTrip?: boolean;
  projectName?: string;
  selectedTicketOptionId?: number;
  createdAt?: string;
  currentStatusId: number;
  status: 'PendingReview' | 'Approved' | 'OptionsListed' | 'OptionSelected' |
           'DUApproved' | 'BUApproved' | 'TicketsDispatched' | 'InTransit' |
           'Returned' | 'Closed' | 'Cancelled' | 'Rejected' | 'Modified';
}

interface DocumentInfo {
  id: string;
  url: string;
  friendlyName: string;
  docData: any;
}

export const STATUS_ORDER_ARRAY: ReadonlyArray<ComponentTravelRequest['status']> = [
  'PendingReview','Approved','OptionsListed','OptionSelected','DUApproved','BUApproved','TicketsDispatched','InTransit','Returned','Closed','Cancelled','Rejected','Modified'
] as const;
export const INDEX_TO_STATUS_MAP: Readonly<Record<number, ComponentTravelRequest['status']>> =
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => ({...acc, [index + 1]: status}), {} as Record<number, ComponentTravelRequest['status']>);
export const STATUS_TO_INDEX_MAP: Readonly<Record<ComponentTravelRequest['status'], number>> =
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => ({...acc, [status]: index + 1}), {} as Record<ComponentTravelRequest['status'], number>);
const STATUS_DISPLAY_NAMES_HEADER: Record<ComponentTravelRequest['status'] | string, string> = {
  PendingReview: 'Pending Review', Approved: 'Approved', OptionsListed: 'Options Listed', OptionSelected: 'Option Selected', DUApproved: 'DU Approved', BUApproved: 'BU Approved', TicketsDispatched: 'Ticket Dispatched', InTransit: 'In Transit', Returned: 'Returned', Closed: 'Closed', Cancelled: 'Cancelled', Rejected: 'Rejected', Modified: 'Modified',
};
const getDisplayStatusName = (rawStatus?: ComponentTravelRequest['status'] | string): string => {
  if (rawStatus && typeof rawStatus === 'string') return STATUS_DISPLAY_NAMES_HEADER[rawStatus] || rawStatus.replace(/([A-Z])/g, ' $1').trim();
  return 'Status Unknown';
};
const getStatusBadgeStyles = (status?: ComponentTravelRequest['status'] | string): string => {
    if (!status) return 'bg-gray-200 text-gray-800 border border-gray-400';
    switch (status) {
      case 'PendingReview': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Approved': return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'OptionsListed': return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
      case 'OptionSelected': return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'DUApproved': case 'BUApproved': return 'bg-teal-100 text-teal-700 border border-teal-300';
      case 'TicketsDispatched': return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
      case 'InTransit': return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'Returned': return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Closed': return 'bg-green-100 text-green-700 border border-green-300';
      case 'Cancelled': return 'bg-gray-300 text-gray-700 border border-gray-300';
      case 'Rejected': return 'bg-red-100 text-red-700 border border-red-300';
      case 'Modified': return 'bg-pink-100 text-pink-700 border border-pink-300';
      default: return 'bg-gray-200 text-gray-800 border border-gray-400';
    }
};

const TravelRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, openModal: showModalContainer, closeModal: hideModalContainer } = useModal();

  const [travelRequestData, setTravelRequestData] = useState<ComponentTravelRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);
  const [requestClosed, setRequestClosed] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [isPreparingDocs, setIsPreparingDocs] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<DocumentInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const [modalInputText, setModalInputText] = useState('');
  const [isTicketPreviewModalOpen, setIsTicketPreviewModalOpen] = useState(false);
  const [ticketPreviewUrl, setTicketPreviewUrl] = useState<string>('');

  const userString = localStorage.getItem('user');
  let role = '';
  let userId: number | undefined = undefined;
  
  console.log(travelRequestData?.ticketDocumentPath);

  if (userString) {
    const user = JSON.parse(userString);
    role = user.role;
    userId = parseInt(user.userId, 10);
  }

  const fetchTravelRequest = useCallback(async () => {
    if (!id) { setIsLoading(false); setError("Travel Request ID is missing."); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5030/api/TravelRequest/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      
      const data = await response.json();

      console.log("API response for TravelRequestDetails:", data.result);

      if (data.isSuccess && data.result) {
        const apiData = data.result;
        setTravelRequestData({
          ...apiData,
          id: apiData.requestId,
          purpose: apiData.purposeOfTravel,
          status: INDEX_TO_STATUS_MAP[apiData.currentStatusId] || 'PendingReview',
          employeeName: apiData.employeeName,
        });
      } else {
        throw new Error(data.errorMessages?.join(', ') || 'Data not found.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTravelRequest(); }, [fetchTravelRequest]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
  };

  const getFriendlyFilename = (doc: any): string => {
    const extension = doc.documentPath?.split('.').pop() || 'file';
    let name = `${doc.idType}-${doc.id}`;
    if (doc.idType === 'TravelTicket') name = `TravelTicket-${doc.id}`;
    else if (doc.idType === 'Passport' && doc.passportNumber) name = `Passport-${doc.passportNumber}`;
    else if (doc.idType === 'Visa' && doc.visaNumber) name = `Visa-${doc.issuingCountry}-${doc.visaNumber}`;
    else if (doc.idType === 'Aadhar' && doc.aadharName) name = `Aadhar-${doc.aadharName.replace(/\s/g, '_')}`;
    return `${name}.${extension}`;
  };

  const handleCloseModal = () => {
    hideModalContainer();
    setActiveModal(null);
    setModalInputText('');
  };

  const handleOpenDownloadModal = async () => {
    if (!id || !travelRequestData?.userId) return;
    setIsPreparingDocs(true);
    try {
      let docs: DocumentInfo[] = [];
      if (travelRequestData.ticketDocumentPath) {
        docs.push({ id: `ticket_${id}`, url: `http://localhost:5030/api/TravelRequest/${id}/downloadticket`, friendlyName: getFriendlyFilename({ idType: 'TravelTicket', id, documentPath: travelRequestData.ticketDocumentPath }), docData: {} });
      }
      const response = await fetch(`http://localhost:5030/api/Documents/User/${travelRequestData.userId}`);
      if (response.ok) {
        (await response.json())?.forEach((doc: any) => docs.push({ id: `doc_${doc.id}`, url: doc.documentPath, friendlyName: getFriendlyFilename(doc), docData: doc }));
      }
      if (docs.length === 0) { alert('No documents available.'); return; }
      setAvailableDocs(docs);
      setSelectedDocs(new Set(docs.map(d => d.id)));
      setActiveModal('download');
      showModalContainer(<></>);
    } finally {
      setIsPreparingDocs(false);
    }
  };

  const handleZipAndDownload = async () => {
    if (selectedDocs.size === 0 || !travelRequestData) return;
    setIsZipping(true);
    try {
      const docsToZip = availableDocs.filter(doc => selectedDocs.has(doc.id));
      const files = await Promise.all(
        docsToZip.map(info => fetch(info.url).then(res => res.blob()).then(blob => ({ name: info.friendlyName, blob })))
      );

      const zip = new JSZip();
      files.forEach(file => zip.file(file.name, file.blob));

      // SANITIZE EMPLOYEE NAME FOR FILENAME ---
      const employeeName = travelRequestData.employeeName?.replace(/\s+/g, '_') || 'Employee';
      const zipFilename = `${employeeName}-TravelDocs-${id}.zip`;

      saveAs(await zip.generateAsync({ type: 'blob' }), zipFilename);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create or download zip file:", error);
      alert("An error occurred while creating the zip file. Please try again.");
    } finally {
      setIsZipping(false);
    }
  };

    const handlePreviewTicket = () => {
    if (travelRequestData && travelRequestData.ticketDocumentPath) {
      
      setTicketPreviewUrl(travelRequestData.ticketDocumentPath);
      console.log("ticket url: ", ticketPreviewUrl);
      
      setIsTicketPreviewModalOpen(true);
    } else {
      alert("No ticket document is available for preview.");
      console.warn("Preview requested, but 'uploadedTicketPdfPath' is missing from travelRequestData.");
    }
  };

  const handleSelectionChange = (docId: string) => {
    setSelectedDocs(prev => { const newSet = new Set(prev); newSet.has(docId) ? newSet.delete(docId) : newSet.add(docId); return newSet; });
  };
  
  const handleSubmitFeedback = async () => {
    await fetch(`http://localhost:5030/api/TravelRequest/${id}/travelfeedback`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedbackText: modalInputText, submittingUserId: userId }) });
    setFeedbackSubmitted(true);
    handleCloseModal();
  };
  const handleSubmitCloseRequest = async () => {
    await axios.put(`http://localhost:5030/api/TravelRequest/${id}/updatestatus`, { requestId: id, newStatusId: 10, userId, comments: modalInputText, actionType: "CloseRequest" });
    setRequestClosed(true);
    fetchTravelRequest();
    handleCloseModal();
  };
  const handleSubmitApproval = async () => {
    await fetch(`http://localhost:5030/api/Approvals/${id}/manager/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvingUserId: userId, comments: modalInputText }) });
    setActionTaken(true);
    fetchTravelRequest();
    handleCloseModal();
  };
  const handleSubmitRejection = async () => {
    if (!modalInputText.trim()) { alert('Please provide a rejection reason.'); return; }
    await fetch(`http://localhost:5030/api/Approvals/${id}/manager/reject`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rejectingUserId: userId, comments: modalInputText }) });
    setActionTaken(true);
    fetchTravelRequest();
    handleCloseModal();
  };
   const handleSubmitCancelRequest = async () => {
    const CANCELLED_STATUS_ID = 11;
    if (!modalInputText.trim()) {
      alert("A reason for cancellation is required.");
      return;
    }
    await axios.put(`http://localhost:5030/api/TravelRequest/${id}/updatestatus`, {
      requestId: id,
      newStatusId: CANCELLED_STATUS_ID,
      userId: userId,
      comments: modalInputText,
      actionType: "CancelRequest"
    });
    fetchTravelRequest();
    handleCloseModal();
  };

  if (isLoading) return <div className="p-8 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!travelRequestData) return <div className="p-8 text-center text-gray-600">Travel request not found.</div>;

  let modalTitle: string | undefined;
  let modalContent: ReactNode = '';
  let modalButtons: ButtonConfig[] = [];

  switch (activeModal) {
    case 'cancel':
      modalTitle = 'Cancel Travel Request';
      modalContent = (<>
        <p className="text-sm text-gray-600 mb-3">Please provide a reason for cancelling this request. This action cannot be undone.</p>
        <textarea
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          placeholder="Reason for cancellation (required)..."
          rows={4}
          value={modalInputText}
          onChange={(e) => setModalInputText(e.target.value)}
        />
      </>);
      modalButtons = [
        { text: 'Back', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal },
        { text: 'Confirm Cancellation', bgColor: 'bg-red-600', onClick: handleSubmitCancelRequest }
      ];
      break;
    case 'download':
      modalTitle = 'Download Documents';
      modalContent = (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select documents to include in the zip file.</p>
          <div className="max-h-64 overflow-y-auto rounded-md border p-3 space-y-2 bg-gray-50">{availableDocs.map(doc => (
            <label key={doc.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedDocs.has(doc.id)} onChange={() => handleSelectionChange(doc.id)} />
              <span className="text-gray-800">{doc.friendlyName}</span>
            </label>
          ))}</div>
        </div>
      );
      modalButtons = [
        { text: 'Cancel', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal },
        { text: isZipping ? 'Zipping...' : `Download (${selectedDocs.size})`, bgColor: 'bg-blue-600', onClick: handleZipAndDownload }
      ];
      break;
    case 'feedback':
      modalTitle = 'Submit Feedback';
      modalContent = <textarea className="w-full p-2 border rounded" placeholder="Enter your feedback..." rows={4} value={modalInputText} onChange={(e) => setModalInputText(e.target.value)} />;
      modalButtons = [{ text: 'Cancel', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal }, { text: 'Send', bgColor: 'bg-blue-600', onClick: handleSubmitFeedback }];
      break;
    case 'closeRequest':
      modalTitle = 'Finalize Request';
      modalContent = (<>
        <p className="text-red-600 mb-3 italic">This action cannot be undone.</p>
        <textarea className="w-full p-2 border rounded" placeholder="Closing remarks (optional)..." rows={4} value={modalInputText} onChange={(e) => setModalInputText(e.target.value)} />
      </>);
      modalButtons = [{ text: 'Cancel', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal }, { text: 'Confirm', bgColor: 'bg-blue-600', onClick: handleSubmitCloseRequest }];
      break;
    case 'approve':
      modalTitle = 'Approve Travel Request';
      modalContent = <textarea className="w-full p-2 border rounded" placeholder="Approval comments (optional)..." rows={4} value={modalInputText} onChange={(e) => setModalInputText(e.target.value)} />;
      modalButtons = [{ text: 'Cancel', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal }, { text: 'Confirm Approval', bgColor: 'bg-blue-600', onClick: handleSubmitApproval }];
      break;
    case 'reject':
      modalTitle = 'Reject Travel Request';
      modalContent = <textarea className="w-full p-2 border rounded" placeholder="Rejection reason (required)..." rows={4} value={modalInputText} onChange={(e) => setModalInputText(e.target.value)} />;
      modalButtons = [{ text: 'Cancel', bgColor: 'bg-gray-300', textColor: 'text-black', onClick: handleCloseModal }, { text: 'Confirm Rejection', bgColor: 'bg-red-600', onClick: handleSubmitRejection }];
      break;
  }
  
  const statusBadgeClasses = getStatusBadgeStyles(travelRequestData.status);
  const displayStatusName = getDisplayStatusName(travelRequestData.status);
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const showFeedbackButton = isEmployee && travelRequestData.status === 'Returned' && !feedbackSubmitted;
  const showCloseRequestButton = isAdmin && travelRequestData.status === 'Returned' && !requestClosed;
  const showManagerActionButtons = isManager && travelRequestData.status === 'PendingReview' && !actionTaken;
  const areAnyDocumentsAvailable = !!travelRequestData.ticketDocumentPath || (travelRequestData.userId > 0);
  const isRequestActive = travelRequestData.currentStatusId < 10;
  const showCancelButton = (isManager || isEmployee) && isRequestActive;

  return (
    <div className="space-y-6 animate-fadeIn">
      <ConfirmationModal isOpen={isOpen} onClose={handleCloseModal} title={modalTitle} content={modalContent} buttons={modalButtons} />
      {id && (
        <TicketPreviewModal
          isOpen={isTicketPreviewModalOpen}
          onClose={() => setIsTicketPreviewModalOpen(false)}
          ticketUrl={ticketPreviewUrl}
          downloadUrl={`http://localhost:5030/api/TravelRequest/${id}/downloadticket`}
        />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300" aria-label="Go back"><ChevronLeft className="h-5 w-5" /></button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">{travelRequestData.id}<span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadgeClasses}`}>{displayStatusName}</span></h2>
            <p className="text-sm text-gray-500 mt-1">{travelRequestData.destination || travelRequestData.purpose} • {formatDate(travelRequestData.outboundDepartureDate)} to {formatDate(travelRequestData.returnArrivalDate || travelRequestData.returnDepartureDate)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:ml-auto">
          {showCloseRequestButton && (
            <button className="btn-secondary flex items-center" onClick={() => { setModalInputText(''); setActiveModal('closeRequest'); showModalContainer(<></>); }}>
              <Lock className="h-4 w-4 mr-2" />Finalize Request
            </button>
          )}
          {showFeedbackButton && (
            <button className="btn-secondary flex items-center" onClick={() => { setModalInputText(''); setActiveModal('feedback'); showModalContainer(<></>); }}>
              <MessageSquare className="h-4 w-4 mr-2" />Submit Feedback
            </button>
          )}
          {showManagerActionButtons && (
            <>
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-md px-3 py-2 text-sm font-medium flex items-center" onClick={() => { setModalInputText(''); setActiveModal('approve'); showModalContainer(<></>); }}>
                <Check className="h-4 w-4 mr-2" />Approve
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white rounded-md px-3 py-2 text-sm font-medium flex items-center" onClick={() => { setModalInputText(''); setActiveModal('reject'); showModalContainer(<></>); }}>
                <X className="h-4 w-4 mr-2" />Reject
              </button>
            </>
          )}
          {showCancelButton && (
             <button
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-md px-3 py-2 text-sm font-medium flex items-center"
                onClick={() => { setModalInputText(''); setActiveModal('cancel'); showModalContainer(<></>); }}
              >
                <Slash className="h-4 w-4 mr-2" />
                Cancel Request
              </button>
          )}
          <button className="btn-primary flex items-center" onClick={handleOpenDownloadModal} disabled={!areAnyDocumentsAvailable || isPreparingDocs}>
            {isPreparingDocs ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Preparing...</> : <><Download className="h-4 w-4 mr-2" />Travel Docs</>}
          </button>
          <button className="btn-accent flex items-center"><FileText className="h-4 w-4 mr-2" />Export</button>
        </div>
      </div>
      
      {id && <TravelInfoBanner requestId={id} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {id && <TravelInfo requestId={id} />}
          {id && <TicketComponent requestId={id} onPreviewTicket={handlePreviewTicket} ticketDocumentPath={travelRequestData.ticketDocumentPath}/>}
        </div>
        <div className="lg:col-span-1">{id && <ApprovalTimeline requestId={id} />}</div>
      </div>
    </div>
  );
};

export default TravelRequestDetails;