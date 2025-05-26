import React, { useState } from 'react';
import { Plus, Upload, Edit, Trash, Save, X, FileText, Eye } from 'lucide-react';
import { TicketOption } from '../../../data/mockData';

interface Props {
  ticketOptions: TicketOption[];
  newOption: string;
  editingOption: string | null;
  editText: string;
  status: string;
  onChangeNewOption: (value: string) => void;
  onAddOption: () => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChangeEditText: (value: string) => void;
  onUploadOptions: () => void;
}

const AdminTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  newOption,
  editingOption,
  editText,
  status,
  onChangeNewOption,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onSaveEdit,
  onCancelEdit,
  onChangeEditText,
  onUploadOptions,
}) => {
  const [agencyName, setAgencyName] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
    }
  };

  const handleDeleteDocument = () => {
    setUploadedDocument(null);
    setShowPreview(false);
  };

  const handlePreviewDocument = () => {
    setShowPreview(true);
  };

  // Status-based rendering logic
  if (status === 'Pending') {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Waiting for Manager Approval</p>
        </div>
      </div>
    );
  }

  if (status === 'DU Head Approved') {
    return (
      <div className="space-y-6">
        {/* Travel Agency Name Input */}
        {/* <div>
          <h5 className="text-md font-medium mb-2">Travel Agency:</h5>
          <input
            type="text"
            placeholder="Enter travel agency name"
            className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
          />
        </div>
        <hr /> */}

        {/* Upload Tickets Section */}
        <div>
          <h5 className="text-md font-medium mb-2">Upload Ticket Document:</h5>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {uploadedDocument ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText size={22} />
                  <span className="font-medium">{uploadedDocument.name}</span>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handlePreviewDocument}
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleDeleteDocument}
                  >
                    <Trash size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="ticket-upload"
                />
                <label
                  htmlFor="ticket-upload"
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer inline-flex"
                >
                  <Upload size={20} />
                  Upload Tickets
                </label>
                <p className="text-gray-500 mt-2">Select PDF, DOC, or DOCX files</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {showPreview && uploadedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Document Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="font-medium">{uploadedDocument.name}</p>
                <p className="text-sm text-gray-500">
                  Size: {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display existing ticket options (read-only) */}
        {ticketOptions.length > 0 && (
          <div>
            <h5 className="text-md font-medium mb-2">Current Ticket Options:</h5>
            <div className="space-y-2">
              {ticketOptions.map(option => (
                <div key={option.id} className="p-4 border rounded-md bg-white shadow">
                  <span>{option.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'Manager Approved') {
    return (
      <div className="space-y-6 relative pb-24">
        {/* Heading and Add Button */}
        <div className="flex justify-between items-center">
          <h5 className="text-md font-medium">Ticket Option:</h5>
          <button
            className="flex items-center gap-1 px-2 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            onClick={onAddOption}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          className="w-full p-2 border rounded-md"
          placeholder="Enter ticket option"
          value={newOption}
          onChange={(e) => onChangeNewOption(e.target.value)}
        />

        {/* Ticket Options List */}
        {ticketOptions.length === 0 ? (
          <p className="text-gray-500 italic">No ticket options added yet.</p>
        ) : (
          ticketOptions.map(option => (
            <div key={option.id} className="p-4 border rounded-md bg-white shadow">
              {editingOption === option.id ? (
                <div>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    value={editText}
                    onChange={(e) => onChangeEditText(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 hover:text-white"
                      onClick={() => onSaveEdit(option.id)}
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600 hover:text-white"
                      onClick={onCancelEdit}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{option.description}</span>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white"
                      onClick={() => onEditOption(option)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-red-500 rounded hover:bg-red-500 hover:text-white"
                      onClick={() => onDeleteOption(option.id)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Sticky Upload Button */}
        <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t">
          <div className="flex justify-end">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded font-medium transition-all duration-200 ${ticketOptions.length > 0
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
              onClick={onUploadOptions}
              disabled={ticketOptions.length === 0}
            >
              <Upload size={18} />
              Upload Options
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'Rejected') {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Request Rejected</p>
        </div>
      </div>
    );
  }


  // For any other status - simply show ticket options (read-only)
  return (
    <div className="space-y-6">
      <h5 className="text-md font-medium">Ticket Options:</h5>
      {ticketOptions.length === 0 ? (
        <p className="text-gray-500 italic">No ticket options available.</p>
      ) : (
        ticketOptions.map(option => (
          <div key={option.id} className="p-4 border rounded-md bg-white shadow">
            <span>{option.description}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminTicketOptionsView;