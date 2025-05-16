import React, { useState, useReducer } from 'react';
import { format, isBefore, addMonths } from 'date-fns';
import DatePicker from 'react-datepicker';
import { FileText, Upload, Trash2, AlertCircle, Download, Calendar, Globe } from 'lucide-react';
import { mockUserDocuments } from '../../data/documentData';
import 'react-datepicker/dist/react-datepicker.css';

type DocumentType = 'passport' | 'visa' | 'identification';

interface PassportFormState {
  passportNumber: string;
  issuingCountry: string;
  issueDate: Date | null;
  expiryDate: Date | null;
}

interface VisaFormState {
  visaNumber: string;
  visaClass: string;
  issuingCountry: string;
  issuingPost: string;
  issueDate: Date | null;
  expiryDate: Date | null;
}

interface IdentificationFormState {
  type: 'National ID' | "Driver's License" | 'Social Security';
  idNumber: string;
  issuingCountry: string;
  issueDate: Date | null;
  expiryDate: Date | null;
}

interface DocumentState {
  passport: PassportFormState;
  visa: VisaFormState;
  identification: IdentificationFormState;
}

type PassportFormKeys = keyof PassportFormState;
type VisaFormKeys = keyof VisaFormState;
type IdentificationFormKeys = keyof IdentificationFormState;

interface PassportFormField {
  key: PassportFormKeys;
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  maxDate?: Date;
  minDate?: Date;
}

interface VisaFormField {
  key: VisaFormKeys;
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  maxDate?: Date;
  minDate?: Date;
}

interface IdentificationFormField {
  key: IdentificationFormKeys;
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  maxDate?: Date;
  minDate?: Date;
}

const passportFormConfig: PassportFormField[] = [
  { key: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

const visaFormConfig: VisaFormField[] = [
  { key: 'visaNumber', label: 'Visa Number', type: 'text', required: true },
  { key: 'visaClass', label: 'Visa Class', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issuingPost', label: 'Issuing Post', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

const identificationFormConfig: IdentificationFormField[] = [
  { key: 'type', label: 'ID Type', type: 'select', options: ['National ID', "Driver's License", 'Social Security'], required: true,},
  { key: 'idNumber', label: 'ID Number', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

const formConfigMap: Record<DocumentType, any> = {
  passport: passportFormConfig,
  visa: visaFormConfig,
  identification: identificationFormConfig,
};

interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: string;
  value?: string | Date | null;
}

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

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setError('File size exceeds 10MB. Please upload a smaller file.');
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setError(null);
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        id="document"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <label htmlFor="document" className="cursor-pointer flex flex-col items-center">
        <Upload className="h-8 w-8 text-gray-500 mb-2" />
        <span className="text-sm font-medium text-gray-700">
          {selectedFile ? selectedFile.name : 'Click to upload'}
        </span>
        <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max. 10MB)</span>
      </label>
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface DocumentTabsProps {
  activeTab: DocumentType;
  setActiveTab: (tab: DocumentType) => void;
}

function DocumentTabs({ activeTab, setActiveTab }: DocumentTabsProps) {
  const tabs: { id: DocumentType; label: string }[] = [
    { id: 'passport', label: 'Passport' },
    { id: 'visa', label: 'Visa' },
    { id: 'identification', label: 'Identification' },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DocumentFormProps {
  docType: DocumentType;
  formState: DocumentState[DocumentType];
  dispatch: React.Dispatch<Action>;
}

function DocumentForm({ docType, formState, dispatch }: DocumentFormProps) {
  const fields = formConfigMap[docType] as (PassportFormField | VisaFormField | IdentificationFormField)[];

  const handleChange = (field: string, value: string | Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', docType, field, value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          const fieldKey = field.key as keyof typeof formState;
          const fieldValue = formState[fieldKey];

          return (
            <div key={field.key} className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'select' && 'options' in field && field.options ? (
                <select
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <DatePicker
                  selected={fieldValue instanceof Date || fieldValue === null ? fieldValue : null}
                  onChange={(date) => handleChange(field.key, date)}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  maxDate={field.maxDate}
                  minDate={field.minDate}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DocumentListProps {
  docType: DocumentType;
}

interface PassportDocument {
  id: number;
  passportNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

interface VisaDocument {
  id: number;
  visaNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

interface IdentificationDocument {
  id: number;
  idNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

type Document = PassportDocument | VisaDocument | IdentificationDocument;

interface UserDocuments {
  passportDocuments: PassportDocument[];
  visaDocuments: VisaDocument[];
  identificationDocuments: IdentificationDocument[];
}

const isUserDocumentsArray = (data: unknown): data is UserDocuments[] => {
  if (!Array.isArray(data)) return false;

  return data.every((item) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      Array.isArray(item.passportDocuments) &&
      Array.isArray(item.visaDocuments) &&
      Array.isArray(item.identificationDocuments)
    );
  });
};

const typedMockUserDocuments: UserDocuments[] = isUserDocumentsArray(mockUserDocuments)
  ? mockUserDocuments
  : [];

function DocumentList({ docType }: DocumentListProps) {
  const currentUser = typedMockUserDocuments.length > 0 ? typedMockUserDocuments[0] : null;
  let documents: Document[] = [];

  if (currentUser) {
    switch (docType) {
      case 'passport':
        documents = currentUser.passportDocuments;
        break;
      case 'visa':
        documents = currentUser.visaDocuments;
        break;
      case 'identification':
        documents = currentUser.identificationDocuments;
        break;
    }
  }

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Documents</h4>
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents available.</p>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const isExpiringSoon = isBefore(new Date(doc.expiryDate), addMonths(new Date(), 3));
            const isExpired = isBefore(new Date(doc.expiryDate), new Date());

            return (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium text-gray-800">
                        {('passportNumber' in doc && doc.passportNumber) ||
                          ('visaNumber' in doc && doc.visaNumber) ||
                          ('idNumber' in doc && doc.idNumber) ||
                          ''}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{doc.issuingCountry}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Valid until {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}</span>
                    </div>
                    {isExpiringSoon && !isExpired && (
                      <div className="flex items-center text-sm text-yellow-600 mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Expiring soon</span>
                      </div>
                    )}
                    {isExpired && (
                      <div className="flex items-center text-sm text-red-600 mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Expired</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Documents() {
  const [activeTab, setActiveTab] = useState<DocumentType>('passport');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Uploading document:', selectedFile, 'Form data:', state[activeTab]);
    dispatch({ type: 'RESET_FORM', docType: activeTab });
    setSelectedFile(null);
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
              <FileUploader onFileSelect={setSelectedFile} />
            </div>
            <DocumentForm docType={activeTab} formState={state[activeTab]} dispatch={dispatch} />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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