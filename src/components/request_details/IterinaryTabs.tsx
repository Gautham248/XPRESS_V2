import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Paper, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useModal } from './confirmation_modal/hooks/useModal';
import TicketOptionComponent from './ticket_options/TicketOptionsComponent';
import DocumentListView from './ticket_options/DocumentListView';
import UploadDocumentsModal from './ticket_options/UploadDocumentsModal';
import ConfirmationModal from './confirmation_modal/ConfirmationModal';

interface User { userId: string; role: string; }
interface DocumentTabsProps {
  requestId: string;
  currentStatusId: number;
  onPreviewTicket: (url: string, index: number) => void;
  onPreviewDocument: (docType: 'Accommodation' | 'Insurance', url: string, index: number) => void;
  ticketDocumentPath?: string[];
  accommodationDocumentPath?: string[];
  insuranceDocumentPath?: string[];
  refreshRequestData: () => void;
}

const API_BASE_URL = 'http://localhost:5030/api';

export default function DocumentTabs(props: DocumentTabsProps) {
  const { 
    requestId, currentStatusId, onPreviewTicket, onPreviewDocument,
    ticketDocumentPath = [], accommodationDocumentPath = [], insuranceDocumentPath = [],
    refreshRequestData,
  } = props;

  const [value, setValue] = useState('1');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModalType, setUploadModalType] = useState<'Accommodation' | 'Insurance' | null>(null);
  const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal();
  const [deleteAction, setDeleteAction] = useState<{ action: () => void } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const allowedStatusIds = [5, 6, 7, 8];
  const isModifiable = currentUser?.role === 'admin' && allowedStatusIds.includes(currentStatusId);

  const handleConfirmUpload = async (docType: 'Accommodation' | 'Insurance', fileUrls: string[]) => {
    const endpoint = `${API_BASE_URL}/TravelRequest/${requestId}/documents/${docType.toLowerCase()}`;
    setIsLoading(true);
    const toastId = toast.loading(`Saving ${docType} document URLs...`);
    try {
      await axios.post(endpoint, { documentUrls: fileUrls });
      toast.success(`Saved successfully!`, { id: toastId });
      refreshRequestData();
    } catch (error: any) {
      toast.error(error.response?.data?.title || `Save failed.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (docType: 'Ticket' | 'Accommodation' | 'Insurance', index: number) => {
    setDeleteAction({
      action: async () => {
        closeConfirm();
        const endpoint = `${API_BASE_URL}/TravelRequest/${requestId}/documents/${docType.toLowerCase()}?index=${index}`;
        const toastId = toast.loading(`Deleting document...`);
        try {
          await axios.delete(endpoint);
          toast.success(`Document deleted.`, { id: toastId });
          refreshRequestData();
        } catch (error: any) {
          toast.error(error.response?.data?.title || `Deletion failed.`, { id: toastId });
        }
      },
    });
    openConfirm("Are you sure you want to permanently delete this document?");
  };

  if (!currentUser) return <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>;

  return (
    <Paper variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(_e, v) => setValue(v)} aria-label="document tabs" variant="fullWidth">
            <Tab label="Tickets" value="1" />
            <Tab label="Accommodation" value="2" />
            <Tab label="Insurance" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 3 }}>
          <TicketOptionComponent 
            {...props}
            isModifiable={isModifiable}
            onDeleteTicket={(index) => handleDelete('Ticket', index)}
          />
        </TabPanel>
        <TabPanel value="2" sx={{ p: 2 }}>
          <DocumentListView
            documentType="Accommodation"
            documentPaths={accommodationDocumentPath}
            isModifiable={isModifiable}
            onUploadClick={() => setUploadModalType('Accommodation')}
            onPreview={(path, index) => onPreviewDocument('Accommodation', path, index)}
            onDelete={(index) => handleDelete('Accommodation', index)}
            isLoading={isLoading}
          />
        </TabPanel>
        <TabPanel value="3" sx={{ p: 2 }}>
          <DocumentListView
            documentType="Insurance"
            documentPaths={insuranceDocumentPath}
            isModifiable={isModifiable}
            onUploadClick={() => setUploadModalType('Insurance')}
            onPreview={(path, index) => onPreviewDocument('Insurance', path, index)}
            onDelete={(index) => handleDelete('Insurance', index)}
            isLoading={isLoading}
          />
        </TabPanel>
      </TabContext>
      {uploadModalType && (
        <UploadDocumentsModal
          isOpen={!!uploadModalType}
          onClose={() => setUploadModalType(null)}
          onConfirm={(fileUrls) => handleConfirmUpload(uploadModalType, fileUrls)}
          documentType={uploadModalType}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        title="Confirm Deletion"
        content="Are you sure you want to permanently delete this document?"
        buttons={[
          { text: 'Cancel', onClick: closeConfirm, bgColor: 'bg-gray-300', textColor: 'text-black' },
          { text: 'Delete', onClick: () => deleteAction?.action(), bgColor: 'bg-red-600' },
        ]}
      />
    </Paper>
  );
}