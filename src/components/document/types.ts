export type DocumentType = 'passport' | 'visa' | 'identification';

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
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

const visaFormConfig: FormField[] = [
  { key: 'visaNumber', label: 'Visa Number', type: 'text', required: true },
  { key: 'visaClass', label: 'Visa Class', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issuingPost', label: 'Issuing Post', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

const identificationFormConfig: FormField[] = [
  {
    key: 'type',
    label: 'ID Type',
    type: 'select',
    options: ['Aadhar', "Driver's License", 'Voter ID', 'PAN Card'],
    required: true,
  },
  { key: 'idNumber', label: 'ID Number', type: 'text', required: true },
  { key: 'issuingCountry', label: 'Issuing Country', type: 'text', required: true },
  { key: 'issueDate', label: 'Issue Date', type: 'date', maxDate: new Date(), required: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', minDate: new Date(), required: true },
];

export const formConfigMap: Record<DocumentType, FormField[]> = {
  passport: passportFormConfig,
  visa: visaFormConfig,
  identification: identificationFormConfig,
};

export interface Action {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  docType: DocumentType;
  field?: string;
  value?: string | Date | null;
}
