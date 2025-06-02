import React from 'react';

interface CloseRequestModalContentProps {
  closeRequestData: {
    travelAgency: string;
    sameAirlines: boolean;
    departureAirline: string;
    departureCost: string;
    returnAirline: string;
    returnCost: string;
    totalExpenses: string;
  };
  handleCloseRequestInputChange: (field: string, value: string | boolean) => void;
}

const CloseRequestModalContent: React.FC<CloseRequestModalContentProps> = ({ 
  closeRequestData, 
  handleCloseRequestInputChange 
}) => {
  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Travel Agency Name *</label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter travel agency name"
          value={closeRequestData.travelAgency}
          onChange={(e) => handleCloseRequestInputChange('travelAgency', e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="sameAirlines"
            className="mr-2 h-4 w-4"
            checked={closeRequestData.sameAirlines}
            onChange={(e) => handleCloseRequestInputChange('sameAirlines', e.target.checked)}
          />
          <label htmlFor="sameAirlines" className="text-sm font-medium cursor-pointer">
            Same airline for departure and return
          </label>
        </div>

        {closeRequestData.sameAirlines ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Airline Name *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter airline name"
                value={closeRequestData.departureAirline}
                onChange={(e) => handleCloseRequestInputChange('departureAirline', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Airline Cost (₹) *</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                value={closeRequestData.departureCost}
                onChange={(e) => handleCloseRequestInputChange('departureCost', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Departure Airline *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter departure airline name"
                value={closeRequestData.departureAirline}
                onChange={(e) => handleCloseRequestInputChange('departureAirline', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Departure Cost (₹) *</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                value={closeRequestData.departureCost}
                onChange={(e) => handleCloseRequestInputChange('departureCost', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Return Airline *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter return airline name"
                value={closeRequestData.returnAirline}
                onChange={(e) => handleCloseRequestInputChange('returnAirline', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Return Cost (₹) *</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                value={closeRequestData.returnCost}
                onChange={(e) => handleCloseRequestInputChange('returnCost', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Total Travel Expenses (₹) *</label>
        <input
          type="number"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
          value={closeRequestData.totalExpenses}
          onChange={(e) => handleCloseRequestInputChange('totalExpenses', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Include all travel-related expenses (flights, hotels, meals, etc.)</p>
      </div>
    </div>
  );
};

export default CloseRequestModalContent;