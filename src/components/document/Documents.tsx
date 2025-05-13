import React, { useState } from 'react';
import { format, isAfter, isBefore, addMonths } from 'date-fns';
import DatePicker from 'react-datepicker';
import { 
  FileText, 
  Upload, 
  Trash2, 
  AlertCircle,
  Download,
  Calendar,
  Globe,
  User,
  Flag
} from 'lucide-react';
import { mockUserDocuments } from '../../data/documentData';

type TabType = 'passport' | 'visa' | 'identification';

const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('passport');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states for each document type
  const [passportForm, setPassportForm] = useState({
    passportNumber: '',
    issuingCountry: '',
    issueDate: null as Date | null,
    expiryDate: null as Date | null
  });
  
  const [visaForm, setVisaForm] = useState({
    visaNumber: '',
    visaClass: '',
    issuingCountry: '',
    issuingPost: '',
    issueDate: null as Date | null,
    expiryDate: null as Date | null
  });
  
  const [idForm, setIdForm] = useState({
    type: 'National ID' as 'National ID' | 'Drivers License' | 'Social Security',
    idNumber: '',
    issuingCountry: '',
    issueDate: null as Date | null,
    expiryDate: null as Date | null
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle document upload logic here
    console.log('Uploading document:', selectedFile);
    
    switch (activeTab) {
      case 'passport':
        console.log('Passport details:', passportForm);
        break;
      case 'visa':
        console.log('Visa details:', visaForm);
        break;
      case 'identification':
        console.log('ID details:', idForm);
        break;
    }
  };

  const renderPassportForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            Passport Number
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={passportForm.passportNumber}
              onChange={(e) => setPassportForm({ ...passportForm, passportNumber: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issuing Country
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={passportForm.issuingCountry}
              onChange={(e) => setPassportForm({ ...passportForm, issuingCountry: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issue Date
            <DatePicker
              selected={passportForm.issueDate}
              onChange={(date) => setPassportForm({ ...passportForm, issueDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              maxDate={new Date()}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Expiry Date
            <DatePicker
              selected={passportForm.expiryDate}
              onChange={(date) => setPassportForm({ ...passportForm, expiryDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              minDate={new Date()}
              required
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderVisaForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            Visa Number
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={visaForm.visaNumber}
              onChange={(e) => setVisaForm({ ...visaForm, visaNumber: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Visa Class
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={visaForm.visaClass}
              onChange={(e) => setVisaForm({ ...visaForm, visaClass: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issuing Country
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={visaForm.issuingCountry}
              onChange={(e) => setVisaForm({ ...visaForm, issuingCountry: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issuing Post
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={visaForm.issuingPost}
              onChange={(e) => setVisaForm({ ...visaForm, issuingPost: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issue Date
            <DatePicker
              selected={visaForm.issueDate}
              onChange={(date) => setVisaForm({ ...visaForm, issueDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              maxDate={new Date()}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Expiry Date
            <DatePicker
              selected={visaForm.expiryDate}
              onChange={(date) => setVisaForm({ ...visaForm, expiryDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              minDate={new Date()}
              required
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderIdForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            ID Type
            <select
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={idForm.type}
              onChange={(e) => setIdForm({ ...idForm, type: e.target.value as typeof idForm.type })}
              required
            >
              <option value="National ID">National ID</option>
              <option value="Drivers License">Driver's License</option>
              <option value="Social Security">Social Security</option>
            </select>
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            ID Number
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={idForm.idNumber}
              onChange={(e) => setIdForm({ ...idForm, idNumber: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issuing Country
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={idForm.issuingCountry}
              onChange={(e) => setIdForm({ ...idForm, issuingCountry: e.target.value })}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Issue Date
            <DatePicker
              selected={idForm.issueDate}
              onChange={(date) => setIdForm({ ...idForm, issueDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              maxDate={new Date()}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Expiry Date
            <DatePicker
              selected={idForm.expiryDate}
              onChange={(date) => setIdForm({ ...idForm, expiryDate: date })}
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              minDate={new Date()}
              required
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderExistingDocuments = () => {
    const currentUser = mockUserDocuments[0]; // Using first user as example
    let documents;
    
    switch (activeTab) {
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

    return (
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Existing Documents</h4>
        <div className="space-y-4">
          {documents.map((doc: any) => {
            const isExpiringSoon = isBefore(new Date(doc.expiryDate), addMonths(new Date(), 3));
            const isExpired = isBefore(new Date(doc.expiryDate), new Date());
            
            return (
              <div 
                key={doc.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">
                        {doc.passportNumber || doc.visaNumber || doc.idNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{doc.issuingCountry}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Valid until {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    
                    {isExpiringSoon && !isExpired && (
                      <div className="flex items-center text-sm text-warning mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Expiring soon</span>
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="flex items-center text-sm text-error mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Expired</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-muted-foreground hover:text-error rounded-md hover:bg-muted transition-colors"
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
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Documents</h2>
      </div>

      <div className="card">
        <div className="border-b mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'passport'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
              onClick={() => setActiveTab('passport')}
            >
              Passport
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'visa'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
              onClick={() => setActiveTab('visa')}
            >
              Visa
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'identification'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
              onClick={() => setActiveTab('identification')}
            >
              Identification
            </button>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="document"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label 
                  htmlFor="document"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PDF, JPG or PNG (max. 10MB)
                  </span>
                </label>
              </div>
            </div>

            {activeTab === 'passport' && renderPassportForm()}
            {activeTab === 'visa' && renderVisaForm()}
            {activeTab === 'identification' && renderIdForm()}

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Upload Document
              </button>
            </div>
          </div>
        </form>

        {renderExistingDocuments()}
      </div>
    </div>
  );
};

export default Documents;