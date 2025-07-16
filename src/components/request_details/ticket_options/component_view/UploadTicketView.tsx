import React from 'react';
import { Plus, Edit, Trash, Save, X, Ticket } from 'lucide-react';
import { TicketOption } from '../../../../data/mockData';

interface CustomButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

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
  customButtons?: CustomButton[];
}

const UploadTicketView: React.FC<Props> = ({
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
  customButtons = [],
}) => {
  return (
    <div className="card flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Add Ticket Options</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {ticketOptions.length} option{ticketOptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h5 className="text-med font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={onAddOption}
                disabled={!newOption.trim()}
              >
                <Plus size={18} />
                {/* <span className="hidden sm:inline">Add</span> */}
              </button>
            </div>
          </div>
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
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                          onClick={() => onSaveEdit(option.id)}
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                          onClick={onCancelEdit}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Option {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{option.description}</p>
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
      {ticketOptions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-t border-green-200 mt-auto flex gap-3 justify-between">
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Uploaded</h5>
            <p className="text-sm text-gray-600">
              {ticketOptions.length} option{ticketOptions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onUploadOptions}
            >
              <Trash size={18} />
              Clear All
            </button>
            {customButtons.map((button, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  button.className || 'bg-gray-500 text-white hover:bg-gray-600'
                } ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
                onClick={button.onClick}
                disabled={button.disabled}
              >
                {button.icon}
                {button.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTicketView;