import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Paper, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { 
  ConfirmationNumberOutlined as TicketIcon,
  BusinessOutlined as AccommodationIcon,
  SecurityOutlined as InsuranceIcon
} from '@mui/icons-material';
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
    requestId, currentStatusId, onPreviewDocument,
    accommodationDocumentPath = [], insuranceDocumentPath = [],
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

  const allowedStatusIds = [5, 6, 7, 8]; // DUApproved, BUApproved, TicketDispatched, Intransit
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
    <Paper 
      variant="outlined" 
      sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      <TabContext value={value}>
        <Box sx={{ 
          borderBottom: 0,
          padding: '16px',
          // background: '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <TabList 
            onChange={(_e, v) => setValue(v)} 
            aria-label="document tabs" 
            variant="fullWidth"
            sx={{
              borderRadius: '8px',
              padding: '2px',
              margin: '0',
              minHeight: 'auto',
              '& .MuiTabs-indicator': {
                display: 'none'
              },
              '& .MuiTabs-flexContainer': {
                gap: '4px'
              }
            }}
          >
            <Tab 
              icon={<TicketIcon sx={{ fontSize: '20px'}} />}
              label="Tickets" 
              value="1" 
              sx={{
                flex: 1,
                padding: '15px 20px',
                textAlign: 'center',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                color: '#6b7280',
                minHeight: 'auto',
                textTransform: 'none',
                fontSize: '14px',
                flexDirection: 'row',
                gap: '8px',
                '& .MuiTab-iconWrapper': {
                  marginBottom: 0,
                  marginRight: 0
                },
                '&.Mui-selected': {
                  background: 'white',
                  color: '#0555eb',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb'
                },
                '&:hover:not(.Mui-selected)': {
                  background: 'rgba(255,255,255,0.7)',
                  color: '#374151'
                }
              }}
            />
            <Tab 
              icon={<AccommodationIcon sx={{ fontSize: '20px'}} />}
              label="Accommodation" 
              value="2" 
              sx={{
                flex: 1,
                padding: '15px 20px',
                textAlign: 'center',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                color: '#6b7280',
                minHeight: 'auto',
                textTransform: 'none',
                fontSize: '14px',
                flexDirection: 'row',
                gap: '8px',
                '& .MuiTab-iconWrapper': {
                  marginBottom: 0,
                  marginRight: 0
                },
                '&.Mui-selected': {
                  background: 'white',
                  color: '#0555eb',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb'
                },
                '&:hover:not(.Mui-selected)': {
                  background: 'rgba(255,255,255,0.7)',
                  color: '#374151'
                }
              }}
            />
            <Tab 
              icon={<InsuranceIcon sx={{ fontSize: '20px' }} />}
              label="Insurance" 
              value="3" 
              sx={{
                flex: 1,
                padding: '15px 20px',
                textAlign: 'center',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                color: '#6b7280',
                minHeight: 'auto',
                textTransform: 'none',
                fontSize: '14px',
                flexDirection: 'row',
                gap: '8px',
                '& .MuiTab-iconWrapper': {
                  marginBottom: 0,
                  marginRight: 0
                },
                '&.Mui-selected': {
                  background: 'white',
                  color: '#0555eb',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb'
                },
                '&:hover:not(.Mui-selected)': {
                  background: 'rgba(255,255,255,0.7)',
                  color: '#374151'
                }
              }}
            />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: '20px', color: '#333' }}>
          <TicketOptionComponent 
            {...props}
            isModifiable={isModifiable}
            onDeleteTicket={(index) => handleDelete('Ticket', index)}
          />
        </TabPanel>
        <TabPanel value="2" sx={{ p: '20px', color: '#333' }}>
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
        <TabPanel value="3" sx={{ p: '20px', color: '#333' }}>
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