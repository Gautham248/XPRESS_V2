import React from 'react';
import { TicketOption } from '../../../../data/mockData';
import { Upload, Ticket } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
  onSelectOption: (id: string) => void;
  onUploadOptions: () => void;
  selectedOptionId: string | null;
}

const SelectTicketView: React.FC<Props> = ({
  ticketOptions,
  onSelectOption,
  onUploadOptions,
  selectedOptionId,
}) => {
   const hasPendingSelection = selectedOptionId !== null;

  return (
    <div className="card flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-l font-bold text-gray-800">Select Ticket Options</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {ticketOptions.length} option{ticketOptions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {ticketOptions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No ticket options available</p>
              <p className="text-gray-400 text-sm">Please wait for options to be added.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticketOptions.map(option => {
                const isSelected = option.id === selectedOptionId;

                return (
                  <div
                    key={option.id}
                    className={`group relative p-5 border-2 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                    )}
                    <div className="flex items-center justify-between">
                      <label
                        className="flex items-center gap-4 cursor-pointer flex-1 pr-24"
                        onClick={() => onSelectOption(option.id)}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-base whitespace-pre-line ${
                              isSelected
                                ? 'font-semibold text-gray-800'
                                : 'text-gray-700 group-hover:text-gray-900'
                            }`}
                          >
                            {option.description}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {hasPendingSelection && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-blue-200 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">Ready to Upload</h5>
              <p className="text-sm text-gray-600">
                1 option ready for upload
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              onClick={onUploadOptions}
            >
              <Upload size={18} />
              Submit Selected Option
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectTicketView;