import React, { useState, useReducer } from 'react';
import DocumentTabs from './DocumentTabs';
import DocumentForm from './DocumentForm';
import DocumentList from './DocumentList';
import FileUploader from './FileUploader';
import { DocumentType, DocumentState, FormState, Action } from './types';

const initialState: DocumentState = {
  passport: {
    passportNumber: '',
    issuingCountry: '',
    issueDate: null,
    expiryDate: null,
  },
  visa: {
    visaNumber: '',
    visaClass: '',
    issuingCountry: '',
    issuingPost: '',
    issueDate: null,
    expiryDate: null,
  },
  identification: {
    type: 'National ID',
    idNumber: '',
    issuingCountry: '',
    issueDate: null,
    expiryDate: null,
  },
};

const formReducer = (state: DocumentState, action: Action): DocumentState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.docType]: {
          ...state[action.docType],
          [action.field!]: action.value,
        },
      };
    case 'RESET_FORM':
      return {
        ...state,
        [action.docType]: initialState[action.docType],
      };
    default:
      return state;
  }
};

function Documents() {
  const [activeTab, setActiveTab] = useState<DocumentType>('passport');
  const [selectedFile, setSelectedFile] = useState<File | null | undefined>(null);
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [showValidation, setShowValidation] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true); // Trigger validation

    if (!selectedFile) {
      return; // Prevent submission if no file is selected
    }

    console.log('Uploading document:', selectedFile, 'Form data:', state[activeTab]);
    dispatch({ type: 'RESET_FORM', docType: activeTab });
    setSelectedFile(null);
    setShowValidation(false); // Reset validation after submission
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-[fadeIn_0.5s_ease-in]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Travel Documents</h2>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <DocumentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <form onSubmit={handleUpload}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h3>
              <FileUploader onFileSelect={setSelectedFile} showValidation={showValidation} />
            </div>
            <DocumentForm docType={activeTab} formState={state[activeTab]} dispatch={dispatch} />
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  selectedFile
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!selectedFile}
              >
                Upload Document
              </button>
            </div>
          </div>
        </form>
        <DocumentList docType={activeTab} />
      </div>
    </div>
  );
}

export default Documents;