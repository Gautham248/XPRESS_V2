import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { useModal } from '../confirmation_modal/hooks/useModal';
import ConfirmationModal from '../confirmation_modal/ConfirmationModal';

interface TicketOptionData {
  optionId: number;
  requestId: number;
  optionDescription: string;
  isSelected: boolean;
}

interface Props {
  requestId: string;
  requestStatus: string;
}

const API_BASE_URL = "http://localhost:5171/api/TicketOptions";

const ManagerTicketOptionsView: React.FC<Props> = ({
  requestId,
  requestStatus,
}) => {
  const [ticketOptions, setTicketOptions] = useState<TicketOptionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const { isOpen, title, content, buttons, openModal, closeModal } = useModal();

  // Fetch ticket options from API
  const fetchTicketOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<TicketOptionData[]>(`${API_BASE_URL}/${requestId}/ticketoption`);
      console.log("API Response:", response.data);

      // Find and set the initially selected option if any
      const selected = response.data.find(opt => opt.isSelected);
      if (selected) {
        setSelectedOptionId(selected.optionId);
      }

      setTicketOptions(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch ticket options');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error fetching ticket options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchTicketOptions();
    }
  }, [requestId]);

  // Handle option selection
  const handleSelectOption = async (optionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/${requestId}/${optionId}/select`,
        {
          "userId": 0,   // TO-DO: populate this with employee id
          "comments": "string"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Selection response:', response.data);

      if (response.status === 200) {
        setSelectedOptionId(optionId);
        // Optimistically update local state
        setTicketOptions(prev => prev.map(opt => ({
          ...opt,
          isSelected: opt.optionId === optionId
        })));
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to select option';
      setError(errorMessage);
      if (axios.isAxiosError(err)) {
        console.error('Selection error:', err.response?.data || err);
      } else {
        console.error('Selection error:', err);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const performSubmission = async () => {
    if (!selectedOptionId) return;

    try {
      setLoading(true);
      setError(null);

      const selectionSuccess = await handleSelectOption(selectedOptionId);
      if (!selectionSuccess) return;
      
      const selectedOption = ticketOptions.find(opt => opt.optionId === selectedOptionId);
      if (!selectedOption) {
        setError('Selected option not found.');
        return;
      }

      const postResponse = await axios.put(
        `${API_BASE_URL}/${requestId}/${selectedOption.optionId}`,
        {
          optionDescription: selectedOption.optionDescription,
          isSelected: true
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Finalization response:', postResponse.data);
      await fetchTicketOptions();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (!selectedOptionId) return;

    const selectedOption = ticketOptions.find(opt => opt.optionId === selectedOptionId);
    if (!selectedOption) return;

    openModal(
      <div>
        <p>Are you sure you want to select this ticket option?</p>
        <p className="font-medium mt-2">{selectedOption.optionDescription}</p>
      </div>,
      performSubmission,
      'Confirm Ticket Selection'
    );
  };

  const isSelectionPhase = ['Manager Approved'].includes(requestStatus);
  const hasSelectedOptions = ticketOptions.some(opt => opt.isSelected);

  if (loading) {
    return <div className="p-4 text-center">Loading ticket options...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmationModal
        isOpen={isOpen}
        title={title}
        onClose={closeModal}
        buttons={buttons}
        content={content}
      />
      {requestStatus.toLowerCase() === 'pending' ? (
        <div className="p-4 text-center bg-yellow-50 text-yellow-800">
          Waiting for approval
        </div>
      ) : requestStatus.toLowerCase() === 'rejected' ? (
        <div className="p-4 text-center bg-red-50 text-red-800">
          Request has been rejected
        </div>
      ) : ticketOptions.length === 0 ? (
        <div className="p-4 text-center bg-blue-50 text-blue-800">
          No ticket options available yet.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {isSelectionPhase && !hasSelectedOptions ? (
              // Selection interface
              ticketOptions.map(option => (
                <div
                  key={option.optionId}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedOptionId === option.optionId
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  onClick={() => setSelectedOptionId(option.optionId)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOptionId === option.optionId}
                      onChange={() => setSelectedOptionId(option.optionId)}
                      className="cursor-pointer"
                    />
                    <span className="flex-1">{option.optionDescription}</span>
                  </div>
                </div>
              ))
            ) : (
              // Display-only interface
              ticketOptions.map(option => (
                <div
                  key={option.optionId}
                  className={`p-4 border rounded-md ${option.isSelected
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {option.isSelected && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <span className={`flex-1 ${option.isSelected ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                      {option.optionDescription}
                    </span>
                    {option.isSelected && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {isSelectionPhase && !hasSelectedOptions && (
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded ${selectedOptionId
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
              onClick={handleSubmitClick}
              disabled={!selectedOptionId || loading}
            >
              <Upload size={16} />
              {loading ? 'Submitting...' : 'Submit Selection'}
            </button>
          )}

          {hasSelectedOptions && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium">
                ✓ Ticket selection completed
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerTicketOptionsView;