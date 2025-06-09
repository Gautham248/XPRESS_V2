// src/components/Documents.tsx

import React, { useState, useReducer, useRef, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { DocumentType, DocumentState, FormState, Action, initialState as formInitialState } from './types';

// Import Components and Parsers
import DocumentTabs from './DocumentTabs';
import DocumentForm from './DocumentForm';
import DocumentList from './DocumentList';
import FileUploader, { BackendDocumentRecord } from './FileUploader';
import OcrProcessor from './OCRProcessor';
import PassportParser, { ParsedPassportInfo } from './Parsers/PassportParser';
import AadharParser, { ParsedAadhaarInfo } from './Parsers/AadharParser';
import VisaParser, { ParsedVisaInfo } from './Parsers/VisaParser';

// Define a union type for all possible parsed data shapes
type ParsedInfo = ParsedPassportInfo | ParsedAadhaarInfo | ParsedVisaInfo;

// Reducer function to manage form state
const formReducer = (state: DocumentState, action: Action): DocumentState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      if (!action.field) {
        return state;
      }
      return {
        ...state,
        [action.docType]: {
          ...state[action.docType],
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

// Helper function to format dates into ISO 8601 strings for the backend
const formatToISOString = (dateInput: string | Date | null | undefined): string | null => {
    if (!dateInput) return null;
    let dateObj: Date;
    if (dateInput instanceof Date) {
        dateObj = dateInput;
    } else {
        dateObj = new Date(dateInput);
    }
    if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date value provided for ISO conversion:", dateInput);
        return null;
    }
    return dateObj.toISOString();
};

interface PendingRecordInfo {
  id: number;
  initialRecord: BackendDocumentRecord;
}

interface OcrRequest {
  file: File;
  docType: DocumentType;
  record: BackendDocumentRecord;
}

function Documents() {
  const [activeTab, setActiveTab] = useState<DocumentType>('Passport');
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [state, dispatch] = useReducer(formReducer, formInitialState);
  const [pendingFormRecords, setPendingFormRecords] = useState<Partial<Record<DocumentType, PendingRecordInfo>>>({});
  const [ocrRequest, setOcrRequest] = useState<OcrRequest | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string | null>(null);
  const [showFileValidation, setShowFileValidation] = useState(false);
  const ocrCompletionHandled = useRef(false);


  const userString = localStorage.getItem('user');
  let role = '';
  let userId: number | undefined = undefined;
  let currentUser: any = null;
 
  if (userString) {
    const user = JSON.parse(userString);
    role = user.role;
    userId = parseInt(user.userId, 10);
    currentUser = user;
  }

  console.log(userId);
  

  // NOTE: The useEffect hook that cleared state on tab switch has been removed
  // to allow state to persist across tabs.

  const handleRecordCreated = (record: BackendDocumentRecord, uploadedFile: File) => {
    // When a new file is uploaded for a tab, clear any previous OCR/pending state
    // for THAT tab to start the new flow fresh.
    setPendingFormRecords(prev => ({ ...prev, [activeTab]: undefined }));
    setRawOcrText(null);
    
    // Set up the new OCR request
    ocrCompletionHandled.current = false;
    setOcrRequest({ file: uploadedFile, docType: activeTab, record });
    
    // Clear the file from the uploader's view since it's now being processed
    setSelectedFileForUpload(null); 
    setShowFileValidation(false);
  };

  const handleOcrComplete = (rawText: string) => {
    if (ocrCompletionHandled.current) {
        console.log("OCR completion callback fired a second time (ignored).");
        return;
    }
    ocrCompletionHandled.current = true;
    toast.success('Scan complete. Displaying parsed data...');
    setRawOcrText(rawText);
  };

  const handleDataParsed = (parsedData: ParsedInfo) => {
    if (!ocrRequest) return;
    const { docType, record } = ocrRequest;

    // Reset the form for the current docType and then populate it with parsed data
    dispatch({ type: 'RESET_FORM', docType });
    Object.entries(parsedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dispatch({ type: 'UPDATE_FIELD', docType, field: key as keyof FormState, value });
      }
    });

    // Set the pending record for the form to use
    setPendingFormRecords(prev => ({
      ...prev,
      [docType]: { id: record.id, initialRecord: record }
    }));
    setOcrRequest(null); // End the OCR request process
  };

  const handleSaveDetails = async (currentFormState: FormState, recordId: number, docType: DocumentType) => {
    const pendingRecord = pendingFormRecords[docType];
    if (!pendingRecord) {
        toast.error("Error: Could not find pending record information.");
        return;
    }

    let isExpired = false;
    let expiryDate: Date | string | null | undefined = null;

    if (docType === 'Passport' || docType === 'Visa') {
      expiryDate = currentFormState.expiryDate;
    }

    if (expiryDate) {
      const dateObj = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        isExpired = true;
      }
    }

    const toastId = toast.loading(isExpired ? `Checking the expiry...` : `Saving ${docType} details...`);

    try {
      if (isExpired) {
        await axios.delete(`http://localhost:5030/api/Documents/${recordId}/type/${docType}`);
        toast.error(`This document is expired and cannot be saved.`, { id: toastId });
      } else {
        const payloadForApi = { ...pendingRecord.initialRecord };
        if (docType === 'Passport') {
            payloadForApi.passportNumber = currentFormState.passportNumber;
            payloadForApi.issuingCountry = currentFormState.issuingCountry;
            payloadForApi.passportIssueDate = currentFormState.issueDate;
            payloadForApi.passportExpiryDate = currentFormState.expiryDate;
        } else if (docType === 'Visa') {
            payloadForApi.visaNumber = currentFormState.visaNumber;
            payloadForApi.visaClass = currentFormState.visaClass;
            payloadForApi.issuingCountry = currentFormState.issuingCountry;
            payloadForApi.visaIssueDate = currentFormState.issueDate;
            payloadForApi.visaExpiryDate = currentFormState.expiryDate;
        } else if (docType === 'Aadhar') {
            payloadForApi.aadharNumber = currentFormState.idNumber;
            payloadForApi.aadharName = currentFormState.fullName;
        }

        const finalPayload = {
            ...payloadForApi,
            uploadDate: formatToISOString(payloadForApi.uploadDate),
            passportIssueDate: formatToISOString(payloadForApi.passportIssueDate),
            passportExpiryDate: formatToISOString(payloadForApi.passportExpiryDate),
            visaIssueDate: formatToISOString(payloadForApi.visaIssueDate),
            visaExpiryDate: formatToISOString(payloadForApi.visaExpiryDate),
        };

        await axios.put(`http://localhost:5030/api/Documents/${recordId}`, finalPayload);
        toast.success(`${docType} details saved successfully!`, { id: toastId });
      }

      // After a successful save or delete, clear the state for that document type
      dispatch({ type: 'RESET_FORM', docType });
      setPendingFormRecords(prev => {
          const newState = { ...prev };
          delete newState[docType];
          return newState;
      });
      setRawOcrText(null);

    } catch (error) {
        const action = isExpired ? 'delete' : 'update';
        console.error(`Failed to ${action} ${docType} details:`, error);
        toast.error(`Failed to ${action} document.`, { id: toastId });
        throw error;
    }
  };

  const handleOcrCancel = useCallback(() => {
      setOcrRequest(null);
      ocrCompletionHandled.current = false;
  }, []);

  const currentPendingRecord = pendingFormRecords[activeTab];

  return (
    <div className="animate-fadeIn">
      <Toaster position="top-right" reverseOrder={false} />

      {ocrRequest && !rawOcrText && (
        <OcrProcessor
          fileToProcess={ocrRequest.file}
          onComplete={handleOcrComplete}
          onCancel={handleOcrCancel}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Travel Documents</h2>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
        <DocumentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Upload Document</h3>
            <FileUploader
              userId={userId}
              docType={activeTab}
              onFileSelect={(file) => {
                setSelectedFileForUpload(file);
                if (file) setShowFileValidation(false);
              }}
              showValidation={showFileValidation}
              selectedFile={selectedFileForUpload}
              onRecordCreated={handleRecordCreated}
              onUploadError={(error) => toast.error(`Upload Error: ${error}`)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Verify & Save Information</h3>

            {rawOcrText && (
              <>
                {activeTab === 'Passport' && <PassportParser rawText={rawOcrText} onDataParsed={handleDataParsed} />}
                {activeTab === 'Visa' && <VisaParser rawText={rawOcrText} onDataParsed={handleDataParsed} />}
                {activeTab === 'Aadhar' && <AadharParser rawText={rawOcrText} onDataParsed={handleDataParsed} />}
              </>
            )}

            {!currentPendingRecord && !rawOcrText ? (
                <p className="text-sm text-gray-500 my-4">
                  Upload a document for the '{activeTab}' tab. The form will be auto-filled after a successful upload and scan.
                </p>
            ) : null }
            {currentPendingRecord ? (
                 <p className="text-sm text-blue-600 mb-2">
                    Please verify the auto-filled details for record ID #{currentPendingRecord.id} and click save.
                 </p>
            ) : null }

            <DocumentForm
              docType={activeTab}
              formState={state[activeTab]}
              dispatch={dispatch}
              recordId={currentPendingRecord ? currentPendingRecord.id : null}
              onSave={handleSaveDetails}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Documents</h3>
          <DocumentList 
            docType={activeTab} 
            userId={userId}
            key={`${activeTab}-${Object.keys(pendingFormRecords).length}`} 
          />
        </div>
      </div>
    </div>
  );
}

export default Documents;