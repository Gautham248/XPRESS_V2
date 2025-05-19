import React, { useEffect } from 'react';
import { useTravelRequest } from './TravelRequestContext';
 
const BasicInfoSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { travelType, tripType, requestCode, projectCode } = state;
 
 
  const generateRequestCode = () => {
    const today = new Date();
    const year = today.getFullYear();
   
 
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const milliseconds = today.getMilliseconds();
   
 
    let sequentialNum = ((minutes * 60 + seconds) * 1000 + milliseconds) % 999 + 1;
   
 
    const formattedNum = String(sequentialNum).padStart(3, '0');
   
    return `TR-${year}-${formattedNum}`;
  };
 
  // Auto-generate request code when component mounts if it's empty
  useEffect(() => {
    if (!requestCode) {
      const newCode = generateRequestCode();
      dispatch({ type: 'SET_REQUEST_CODE', payload: newCode });
    }
  }, [requestCode, dispatch]);
 
  // Handler for request code field focus (regenerate on focus if user wants a new one)
  const handleRequestCodeFocus = () => {
    const newCode = generateRequestCode();
    dispatch({ type: 'SET_REQUEST_CODE', payload: newCode });
  };
 
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            Travel Type
            <div className="mt-1 flex rounded-md overflow-hidden">
              <button
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  travelType === 'domestic'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
                onClick={() => dispatch({ type: 'SET_TRAVEL_TYPE', payload: 'domestic' })}
              >
                Domestic
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  travelType === 'international'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
                onClick={() => dispatch({ type: 'SET_TRAVEL_TYPE', payload: 'international' })}
              >
                International
              </button>
            </div>
          </label>
        </div>
 
        <div>
          <label className="text-sm font-medium">
            Trip Type
            <div className="mt-1 flex rounded-md overflow-hidden">
              <button
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  tripType === 'oneWay'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
                onClick={() => dispatch({ type: 'SET_TRIP_TYPE', payload: 'oneWay' })}
              >
                One Way
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  tripType === 'roundTrip'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
                onClick={() => dispatch({ type: 'SET_TRIP_TYPE', payload: 'roundTrip' })}
              >
                Round Trip
              </button>
            </div>
          </label>
        </div>
 
        <div>
          <label className="text-sm font-medium">
            Request Code
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={requestCode}
              onChange={(e) => dispatch({ type: 'SET_REQUEST_CODE', payload: e.target.value })}
              onFocus={handleRequestCodeFocus}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Click to generate a new code</p>
          </label>
        </div>
 
        <div>
          <label className="text-sm font-medium">
            Project Code
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={projectCode}
              onChange={(e) => dispatch({ type: 'SET_PROJECT_CODE', payload: e.target.value })}
              required
            />
          </label>
        </div>
      </div>
    </div>
  );
};
 
export default BasicInfoSection;