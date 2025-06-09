// src/components/types.ts

// The types of documents the application supports.
export type DocumentType = 'Passport' | 'Visa' | 'Aadhar';

// This is the "master" data structure for the form's state.
// All possible fields from all forms are defined here.
// We use `Date | null` for date fields for type safety and compatibility with react-datepicker.
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

// The complete application state, holding a FormState for each document type.
export type DocumentState = Record<DocumentType, FormState>;

// This interface defines the configuration for a single form field, driving the form builder.
export interface FormField {
  key: keyof FormState; // Use `keyof` for strong type-checking against FormState.
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[]; // For 'select' type
  maxDate?: Date;     // For 'date' type
  minDate?: Date;     // For 'date' type
}

// --- Form Field Configurations ---

const passportFormConfig: FormField[] = [
  { key: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const visaFormConfig: FormField[] = [
  { key: 'visaNumber', label: 'Visa Number', type: 'text', required: false },
  { key: 'visaClass', label: 'Visa Class/Type', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country / Post', type: 'text', required: true }, 
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true }
];

const aadharFormConfig: FormField[] = [
  { key: 'idNumber', label: 'Aadhar Number', type: 'text', required: true }, 
  { key: 'fullName', label: 'Full Name (as per Aadhar)', type: 'text', required: true } 
];

// A map to easily access the correct form configuration based on the document type.
export const formConfigMap: Record<DocumentType, FormField[]> = {
  Passport: passportFormConfig,
  Visa: visaFormConfig,
  Aadhar: aadharFormConfig,
};

// The initial state for the form reducer.
// Each object must be a complete FormState, with unused fields set to null.
export const initialState: DocumentState = {
  Passport: {
    passportNumber: '',
    issuingCountry: '',
    issueDate: null,
    expiryDate: null,
    // Add other unused keys as null
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
    // Add other unused keys as null
    passportNumber: null, 
    idNumber: null, 
    fullName: null,
  },
  Aadhar: {
    idNumber: '',     
    fullName: '',
    // Add other unused keys as null
    passportNumber: null, 
    issuingCountry: null, 
    issueDate: null, 
    expiryDate: null, 
    visaNumber: null, 
    visaClass: null,
  },
};

// The action type for the reducer, using `keyof` for type safety.
export interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: keyof FormState;
  value?: string | Date | null;
}