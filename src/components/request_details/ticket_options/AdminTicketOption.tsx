import React, { useState, useEffect } from 'react';
import { Plus, Upload, Edit, Trash, Save, X, FileText, Eye } from 'lucide-react';
import axios from 'axios';

interface TicketOption {
  id: string;
  description: string;
  requestId: string;
}

interface Props {
  requestId: string;
  requestStatus: string;
}

const API_BASE_URL = "http://localhost:5171/api/TicketOptions";

const AdminTicketOptionsView: React.FC<Props> = ({ requestId, requestStatus }) => {
  // State management
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch ticket options
  const fetchTicketOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get<TicketOption[]>(
        `${API_BASE_URL}/${requestId}/ticketoption`
      );
      
      // Filter out any options with undefined or null ids and add fallback ids if needed
      const validOptions = response.data
        .map((option, index) => ({
          ...option,
          id: option.id || `temp-id-${Date.now()}-${index}` // Fallback ID generation
        }))
        .filter(option => option.id && option.description); // Only keep valid options
      
      setTicketOptions(validOptions);
    } catch (err) {
      setError(axios.isAxiosError(err) 
        ? err.response?.data?.message || 'Failed to fetch options'
        : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchTicketOptions();
    }
  }, [requestId]);

  console.log(ticketOptions); // CONSOLE LOG

  // API call handlers
  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.post<TicketOption>(
        `${API_BASE_URL}/${requestId}/ticketoption`,
        { description: newOption }
      );
      
      // Ensure the new option has a valid ID
      const newOptionData = {
        ...response.data,
        id: response.data.id || `temp-id-${Date.now()}`
      };
      
      setTicketOptions(prev => [...prev, newOptionData]);
      setNewOption('');
    } catch (err) {
      setError('Failed to add option');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (option: TicketOption) => {
    setEditingOption(option.id);
    setEditText(option.description);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/${requestId}/${id}`,
        { description: editText }
      );
      setTicketOptions(prev => 
        prev.map(opt => opt.id === id ? { ...opt, description: editText } : opt)
      );
      setEditingOption(null);
    } catch (err) {
      setError('Failed to update option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/${requestId}/${id}`);
      setTicketOptions(prev => prev.filter(opt => opt.id !== id));
    } catch (err) {
      setError('Failed to delete option');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadOptions = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/${requestId}/ticketoption/upload`,
        { options: ticketOptions }
      );
      // Success handling
    } catch (err) {
      setError('Failed to upload options');
    } finally {
      setLoading(false);
    }
  };

  // Document upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedDocument(file);
  };

  const handleDeleteDocument = () => setUploadedDocument(null);
  const handlePreviewDocument = () => setShowPreview(true);

  // Helper function to generate safe keys
  const getSafeKey = (option: TicketOption, index: number, prefix: string = 'option') => {
    return option.id ? `${prefix}-${option.id}` : `${prefix}-fallback-${index}`;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  // Status-based rendering
  if (requestStatus === 'Pending') {
    return (
      <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 font-medium">Waiting for Manager Approval</p>
      </div>
    );
  }

  if (requestStatus === 'DU Head Approved') {
    return (
      <div className="space-y-6">
        {/* Upload Ticket Document */}
        <div>
          <h5 className="text-md font-medium mb-2">Upload Ticket Document:</h5>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {uploadedDocument ? (
              <div className="space-y-4" key={`uploaded-${uploadedDocument.name}-${uploadedDocument.size}`}>
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
              <div key="upload-form">
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

        {/* Current Ticket Options */}
        {ticketOptions.length > 0 && (
          <div>
            <h5 className="text-md font-medium mb-2">Current Ticket Options:</h5>
            <div className="space-y-2">
              {ticketOptions.map((option, index) => (
                <div key={getSafeKey(option, index, 'readonly-option')} className="p-4 border rounded-md bg-white shadow">
                  <span>{option.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (requestStatus === 'Manager Approved') {
    return (
      <div className="space-y-6 relative pb-24">
        {/* Add Ticket Option */}
        <div className="flex justify-between items-center">
          <h5 className="text-md font-medium">Ticket Option:</h5>
          <button
            className="flex items-center gap-1 px-2 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            onClick={handleAddOption}
            disabled={!newOption.trim()}
          >
            <Plus size={16} />
          </button>
        </div>

        <textarea
          className="w-full p-2 border rounded-md"
          placeholder="Enter ticket option"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />

        {/* Ticket Options List */}
        {ticketOptions.length === 0 ? (
          <p className="text-gray-500 italic">No ticket options added yet.</p>
        ) : (
          ticketOptions.map((option, index) => (
            <div key={getSafeKey(option, index, 'editable-option')} className="p-4 border rounded-md bg-white shadow">
              {editingOption === option.id ? (
                <div>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => handleSaveEdit(option.id)}
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                      onClick={() => setEditingOption(null)}
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
                      onClick={() => handleEditOption(option)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-red-500 rounded hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Upload Options Button */}
        <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t">
          <div className="flex justify-end">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded font-medium ${
                ticketOptions.length > 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
              onClick={handleUploadOptions}
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

  if (requestStatus === 'Rejected') {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 font-medium">Request Rejected</p>
      </div>
    );
  }

  // Default view for other statuses
  return (
    <div className="space-y-6">
      <h5 className="text-md font-medium">Ticket Options:</h5>
      {ticketOptions.length === 0 ? (
        <p className="text-gray-500 italic">No ticket options available.</p>
      ) : (
        ticketOptions.map((option, index) => (
          <div key={getSafeKey(option, index, 'default-option')} className="p-4 border rounded-md bg-white shadow">
            <span>{option.description}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminTicketOptionsView;