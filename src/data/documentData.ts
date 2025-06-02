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

export interface AadharDocument {
  id: string;
  userId: string;
  fullName: string;
  aadharNumber: string;
  documentUrl: string;
}

export interface UserDocuments {
  userId: string;
  userName: string;
  visaDocuments: VisaDocument[];
  passportDocuments: PassportDocument[];
  aadharDocuments: AadharDocument[];
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
        issueDate: '15-01-2023',
        expiryDate: '14-01-2033',
        documentUrl: 'https://example.com/documents/visa001.pdf'
      }
    ],
    passportDocuments: [
      {
        id: 'PASS001',
        userId: 'USER001',
        passportNumber: 'P1234567',
        issuingCountry: 'United Kingdom',
        issueDate: '20-05-2020',
        expiryDate: '19-05-2030',
        documentUrl: 'https://example.com/documents/passport001.pdf'
      }
    ],
    aadharDocuments: [
      {
        id: 'AADHAR001',
        userId: 'USER001',
        fullName: 'John Smith',
        aadharNumber: '1234-5678-9012',
        documentUrl: 'https://example.com/documents/aadhar001.pdf'
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
        issueDate: '30-11-2022',
        expiryDate: '29-11-2025',
        documentUrl: 'https://example.com/documents/visa002.pdf'
      }
    ],
    passportDocuments: [
      {
        id: 'PASS002',
        userId: 'USER002',
        passportNumber: 'P7654321',
        issuingCountry: 'Australia',
        issueDate: '15-08-2018',
        expiryDate: '14-08-2028',
        documentUrl: 'https://example.com/documents/passport002.pdf'
      }
    ],
    aadharDocuments: [
      {
        id: 'AADHAR002',
        userId: 'USER002',
        fullName: 'Emily Johnson',
        aadharNumber: '9876-5432-1098',
        documentUrl: 'https://example.com/documents/aadhar002.pdf'
      }
    ]
  }
];
