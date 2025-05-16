import React from 'react';
import { useTravelRequest } from './TravelRequestContext';

const PurposeSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { reason } = state;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Purpose of Travel</h3>
      
      <div>
        <label className="text-sm font-medium">
          Reason for Trip
          <textarea
            className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
            value={reason}
            onChange={(e) => dispatch({ type: 'SET_REASON', payload: e.target.value })}
            placeholder="Please provide details about the purpose of your travel..."
            required
          />
        </label>
      </div>
    </div>
  );
};

export default PurposeSection;