import React from 'react';
import { Plus, Upload, Edit, Trash, Save, X, Ticket } from 'lucide-react';
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
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-800">Create Ticket Options</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {ticketOptions.length} option{ticketOptions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Add New Option Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Ticket Option
            </h5>
            <div className="flex items-start gap-3">
              <textarea
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl h-20 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Enter a detailed ticket option description..."
                value={newOption}
                onChange={(e) => onChangeNewOption(e.target.value)}
              />
              <button
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={onAddOption}
                disabled={!newOption.trim()}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-4">
            {ticketOptions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No ticket options created yet</p>
                <p className="text-gray-400 text-sm">Add your first option above to get started</p>
              </div>
            ) : (
              ticketOptions.map((option, index) => (
                <div key={option.id} className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  {editingOption === option.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Edit size={16} />
                        Editing Option {index + 1}
                      </div>
                      <textarea
                        className="w-full p-4 border-2 border-blue-200 rounded-xl h-20 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                        value={editText}
                        onChange={(e) => onChangeEditText(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                          onClick={() => onSaveEdit(option.id)}
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                          onClick={onCancelEdit}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Option {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{option.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
                          onClick={() => onEditOption(option)}
                          title="Edit option"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
                          onClick={() => onDeleteOption(option.id)}
                          title="Delete option"
                        >
                          <Trash size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fixed Upload Button at Bottom */}
      {ticketOptions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-t border-green-200 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">Ready to Upload</h5>
              <p className="text-sm text-gray-600">
                {ticketOptions.length} option{ticketOptions.length !== 1 ? 's' : ''} ready to be made available
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onUploadOptions}
            >
              <Upload size={18} />
              Upload All Options
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketOptionsView;