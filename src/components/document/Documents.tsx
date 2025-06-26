// src/components/Documents.tsx

import React, { useState, useReducer, useRef, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { DocumentType, DocumentState, FormState, Action, initialState as formInitialState } from './types';

import DocumentTabs from './DocumentTabs';
import DocumentForm from './DocumentForm';
import DocumentList from './DocumentList';
import FileUploader from './FileUploader';
import OcrProcessor from './OCRProcessor';
import PassportParser, { ParsedPassportInfo } from './Parsers/PassportParser';
import AadharParser, { ParsedAadhaarInfo } from './Parsers/AadharParser';
import VisaParser, { ParsedVisaInfo } from './Parsers/VisaParser';

type ParsedInfo = ParsedPassportInfo | ParsedAadhaarInfo | ParsedVisaInfo;

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

interface OcrRequest {
  file: File;
  docType: DocumentType;
}

function Documents() {
  const [activeTab, setActiveTab] = useState<DocumentType>('Passport');
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<DocumentType, File | null>>>({});
  const [state, dispatch] = useReducer(formReducer, formInitialState);
  const [ocrRequest, setOcrRequest] = useState<OcrRequest | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const ocrCompletionHandled = useRef(false);

  const userString = localStorage.getItem('user');
  let userId: number | undefined = undefined;
  if (userString) {
    const user = JSON.parse(userString);
    userId = parseInt(user.userId, 10);
  }

  const handleFileSelect = (file: File | null) => {
    setRawOcrText(null);
    setOcrRequest(null);
    setSaveError(null);
    dispatch({ type: 'RESET_FORM', docType: activeTab });

    setSelectedFiles(prev => ({ ...prev, [activeTab]: file }));

    if (file) {
      ocrCompletionHandled.current = false;
      setOcrRequest({ file, docType: activeTab });
    }
  };

  const handleOcrComplete = (rawText: string) => {
    if (ocrCompletionHandled.current) return;
    ocrCompletionHandled.current = true;
    toast.success('Scan complete. Please verify the auto-filled data.');
    setRawOcrText(rawText);
  };

  const handleDataParsed = (parsedData: ParsedInfo) => {
    if (!ocrRequest) return;
    const { docType } = ocrRequest;

    dispatch({ type: 'RESET_FORM', docType });
    Object.entries(parsedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dispatch({ type: 'UPDATE_FIELD', docType, field: key as keyof FormState, value });
      }
    });

    setOcrRequest(null); 
  };

  const handleFinalSubmit = async (currentFormState: FormState, docType: DocumentType) => {
    const fileToUpload = selectedFiles[docType];

    if (!fileToUpload) {
      toast.error("No file selected. Please choose a file first.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const toastId = toast.loading(`Saving ${docType}...`);

    try {
      // Step 1: Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "firstUpload"); // Your Cloudinary upload preset

      toast.loading(`Uploading file...`, { id: toastId });
      const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dugfqlrog/auto/upload", {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await cloudinaryResponse.json();
      if (!cloudinaryData.secure_url) {
        throw new Error(cloudinaryData.error?.message || "File upload to cloud failed.");
      }
      const documentUrl = cloudinaryData.secure_url;
      toast.loading(`File uploaded, saving details...`, { id: toastId });

      // Step 2: Prepare the complete payload for your backend
      const payloadForApi: any = {
        idType: docType.charAt(0).toUpperCase() + docType.slice(1),
        userId: userId,
        documentPath: documentUrl,
        uploadDate: new Date().toISOString(),
        createdBy: userId,
      };

      if (docType === 'Passport') {
        payloadForApi.passportNumber = currentFormState.passportNumber;
        payloadForApi.issuingCountry = currentFormState.issuingCountry;
        payloadForApi.passportIssueDate = formatToISOString(currentFormState.issueDate);
        payloadForApi.passportExpiryDate = formatToISOString(currentFormState.expiryDate);
      } else if (docType === 'Visa') {
        payloadForApi.visaNumber = currentFormState.visaNumber;
        payloadForApi.visaClass = currentFormState.visaClass;
        payloadForApi.issuingCountry = currentFormState.issuingCountry;
        payloadForApi.visaIssueDate = formatToISOString(currentFormState.issueDate);
        payloadForApi.visaExpiryDate = formatToISOString(currentFormState.expiryDate);
      } else if (docType === 'Aadhar') {
        payloadForApi.aadharNumber = currentFormState.idNumber;
        payloadForApi.aadharName = currentFormState.fullName;
      }
      
      // Step 3: Send the single POST request to your backend
      await axios.post('http://localhost:5030/api/Documents', payloadForApi);
      toast.success(`${docType} saved successfully!`, { id: toastId });

      // Step 4: Reset the UI state for the current tab
      dispatch({ type: 'RESET_FORM', docType });
      setSelectedFiles(prev => ({ ...prev, [docType]: null }));
      setRawOcrText(null);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || `Failed to save ${docType}. Please try again.`;
      console.error(`Failed to save ${docType} details:`, error);
      setSaveError(errorMessage);
      toast.error(errorMessage, { id: toastId });
      // We don't re-throw, as we're handling the error state here
    } finally {
      setIsSaving(false);
    }
  };

  const handleOcrCancel = useCallback(() => {
    setOcrRequest(null);
    ocrCompletionHandled.current = false;
  }, []);
  
  // The form is ready to be submitted only after a file is selected and OCR has run.
  const isReadyToSubmit = !!selectedFiles[activeTab] && !!rawOcrText;

  return (
    <div className="animate-fadeIn">
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{ top: 80 }}
      />

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
              docType={activeTab}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFiles[activeTab] || null}
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

            {!selectedFiles[activeTab] ? (
              <p className="text-sm text-gray-500 my-4">Please select or drop a document file above to begin.</p>
            ) : !rawOcrText && ocrRequest ? (
              <p className="text-sm text-blue-600 my-4">Scanning your document... the form will be enabled once the scan is complete.</p>
            ) : rawOcrText ? (
              <p className="text-sm text-blue-600 mb-2">Please verify the auto-filled details and click 'Save' below.</p>
            ) : null}

            {saveError && ( <div className="text-red-600 text-sm my-2">{saveError}</div> )}

            <DocumentForm
              docType={activeTab}
              formState={state[activeTab]}
              dispatch={dispatch}
              onSave={handleFinalSubmit}
              isSaving={isSaving}
              isReadyToSubmit={isReadyToSubmit}
              toast={toast}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Documents</h3>
          <DocumentList
            docType={activeTab}
            userId={userId}
            key={`${activeTab}-${isSaving}`} // Re-render list after a successful save
          />
        </div>
      </div>
    </div>
  );
}

export default Documents;