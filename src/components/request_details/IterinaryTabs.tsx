import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Button, Paper, Typography } from '@mui/material';
import { Upload, Download, FileText, Ban } from 'lucide-react';
import TicketOptionComponent from './ticket_options/TicketOptionsComponent';

interface DocumentUploadViewProps {
  documentType: string;
  documentPath?: string;
  userRole: string; 
  onUpload: () => void;
  onDownload: () => void;
}

const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({
  documentType,
  documentPath,
  userRole,
  onUpload,
  onDownload,
}) => {
  const isAdmin = userRole === 'admin';

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        border: '1px dashed #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <FileText size={40} color="#9e9e9e" style={{ marginBottom: '16px' }} />
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 500, 
          color: '#424242',
          fontSize: '1rem',
          mb: 1
        }}
      >
        {documentType} Document
      </Typography>
      {isAdmin ? (
        <>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              color: '#757575',
              maxWidth: '300px',
              lineHeight: 1.5
            }}
          >
            {documentPath
              ? `A document has been uploaded. You can replace it below.`
              : `No document has been uploaded for this request.`}
          </Typography>
          <Button
            variant="contained"
            disableElevation
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              backgroundColor: '#1976d2',
              borderRadius: '6px',
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
            startIcon={<Upload size={16} />}
            onClick={onUpload}
          >
            Upload {documentType}
          </Button>
          {documentPath && (
             <Button
                variant="text"
                sx={{ 
                  textTransform: 'none', 
                  mt: 1.5,
                  color: '#1976d2',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
                startIcon={<Download size={16} />}
                onClick={onDownload}
            >
                Download Current
            </Button>
          )}
        </>
      ) : (
        <>
          {documentPath ? (
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3, 
                  color: '#757575',
                  maxWidth: '300px',
                  lineHeight: 1.5
                }}
              >
                The {documentType} document is available for download.
              </Typography>
              <Button
                variant="contained"
                disableElevation
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 500,
                  backgroundColor: '#1976d2',
                  borderRadius: '6px',
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
                startIcon={<Download size={16} />}
                onClick={onDownload}
              >
                Download {documentType}
              </Button>
            </>
          ) : (
             <Box sx={{ display: 'flex', alignItems: 'center', color: '#757575' }}>
                <Ban size={18} style={{ marginRight: '8px' }}/>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Document not available yet.
                </Typography>
             </Box>
          )}
        </>
      )}
    </Box>
  );
};

// --- Main Tab Container Component ---
interface User {
  userId: string;
  email: string;
  role: string;
}

interface DocumentTabsProps {
  requestId: string;
  onPreviewTicket: (url: string) => void;
  ticketDocumentPath?: string | string[];
  accommodationDocumentPath?: string;
  insuranceDocumentPath?: string;
}

export default function DocumentTabs(props: DocumentTabsProps) {
  const { 
    requestId, 
    onPreviewTicket, 
    ticketDocumentPath, 
    accommodationDocumentPath, 
    insuranceDocumentPath 
  } = props;
  
  const [value, setValue] = React.useState('1');
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      console.error("User not found in localStorage. Please log in.");
    }
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  
  const handleUpload = (docType: string) => {
    // alert(`Initiating upload for ${docType}...`);
  };

  const handleDownload = (docType: string, path?: string) => {
    if (!path) {
        // alert(`No path available to download ${docType} document.`);
        return;
    }
    window.open(path, '_blank');
  };

  if (!currentUser) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>Loading user information...</Box>;
  }

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        bgcolor: 'background.paper',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        boxShadow: 'none'
      }}
    >
      <TabContext value={value}>
        <Box sx={{ 
          borderBottom: '1px solid #e8e8e8', 
          bgcolor: '#ffffff',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
          }
        }}>
          <TabList 
            onChange={handleChange} 
            aria-label="request document tabs"
            variant="standard"
            sx={{
              minHeight: '52px',
              px: 2,
              "& .MuiTabs-flexContainer": {
                height: '52px',
                alignItems: 'center',
                gap: 1
              },
              "& .MuiTab-root": {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                color: '#6b7280',
                padding: '14px 20px',
                minHeight: '52px',
                minWidth: 'auto',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                marginBottom: '1px',
                '&:hover': {
                  color: '#374151',
                  backgroundColor: 'rgba(59, 130, 246, 0.04)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease-in-out'
                }
              },
              "& .Mui-selected": {
                color: '#1f2937 !important',
                fontWeight: 600,
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                '&::before': {
                  width: '80%'
                }
              },
              "& .MuiTabs-indicator": {
                display: 'none'
              }
            }}
          >
            <Tab label="Tickets" value="1" />
            <Tab label="Accommodation" value="2" />
            <Tab label="Insurance" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <TicketOptionComponent
              requestId={requestId}
              onPreviewTicket={onPreviewTicket}
              ticketDocumentPath={ticketDocumentPath}
            />
          </Box>
        </TabPanel>
        <TabPanel value="2" sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <DocumentUploadView
              documentType="Accommodation"
              documentPath={accommodationDocumentPath}
              userRole={currentUser.role}
              onUpload={() => handleUpload('Accommodation')}
              onDownload={() => handleDownload('Accommodation', accommodationDocumentPath)}
            />
          </Box>
        </TabPanel>
        <TabPanel value="3" sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <DocumentUploadView
              documentType="Insurance"
              documentPath={insuranceDocumentPath}
              userRole={currentUser.role}
              onUpload={() => handleUpload('Insurance')}
              onDownload={() => handleDownload('Insurance', insuranceDocumentPath)}
            />
          </Box>
        </TabPanel>
      </TabContext>
    </Paper>
  );
}