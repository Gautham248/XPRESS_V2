import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader } from 'lucide-react';

// This interface should match the structure of your form data
interface TravelRequestFormData {
    travelType: 'Domestic' | 'International';
    tripType: 'One Way' | 'Round Trip';
    sourceLocation: string;
    destination: string;
    projectCode: string;
    outboundDepartureDate: string;
    outboundDepartureTime: string;
    outboundArrivalDate: string;
    outboundArrivalTime: string;
    returnDepartureDate: string;
    returnDepartureTime: string;
    returnArrivalDate: string;
    returnArrivalTime: string;
    modeOfTransport: 'Flight' | 'Train' | 'Bus' | 'Cab';
    purposeOfTravel: string;
    additionalComments: string;
    requiresAccommodation: boolean;
    requiresPickup: boolean;
    pickupLocation: string;
    requiresDropOff: boolean;
    dropOffLocation: string;
    foodPreferenceRequired: boolean;
    foodPreference: 'Vegetarian' | 'Non-Vegetarian' | '';
    foodRequirements: string;
}

interface EditRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    onUpdateSuccess: () => void; // To refresh data on the dashboard
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({ isOpen, onClose, requestId, onUpdateSuccess }) => {
    const [formData, setFormData] = useState<TravelRequestFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && requestId) {
            const fetchRequestData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`http://localhost:5030/api/TravelRequest/${requestId}`);
                    
                    // --- IMPORTANT: MAP YOUR API RESPONSE TO THE FORM STATE ---
                    // This is an example mapping. You MUST adjust this to match your actual API response structure.
                    const apiData = response.data;
                    const [outboundDepartureDate, outboundDepartureTime] = apiData.outboundDepartureDateTime.split('T');
                    const [outboundArrivalDate, outboundArrivalTime] = apiData.outboundArrivalDateTime.split('T');
                    const [returnDepartureDate, returnDepartureTime] = apiData.returnDepartureDateTime ? apiData.returnDepartureDateTime.split('T') : ['', ''];
                    const [returnArrivalDate, returnArrivalTime] = apiData.returnArrivalDateTime ? apiData.returnArrivalDateTime.split('T') : ['', ''];

                    setFormData({
                        travelType: apiData.travelType,
                        tripType: apiData.tripType,
                        sourceLocation: apiData.sourceLocation,
                        destination: apiData.destination,
                        projectCode: apiData.projectCode,
                        outboundDepartureDate: outboundDepartureDate,
                        outboundDepartureTime: outboundDepartureTime.substring(0, 5),
                        outboundArrivalDate: outboundArrivalDate,
                        outboundArrivalTime: outboundArrivalTime.substring(0, 5),
                        returnDepartureDate: returnDepartureDate,
                        returnDepartureTime: returnDepartureTime ? returnDepartureTime.substring(0, 5) : '',
                        returnArrivalDate: returnArrivalDate,
                        returnArrivalTime: returnArrivalTime ? returnArrivalTime.substring(0, 5) : '',
                        modeOfTransport: apiData.modeOfTransport,
                        purposeOfTravel: apiData.purposeOfTravel,
                        additionalComments: apiData.additionalComments,
                        requiresAccommodation: apiData.additionalServices.requiresAccommodation,
                        requiresPickup: apiData.additionalServices.requiresPickup,
                        pickupLocation: apiData.additionalServices.pickupLocation,
                        requiresDropOff: apiData.additionalServices.requiresDropOff,
                        dropOffLocation: apiData.additionalServices.dropOffLocation,
                        foodPreferenceRequired: apiData.additionalServices.foodPreferenceRequired,
                        foodPreference: apiData.additionalServices.foodPreference,
                        foodRequirements: apiData.additionalServices.foodRequirements,
                    });

                } catch (err) {
                    setError('Failed to fetch travel request details. Please try again.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchRequestData();
        }
    }, [isOpen, requestId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => prev ? { ...prev, [name]: checked } : null);
        } else {
            setFormData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };
    
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setSubmitting(true);
        setError(null);

        try {
            // --- IMPORTANT: MAP YOUR FORM STATE TO THE PUT API PAYLOAD ---
            // This is an example. Adjust it to match your API's expected structure.
            const payload = {
                ...formData, // Spread the form data
                // Combine date and time fields if your API expects ISO strings
                outboundDepartureDateTime: `${formData.outboundDepartureDate}T${formData.outboundDepartureTime}:00`,
                outboundArrivalDateTime: `${formData.outboundArrivalDate}T${formData.outboundArrivalTime}:00`,
                returnDepartureDateTime: formData.tripType === 'Round Trip' ? `${formData.returnDepartureDate}T${formData.returnDepartureTime}:00` : null,
                returnArrivalDateTime: formData.tripType === 'Round Trip' ? `${formData.returnArrivalDate}T${formData.returnArrivalTime}:00` : null,
            };
            
            await axios.put(`http://localhost:5030/api/TravelRequest/update/${requestId}`, payload);
            
            alert('Request updated successfully!'); // Or use a toast notification
            onUpdateSuccess(); // Trigger data refresh
            onClose(); // Close the modal
        } catch (err) {
            setError('Failed to update request. Please check the details and try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Edit Travel Request (ID: {requestId})</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {loading && (
                    <div className="p-20 flex justify-center items-center">
                        <Loader className="animate-spin" size={40} />
                        <span className="ml-4 text-lg">Loading Request...</span>
                    </div>
                )}

                {!loading && formData && (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                           {/* Travel & Trip Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Type</label>
                                    <div className="flex space-x-2">
                                       {['Domestic', 'International'].map(type => (
                                           <button type="button" key={type} onClick={() => setFormData({...formData, travelType: type as any})} className={`w-full py-2 px-4 rounded-md border ${formData.travelType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>
                                               {type}
                                           </button>
                                       ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                                     <div className="flex space-x-2">
                                       {['One Way', 'Round Trip'].map(type => (
                                           <button type="button" key={type} onClick={() => setFormData({...formData, tripType: type as any})} className={`w-full py-2 px-4 rounded-md border ${formData.tripType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>
                                               {type}
                                           </button>
                                       ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Travel Details Section - This is a simplified version. Replicate your full form here. */}
                            <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Travel Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input name="sourceLocation" value={formData.sourceLocation} onChange={handleChange} placeholder="Source Location" className="p-2 border rounded-md" />
                                     <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destination" className="p-2 border rounded-md" />
                                     <input name="projectCode" value={formData.projectCode} onChange={handleChange} placeholder="Project Code" className="p-2 border rounded-md" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Outbound Departure</label>
                                        <input type="date" name="outboundDepartureDate" value={formData.outboundDepartureDate} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                        <input type="time" name="outboundDepartureTime" value={formData.outboundDepartureTime} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Outbound Arrival</label>
                                        <input type="date" name="outboundArrivalDate" value={formData.outboundArrivalDate} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                        <input type="time" name="outboundArrivalTime" value={formData.outboundArrivalTime} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                    </div>

                                    {formData.tripType === 'Round Trip' && (
                                    <>
                                        <div>
                                            <label className="text-sm text-gray-600">Return Departure</label>
                                            <input type="date" name="returnDepartureDate" value={formData.returnDepartureDate} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                            <input type="time" name="returnDepartureTime" value={formData.returnDepartureTime} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Return Arrival</label>
                                            <input type="date" name="returnArrivalDate" value={formData.returnArrivalDate} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                            <input type="time" name="returnArrivalTime" value={formData.returnArrivalTime} onChange={handleChange} className="p-2 border rounded-md w-full mt-1" />
                                        </div>
                                    </>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <textarea name="purposeOfTravel" value={formData.purposeOfTravel} onChange={handleChange} placeholder="Purpose of Travel" className="w-full p-2 border rounded-md" rows={3}></textarea>
                                </div>
                            </div>

                            {/* Additional Services - Replicate your full section */}
                             <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Services</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center">
                                        <input type="checkbox" name="requiresAccommodation" checked={formData.requiresAccommodation} onChange={handleChange} className="h-4 w-4" />
                                        <span className="ml-2">Requires Accommodation</span>
                                    </label>
                                    {/* ... Add other checkboxes and conditional inputs like pickup/dropoff locations ... */}
                                    <label className="flex items-center">
                                        <input type="checkbox" name="foodPreferenceRequired" checked={formData.foodPreferenceRequired} onChange={handleChange} className="h-4 w-4" />
                                        <span className="ml-2">Food Preference Required</span>
                                    </label>
                                    {formData.foodPreferenceRequired && (
                                         <div className="ml-6 space-y-2">
                                            <div>
                                                <label className="inline-flex items-center">
                                                    <input type="radio" name="foodPreference" value="Vegetarian" checked={formData.foodPreference === 'Vegetarian'} onChange={handleRadioChange} />
                                                    <span className="ml-2">Vegetarian</span>
                                                </label>
                                                <label className="inline-flex items-center ml-4">
                                                    <input type="radio" name="foodPreference" value="Non-Vegetarian" checked={formData.foodPreference === 'Non-Vegetarian'} onChange={handleRadioChange} />
                                                    <span className="ml-2">Non-Vegetarian</span>
                                                </label>
                                            </div>
                                            <textarea name="foodRequirements" value={formData.foodRequirements} onChange={handleChange} placeholder="Specify any allergies, dietary restrictions, etc." className="w-full p-2 border rounded-md" rows={2}></textarea>
                                         </div>
                                    )}
                                </div>
                             </div>

                        </div>
                        
                        {error && <p className="text-red-500 text-sm p-4 text-center">{error}</p>}
                        
                        <div className="p-6 border-t flex justify-end space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
                                {submitting && <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />}
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditRequestModal;