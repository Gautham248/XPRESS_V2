// types.ts
// (Your existing types.ts code is fine based on the description)
export type DocumentType = 'Passport' | 'Visa' | 'Aadhar';

export type FormState = Record<string, string | Date | null>; // Keys match FormField 'key'

export type DocumentState = Record<DocumentType, FormState>;

export interface FormField {
  key: string; // This 'key' is what FormState and initialState will use
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  maxDate?: Date;
  minDate?: Date;
}

const passportFormConfig: FormField[] = [
  { key: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const visaFormConfig: FormField[] = [
  { key: 'visaNumber', label: 'Visa Number', type: 'text', required: false },
  { key: 'visaClass', label: 'Visa Class', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true }, 
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const aadharFormConfig: FormField[] = [
  { key: 'idNumber', label: 'Aadhar Number', type: 'text', required: true }, 
  { key: 'fullName', label: 'Full Name as per Aadhar', type: 'text', required: true } 
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
  },
  Visa: {
    visaNumber: '',
    visaClass: '',
    issuingCountry: '', 
    issueDate: null,
    expiryDate: null,
  },
  Aadhar: {
    idNumber: '',     
    fullName: ''      
  },
};

export interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: string; 
  value?: string | Date | null;
}