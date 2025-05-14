import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Plane,
  Train,
  Bus,
  Car,
  MapPin,
  Calendar,
  Building,
  FileText,
  Hotel,
  Clock
} from 'lucide-react';

interface Location {
  country: string;
  city: string;
  label: string;
  value: string;
}

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [travelType, setTravelType] = useState<'domestic' | 'international'>('domestic');
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('roundTrip');
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [transportMode, setTransportMode] = useState<string>('flight');
  const [requiresAccommodation, setRequiresAccommodation] = useState(false);
  const [requiresPickup, setRequiresPickup] = useState(false);
  const [requiresDropoff, setRequiresDropoff] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState<Date | null>(null);
  const [requestCode, setRequestCode] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [reason, setReason] = useState('');

  // Mock location data - In production, this would be fetched from an API
  const locations: Location[] = [
    { country: 'USA', city: 'New York', label: 'New York, USA', value: 'new-york-usa' },
    { country: 'USA', city: 'San Francisco', label: 'San Francisco, USA', value: 'san-francisco-usa' },
    { country: 'UK', city: 'London', label: 'London, UK', value: 'london-uk' },
    { country: 'Japan', city: 'Tokyo', label: 'Tokyo, Japan', value: 'tokyo-japan' },
    { country: 'India', city: 'Mumbai', label: 'Mumbai, India', value: 'mumbai-india' },
  ];

  const transportOptions = travelType === 'international' 
    ? [{ value: 'flight', label: 'Flight', icon: Plane }]
    : [
        { value: 'flight', label: 'Flight', icon: Plane },
        { value: 'train', label: 'Train', icon: Train },
        { value: 'bus', label: 'Bus', icon: Bus },
        { value: 'cab', label: 'Cab', icon: Car },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      travelType,
      tripType,
      requestCode,
      projectCode,
      source,
      destination,
      departureDate,
      returnDate,
      transportMode,
      requiresAccommodation,
      requiresPickup,
      requiresDropoff,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      reason,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Create Travel Request</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                    onClick={() => setTravelType('domestic')}
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
                    onClick={() => setTravelType('international')}
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
                    onClick={() => setTripType('oneWay')}
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
                    onClick={() => setTripType('roundTrip')}
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
                  onChange={(e) => setRequestCode(e.target.value)}
                  required
                />
              </label>
            </div>

            <div>
              <label className="text-sm font-medium">
                Project Code
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Travel Details</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">
                  Source Location
                  <Select
                    className="mt-1"
                    options={locations}
                    value={source}
                    onChange={(selected) => setSource(selected as Location)}
                    placeholder="Search for a location..."
                    required
                  />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Destination
                  <Select
                    className="mt-1"
                    options={locations}
                    value={destination}
                    onChange={(selected) => setDestination(selected as Location)}
                    placeholder="Search for a location..."
                    required
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">
                  Departure Date
                  <DatePicker
                    selected={departureDate}
                    onChange={(date) => setDepartureDate(date)}
                    className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    minDate={new Date()}
                    placeholderText="Select departure date"
                    required
                  />
                </label>
              </div>

              {tripType === 'roundTrip' && (
                <div>
                  <label className="text-sm font-medium">
                    Return Date
                    <DatePicker
                      selected={returnDate}
                      onChange={(date) => setReturnDate(date)}
                      className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      minDate={departureDate || new Date()}
                      placeholderText="Select return date"
                      required
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Mode of Transport</label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {transportOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`flex items-center justify-center p-4 rounded-md border ${
                      transportMode === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted hover:bg-muted/70'
                    }`}
                    onClick={() => setTransportMode(value)}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Additional Services</h3>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="accommodation"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={requiresAccommodation}
                onChange={(e) => setRequiresAccommodation(e.target.checked)}
              />
              <label htmlFor="accommodation" className="text-sm font-medium">
                Requires Accommodation
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pickup"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={requiresPickup}
                onChange={(e) => setRequiresPickup(e.target.checked)}
              />
              <label htmlFor="pickup" className="text-sm font-medium">
                Requires Pickup
              </label>
            </div>

            {requiresPickup && (
              <div className="pl-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Pickup Location
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Preferred Pickup Time
                    <DatePicker
                      selected={pickupTime}
                      onChange={(date) => setPickupTime(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="dropoff"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={requiresDropoff}
                onChange={(e) => setRequiresDropoff(e.target.checked)}
              />
              <label htmlFor="dropoff" className="text-sm font-medium">
                Requires Drop-off
              </label>
            </div>

            {requiresDropoff && (
              <div className="pl-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Drop-off Location
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Preferred Drop-off Time
                    <DatePicker
                      selected={dropoffTime}
                      onChange={(date) => setDropoffTime(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Purpose of Travel</h3>
          
          <div>
            <label className="text-sm font-medium">
              Reason for Trip
              <textarea
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide details about the purpose of your travel..."
                required
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/70 rounded-md"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;