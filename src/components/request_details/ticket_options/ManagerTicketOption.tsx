import React, { useState } from 'react';
import { TicketOption } from '../../../data/mockData';
import { Edit, Trash, Upload } from 'lucide-react';

interface Props {
  ticketOptions: TicketOption[];
  onSelectOption: (id: string) => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onUploadOptions: () => void;
  requestStatus: string;
}

const ManagerTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  onSelectOption,
  onEditOption,
  onDeleteOption,
  onUploadOptions,
  requestStatus,
}) => {
  // Local state to track temporary selections before submission
  const [tempSelections, setTempSelections] = useState<{ [key: string]: boolean }>({});
  
  // Check if any option is selected (in actual data)
  const hasSelectedOptions = ticketOptions.some(option => option.selected);
  
  // Check if status is between Manager Approved and DU Head Approved (selection phase)
  const isSelectionPhase = ['Manager Approved', 'Options Created'].includes(requestStatus);
  
  // Handle temporary selection changes
  const handleTempSelection = (optionId: string) => {
    setTempSelections(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };
  
  // Handle submit - apply all temporary selections
  const handleSubmitOptions = () => {
    // Apply all temporary selections
    Object.keys(tempSelections).forEach(optionId => {
      if (tempSelections[optionId]) {
        onSelectOption(optionId);
      }
    });
    
    // Clear temporary selections
    setTempSelections({});
    
    // Call the upload options function
    onUploadOptions();
  };
  
  // Check if any temporary selections exist
  const hasTempSelections = Object.values(tempSelections).some(selected => selected);
  
  return (
    <div className="space-y-6">
      
      {requestStatus.toLowerCase() === 'pending' ? (
        <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Waiting for your approval</p>
        </div>
      ) : requestStatus.toLowerCase() === 'rejected' ? (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Request has been rejected</p>
        </div>
      ) : ticketOptions.length === 0 ? (
        <div className="p-6 text-center bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-medium">No ticket options available.</p>
        </div>
      ) : (
        <>
          <h4 className="text-md font-medium text-gray-600">Select Tickets</h4>
          {/* If in selection phase and no options selected, show interactive selection */}
          {isSelectionPhase && !hasSelectedOptions ? (
            <>
              {ticketOptions.map(option => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-md shadow flex items-center justify-between ${
                    tempSelections[option.id] ? 'bg-blue-100 border-blue-500' : ''
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={tempSelections[option.id] || false}
                      onChange={() => handleTempSelection(option.id)}
                    />
                    <span className="flex-1">{option.description}</span>
                  </label>
                </div>
              ))}
              
              {/* Submit Button */}
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded ${
                  hasTempSelections
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
                onClick={handleSubmitOptions}
                disabled={!hasTempSelections}
              >
                <Upload size={16} />
                <p className='text-sm'>Submit Options</p>
              </button>
            </>
          ) : (
            /* Display options with selected ones highlighted (read-only or post-selection) */
            <>
              {ticketOptions.map(option => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-md shadow ${
                    option.selected 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.selected && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <span className={`flex-1 ${option.selected ? 'font-medium text-green-800' : 'text-gray-700'}`}>
                      {option.description}
                    </span>
                    {option.selected && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {hasSelectedOptions && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm font-medium">
                    ✓ Ticket selection completed
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerTicketOptionsView;