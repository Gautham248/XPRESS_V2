import { format } from 'date-fns';

export interface VisaDocument {
  id: string;
  userId: string;
  visaNumber: string;
  visaClass: string;
  issuingCountry: string;
  issuingPost: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
}

export interface PassportDocument {
  id: string;
  userId: string;
  passportNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
}

export interface IdentificationDocument {
  id: string;
  userId: string;
  type: 'National ID' | 'Drivers License' | 'Social Security';
  idNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
}

export interface UserDocuments {
  userId: string;
  userName: string;
  visaDocuments: VisaDocument[];
  passportDocuments: PassportDocument[];
  identificationDocuments: IdentificationDocument[];
}

export const mockUserDocuments: UserDocuments[] = [
  {
    userId: 'USER001',
    userName: 'John Smith',
    visaDocuments: [
      {
        id: 'VISA001',
        userId: 'USER001',
        visaNumber: 'V1234567',
        visaClass: 'B1/B2',
        issuingCountry: 'United States',
        issuingPost: 'London',
        issueDate: '2023-01-15',
        expiryDate: '2033-01-14',
        documentUrl: 'https://example.com/documents/visa001.pdf'
      }
    ],
    passportDocuments: [
      {
        id: 'PASS001',
        userId: 'USER001',
        passportNumber: 'P1234567',
        issuingCountry: 'United Kingdom',
        issueDate: '2020-05-20',
        expiryDate: '2030-05-19',
        documentUrl: 'https://example.com/documents/passport001.pdf'
      }
    ],
    identificationDocuments: [
      {
        id: 'ID001',
        userId: 'USER001',
        type: 'National ID',
        idNumber: 'ID12345678',
        issuingCountry: 'United Kingdom',
        issueDate: '2019-03-10',
        expiryDate: '2029-03-09',
        documentUrl: 'https://example.com/documents/id001.pdf'
      }
    ]
  },
  {
    userId: 'USER002',
    userName: 'Emily Johnson',
    visaDocuments: [
      {
        id: 'VISA002',
        userId: 'USER002',
        visaNumber: 'V7654321',
        visaClass: 'H1B',
        issuingCountry: 'United States',
        issuingPost: 'Sydney',
        issueDate: '2022-11-30',
        expiryDate: '2025-11-29',
        documentUrl: 'https://example.com/documents/visa002.pdf'
      }
    ],
    passportDocuments: [
      {
        id: 'PASS002',
        userId: 'USER002',
        passportNumber: 'P7654321',
        issuingCountry: 'Australia',
        issueDate: '2018-08-15',
        expiryDate: '2028-08-14',
        documentUrl: 'https://example.com/documents/passport002.pdf'
      }
    ],
    identificationDocuments: [
      {
        id: 'ID002',
        userId: 'USER002',
        type: 'Drivers License',
        idNumber: 'DL98765432',
        issuingCountry: 'Australia',
        issueDate: '2021-07-25',
        expiryDate: '2026-07-24',
        documentUrl: 'https://example.com/documents/id002.pdf'
      }
    ]
  }
];