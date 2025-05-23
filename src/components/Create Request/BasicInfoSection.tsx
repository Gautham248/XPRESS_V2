import React from 'react';
import { useTravelRequest } from './TravelRequestContext';

const BasicInfoSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { travelType, tripType } = state;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travel Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Travel Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`relative flex items-center justify-center h-12 rounded-md border transition-all ${
                travelType === 'domestic'
                  ? 'bg-blue-900 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => dispatch({ type: 'SET_TRAVEL_TYPE', payload: 'domestic' })}
            >
              {travelType === 'domestic' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-2 right-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${travelType === 'domestic' ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Domestic</span>
              </div>
            </button>
            <button
              type="button"
              className={`relative flex items-center justify-center h-12 rounded-md border transition-all ${
                travelType === 'international'
                  ? 'bg-blue-900 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => dispatch({ type: 'SET_TRAVEL_TYPE', payload: 'international' })}
            >
              {travelType === 'international' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-2 right-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${travelType === 'international' ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">International</span>
              </div>
            </button>
          </div>
        </div>

        {/* Trip Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Trip Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`relative flex items-center justify-center h-12 rounded-md border transition-all ${
                tripType === 'oneWay'
                  ? 'bg-blue-900 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => dispatch({ type: 'SET_TRIP_TYPE', payload: 'oneWay' })}
            >
              {tripType === 'oneWay' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-2 right-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${tripType === 'oneWay' ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="font-medium">One Way</span>
              </div>
            </button>
            <button
              type="button"
              className={`relative flex items-center justify-center h-12 rounded-md border transition-all ${
                tripType === 'roundTrip'
                  ? 'bg-blue-900 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => dispatch({ type: 'SET_TRIP_TYPE', payload: 'roundTrip' })}
            >
              {tripType === 'roundTrip' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-2 right-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${tripType === 'roundTrip' ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="font-medium">Round Trip</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;