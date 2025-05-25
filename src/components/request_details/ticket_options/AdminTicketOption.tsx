import React, { useRef, useState } from 'react';
import { Plus, Upload, Edit, Trash, Save, X, FileText, Eye, Trash2 } from 'lucide-react';
import { TicketOption } from '../../../data/mockData';

interface Props {
  ticketOptions: TicketOption[];
  newOption: string;
  editingOption: string | null;
  editText: string;
  onChangeNewOption: (value: string) => void;
  onAddOption: () => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChangeEditText: (value: string) => void;
  onUploadOptions: () => void;
  status: string;
}

const AdminTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  newOption,
  editingOption,
  editText,
  onChangeNewOption,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onSaveEdit,
  onCancelEdit,
  onChangeEditText,
  onUploadOptions,
  status
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // UI: Ticket Option Row
  const renderTicketOptions = () => (
    <ul className="space-y-2">
      {ticketOptions.map((option) => (
        <li
          key={option.id}
          className={`flex items-center justify-between border p-2 rounded ${
            status === 'Ticket Selected' && option.selected ? 'bg-green-100 border-green-500 font-semibold' : ''
          }`}
        >
          {editingOption === option.id ? (
            <>
              <input
                type="text"
                className="flex-1 border rounded p-1 mr-2"
                value={editText}
                onChange={(e) => onChangeEditText(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => onSaveEdit(option.id)} title="Save">
                  <Save className="text-green-600" />
                </button>
                <button onClick={onCancelEdit} title="Cancel">
                  <X className="text-gray-600" />
                </button>
              </div>
            </>
          ) : (
            <>
              <span>{option.description}</span>
              {status === 'Manager Approved' && (
                <div className="flex gap-2">
                  <button onClick={() => onEditOption(option)} title="Edit">
                    <Edit className="text-blue-500" />
                  </button>
                  <button onClick={() => onDeleteOption(option.id)} title="Delete">
                    <Trash className="text-red-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );

  // UI: Upload Ticket File
  const renderTicketUploadSection = () => (
    <div className="border rounded p-4 mt-4">
      <label className="block font-medium mb-2">Upload Final Ticket Document:</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="mb-2"
      />
      {uploadedFile && (
        <div className="flex items-center justify-between border p-2 rounded bg-gray-100 mt-2">
          <span className="truncate">{uploadedFile.name}</span>
          <div className="flex gap-2">
            <a href={URL.createObjectURL(uploadedFile)} target="_blank" rel="noopener noreferrer" title="Preview">
              <Eye className="text-blue-600" />
            </a>
            <button onClick={handleRemoveFile} title="Remove">
              <Trash2 className="text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER
  return (
    <div className="space-y-4">
      {status === 'Pending' && (
        <p className="text-gray-600 italic">Waiting for manager approval...</p>
      )}

      {status === 'Manager Approved' && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new option"
              value={newOption}
              onChange={(e) => onChangeNewOption(e.target.value)}
              className="border rounded p-2 flex-1"
            />
            <button
              onClick={onAddOption}
              className="flex items-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              <Plus className="mr-1" size={18} />
              Add
            </button>
          </div>

          {renderTicketOptions()}

          <div className="flex justify-end">
            <button
              onClick={onUploadOptions}
              className="flex items-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              <Upload className="mr-1" size={18} />
              Upload Options
            </button>
          </div>
        </>
      )}

      {status === 'Ticket Selected' && renderTicketOptions()}

      {status === 'DU Head Approved' && renderTicketUploadSection()}
    </div>
  );
};

export default AdminTicketOptionsView;
