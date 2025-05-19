// import React from 'react';
import { format, isBefore, addMonths } from 'date-fns';
import { FileText, AlertCircle, Download, Trash2, Calendar, Globe } from 'lucide-react';
import { mockUserDocuments } from '../../data/documentData';
import { DocumentType } from './types';

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

export default DocumentList;