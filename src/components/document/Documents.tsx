// Documents.tsx
import React, { useState, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import toast
import DocumentTabs from './DocumentTabs';
import DocumentForm from './DocumentForm';
import DocumentList from './DocumentList';
import FileUploader, { BackendDocumentRecord } from './FileUploader';
import { DocumentType, DocumentState, FormState, Action, initialState as formInitialState } from './types';

const formReducer = (state: DocumentState, action: Action): DocumentState => { /* ... (no change) ... */ 
  switch (action.type) {
    case 'UPDATE_FIELD':
      if (!action.field) {
        console.warn("UPDATE_FIELD dispatched without a field name.");
        return state;
      }
      return {
        ...state,
        [action.docType]: {
          ...state[action.docType!],
          [action.field]: action.value,
        },
      };
    case 'RESET_FORM':
      return {
        ...state,
        [action.docType]: formInitialState[action.docType],
      };
    default:
      return state;
  }
};

interface PendingRecordInfo {
  id: number;
  initialRecord: BackendDocumentRecord; 
}

const parseDateSafe = (dateInput: string | Date | null | undefined): Date | null => { /* ... (no change from previous complete version) ... */ 
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) {
            console.warn("Invalid date string encountered during parsing:", dateInput);
            return null;
        }
        return d;
    } catch (e) {
        console.warn("Error parsing date string:", dateInput, e);
        return null;
    }
};
const formatToISOString = (dateInput: string | Date | null | undefined): string | null => { /* ... (no change from previous complete version) ... */ 
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) {
            console.warn("Invalid Date object encountered for ISO conversion:", dateInput);
            return null;
        }
        return dateInput.toISOString();
    }
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) {
            console.warn("Invalid date string for ISO conversion:", dateInput);
            return null;
        }
        return d.toISOString();
    } catch (e) {
        console.warn("Error converting date string to ISO:", dateInput, e);
        return null;
    }
};

function Documents() {
  const [activeTab, setActiveTab] = useState<DocumentType>('Passport');
  const [selectedFiles, setSelectedFiles] = useState<Record<DocumentType, File | null>>({
    Passport: null, Visa: null, Aadhar: null,
  });
  const [state, dispatch] = useReducer(formReducer, formInitialState);
  const [showValidation, setShowValidation] = useState(false);
  const [pendingFormRecords, setPendingFormRecords] = useState<Partial<Record<DocumentType, PendingRecordInfo>>>({});

  const userId = 1;
  useEffect(() => {
    setShowValidation(false);
  }, [activeTab]);

  const handleRecordCreated = (recordFromApi: BackendDocumentRecord, docType: DocumentType) => {
    console.log(`Record created via POST for ${docType} (with Date objects):`, recordFromApi);
    setPendingFormRecords(prev => ({
      ...prev,
      [docType]: { id: recordFromApi.id, initialRecord: recordFromApi }
    }));
    setSelectedFiles(prev => ({ ...prev, [docType]: null }));
    // Use toast instead of alert
    toast.success(`Document ${docType} uploaded. Please fill details below.`);
  };

  const handleUploadError = (error: string) => {
    console.error('FileUploader Error:', error);
    // Use toast instead of alert
    toast.error(`Upload Error: ${error}`);
  };

  const handleFileSelect = (file: File | null) => { /* ... (no change) ... */ 
    setSelectedFiles((prev) => ({ ...prev, [activeTab]: file }));
    if (file && pendingFormRecords[activeTab]) {
        console.warn(`A new file selected for ${activeTab}, but a previous upload is pending details. The new upload will create a new record if submitted.`);
    }
  };
  
  const mapFormStateToPayloadForPut = (
    currentFormState: FormState, 
    docType: DocumentType,
    initialRecord: BackendDocumentRecord 
  ): any => { /* ... (no change from previous complete version that sends FULL object) ... */ 
    const payloadWithIsoDates: any = {
        ...initialRecord, 
        uploadDate: formatToISOString(initialRecord.uploadDate) || new Date(0).toISOString(),
        passportIssueDate: formatToISOString(initialRecord.passportIssueDate),
        passportExpiryDate: formatToISOString(initialRecord.passportExpiryDate),
        visaIssueDate: formatToISOString(initialRecord.visaIssueDate),
        visaExpiryDate: formatToISOString(initialRecord.visaExpiryDate),
    };
    switch (docType) {
      case 'Passport':
        payloadWithIsoDates.passportNumber = currentFormState.passportNumber || "";
        payloadWithIsoDates.issuingCountry = currentFormState.issuingCountry || "";
        payloadWithIsoDates.passportIssueDate = formatToISOString(currentFormState.issueDate); 
        payloadWithIsoDates.passportExpiryDate = formatToISOString(currentFormState.expiryDate); 
        break;
      case 'Visa':
        payloadWithIsoDates.visaNumber = currentFormState.visaNumber || "";
        payloadWithIsoDates.visaClass = currentFormState.visaClass || "";
        payloadWithIsoDates.issuingCountry = currentFormState.issuingCountry || "";
        payloadWithIsoDates.issuingPost = currentFormState.issuingPost || "";
        payloadWithIsoDates.visaIssueDate = formatToISOString(currentFormState.issueDate); 
        payloadWithIsoDates.visaExpiryDate = formatToISOString(currentFormState.expiryDate); 
        break;
      case 'Aadhar':
        payloadWithIsoDates.aadharNumber = currentFormState.idNumber || "";
        payloadWithIsoDates.aadharName = currentFormState.fullName || "";
        break;
    }
    return payloadWithIsoDates;
  };

  const handleSaveDetails = async (currentFormState: FormState, recordId: number, docType: DocumentType) => {
    const pendingRecordInfo = pendingFormRecords[docType];
    if (!pendingRecordInfo || !pendingRecordInfo.initialRecord) {
        const errorMessage = "Error: Could not find complete pending record information. Cannot save details.";
        console.error(errorMessage);
        toast.error(errorMessage); // Use toast
        throw new Error(errorMessage); 
    }

    console.log(`Attempting to PUT details for ${docType}, record ID ${recordId}:`, currentFormState);    
    const payloadForApi = mapFormStateToPayloadForPut(currentFormState, docType, pendingRecordInfo.initialRecord);
    
    const toastId = toast.loading(`Saving ${docType} details...`); // Loading toast

    console.log('Sending FULL PUT payload (dates as ISO strings):', JSON.stringify(payloadForApi, null, 2));

    try {
      const response = await axios.put(`http://localhost:5030/api/Documents/${recordId}`, payloadForApi, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      console.log('Document details updated successfully via PUT:', response.data);
      toast.success(`${docType} details saved successfully!`, { id: toastId }); // Update loading toast to success
      
      dispatch({ type: 'RESET_FORM', docType }); 
      setPendingFormRecords(prev => { 
        const newState = {...prev};
        delete newState[docType];
        return newState;
      });
    } catch (error) {
      console.error(`Failed to update ${docType} details (PUT):`, error);
      let errorMessage = `Failed to save ${docType} details.`;
      if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Backend Error Response (PUT):', { status: error.response.status, data: error.response.data, headers: error.response.headers });
            const responseData = error.response.data;
            errorMessage += ` Server: ${responseData?.title || responseData?.message || JSON.stringify(responseData?.errors || responseData || 'Unknown server error')}`;
          } else if (error.request) {
            errorMessage += ' No response from server.';
          } else {
            errorMessage += ` Axios setup: ${error.message}`;
          }
      } else if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      }
      toast.error(errorMessage, { id: toastId }); // Update loading toast to error
      throw error; 
    }
  };

  const currentPendingRecord = pendingFormRecords[activeTab];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-[fadeIn_0.5s_ease-in]">
      <Toaster position="top-right" reverseOrder={false} /> {/* Add Toaster component */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Travel Documents</h2>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <DocumentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Document Image/PDF</h3>
            <FileUploader
              docType={activeTab}
              onFileSelect={handleFileSelect}
              showValidation={showValidation}
              selectedFile={selectedFiles[activeTab]}
              onRecordCreated={handleRecordCreated} // Will now trigger a toast
              onUploadError={handleUploadError}     // Will now trigger a toast
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Information</h3>
            {currentPendingRecord ? (
                 <p className="text-sm text-blue-600 mb-2">
                    Now fill in the details for the uploaded {activeTab} (Record ID: {currentPendingRecord.id}).
                 </p>
            ) : (
                <p className="text-sm text-gray-500 mb-2">
                    Please upload the {activeTab} document image/PDF first to enable this form.
                </p>
            )}
            <DocumentForm
              docType={activeTab}
              formState={state[activeTab]}
              dispatch={dispatch}
              recordId={currentPendingRecord ? currentPendingRecord.id : null}
              onSave={handleSaveDetails} // Will now trigger loading/success/error toasts
            />
          </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Documents</h3>
            <DocumentList 
                docType={activeTab} 
                userId={userId}
                key={`${activeTab}-${currentPendingRecord ? currentPendingRecord.id : 'none'}-${Object.keys(pendingFormRecords).length}`} 
            />
        </div>
      </div>               
    </div>
  );
}

export default Documents;