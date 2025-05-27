import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

interface TicketOptionData {
  optionId: number;
  requestId: number;
  optionDescription: string;
  isSelected: boolean;
}

interface Props {
  requestId: string;
  onDownloadTickets: () => void;
  requestStatus: string;
}

const EmployeeTicketOptionsView: React.FC<Props> = ({
  requestId,
  onDownloadTickets,
  requestStatus,
}) => {
  const [ticketOptions, setTicketOptions] = useState<TicketOptionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = "http://localhost:5171/api/TicketOptions";

  const fetchTicketOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all ticket options
      const [optionsResponse] = await Promise.all([
        axios.get<TicketOptionData[]>(`${API_BASE_URL}/${requestId}/ticketoption`),
      ]);

      const transformedOptions: TicketOptionData[] = optionsResponse.data.map(option => ({
        ...option,
      }));

      setTicketOptions(transformedOptions);
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

  const selectedOption = ticketOptions.find(opt => opt.isSelected);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading ticket options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center bg-red-50 border border-red-200 text-red-600 rounded-md">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requestStatus.toLowerCase() === 'pending' ? (
        <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Waiting for approval</p>
        </div>
      ) : requestStatus.toLowerCase() === 'rejected' ? (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Request has been rejected</p>
        </div>
      ) : ticketOptions.length === 0 ? (
        <div className="p-6 text-center bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-medium">No ticket options available yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {ticketOptions.map(option => (
              <div
                key={option.optionId}
                className={`p-4 border rounded-md shadow transition-colors ${
                  option.isSelected
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
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
            ))}
          </div>
        </>
      )}

      {selectedOption && requestStatus.toLowerCase() === 'tickets dispatched' && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onDownloadTickets}
        >
          <Download size={16} /> Download Tickets
        </button>
      )}
    </div>
  );
};

export default EmployeeTicketOptionsView;
