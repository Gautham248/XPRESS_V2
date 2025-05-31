export type DocumentType = 'passport' | 'visa' | 'aadhar';

export type FormState = Record<string, string | Date | null>;

export type DocumentState = Record<DocumentType, FormState>;

export interface FormField {
  key: string;
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
  passport: passportFormConfig,
  visa: visaFormConfig,
  aadhar: aadharFormConfig,
};

export interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: string;
  value?: string | Date | null;
}
