export type DocumentType = 'Passport' | 'Visa' | 'Aadhar';

export interface FormState {
  // Passport Fields
  passportNumber: string | null;
  issuingCountry: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  
  // Visa Fields
  visaNumber: string | null;
  visaClass: string | null;
  
  // Aadhar Fields
  idNumber: string | null;
  fullName: string | null;
}

export type DocumentState = Record<DocumentType, FormState>;

export interface FormField {
  key: keyof FormState; 
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  maxDate?: Date;     
  minDate?: Date;
  validationRegex?: RegExp;
  validationMessage?: string;
}

const passportRegex = /^([A-Z]{1,2}\d{6,8}|\d{9}|[A-Z]\d{7}[A-Z]?)$/;
const aadharRegex = /^\d{12}$/;
const visaClassRegex = /^[A-Z]{1,3}\d{1,2}[A-Z]?$/;
const visaNumberRegex = /^([A-Z]{1}\d{6,10}|\d{8,9})$/;

const passportFormConfig: FormField[] = [
  { 
    key: 'passportNumber', 
    label: 'Passport Number', 
    type: 'text', 
    required: true,
    validationRegex: passportRegex,
    validationMessage: "Invalid passport number format."
  },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const visaFormConfig: FormField[] = [
  { 
    key: 'visaNumber', 
    label: 'Visa Number', 
    type: 'text', 
    required: false, 
    validationRegex: visaNumberRegex,
    validationMessage: "Invalid visa number format."
  },
  { 
    key: 'visaClass', 
    label: 'Visa Class/Type', 
    type: 'text', 
    required: true,
    validationRegex: visaClassRegex,
    validationMessage: "Invalid visa class/type format."
  },
  { key: 'issuingCountry', label: 'Issuing Country / Post', type: 'text', required: true }, 
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const aadharFormConfig: FormField[] = [
  { 
    key: 'idNumber', 
    label: 'Aadhar Number', 
    type: 'text', 
    required: true,
    validationRegex: aadharRegex,
    validationMessage: "Aadhar number must be 12 digits."
  }, 
  { key: 'fullName', label: 'Full Name (as per Aadhar)', type: 'text', required: true } 
];

export const formConfigMap: Record<DocumentType, FormField[]> = {
  Passport: passportFormConfig,
  Visa: visaFormConfig,
  Aadhar: aadharFormConfig,
};

export const initialState: DocumentState = {
  Passport: {
    passportNumber: '',
    issuingCountry: '',
    issueDate: null,
    expiryDate: null,
    visaNumber: null, 
    visaClass: null, 
    idNumber: null, 
    fullName: null,
  },
  Visa: {
    visaNumber: '',
    visaClass: '',
    issuingCountry: '', 
    issueDate: null,
    expiryDate: null,
    passportNumber: null, 
    idNumber: null, 
    fullName: null,
  },
  Aadhar: {
    idNumber: '',     
    fullName: '',
    passportNumber: null, 
    issuingCountry: null, 
    issueDate: null, 
    expiryDate: null, 
    visaNumber: null, 
    visaClass: null,
  },
};

export interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: keyof FormState;
  value?: string | Date | null;
}