import React, { useState, useCallback, memo, useEffect } from 'react';
import { X, Plus, Plane, Loader2 } from 'lucide-react';
import axios from 'axios';
import Autocomplete from './Autocomplete';
import FileUploader from './FileUploader';

export interface AirlineTicketData {
    travelAgencyName: string;
    agencyBookingCharge: number;
    totalExpense: number;
    pdfFilePath: string;
    airlines: {
        name: string;
        cost: number;
    }[];
}

export interface Airline {
    name: string;
    cost: string;
}

interface UploadTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: AirlineTicketData) => void;
    transportationType: string;
}

const CLOUDINARY_CLOUD_NAME = "dnwdvq7iv";
const CLOUDINARY_UPLOAD_PRESET = "TicketUpload";

const UploadTicketsModal: React.FC<UploadTicketsModalProps> = memo(({
    isOpen,
    onClose,
    onConfirm,
    transportationType,
}) => {
    const [agencyName, setAgencyName] = useState<string>('');
    const [agencyExpense, setAgencyExpense] = useState<string>('');
    const [totalExpense, setTotalExpense] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [airlines, setAirlines] = useState<Airline[]>([{ name: '', cost: '' }]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [airlineOptions, setAirlineOptions] = useState<string[]>([]);

    // console.log("Transport: " + transportationType);

    useEffect(() => {
        const fetchAirlines = async () => {
            try {
                const response = await axios.get('http://localhost:5030/api/TravelRequest/airlines');
                if (response.data.isSuccess && Array.isArray(response.data.result)) {
                    setAirlineOptions(response.data.result);
                }
            } catch (error) {
                console.error("Failed to fetch airline names:", error);
            }
        };

        if (isOpen) {
            fetchAirlines();
        }
    }, [isOpen]);

    const [errors, setErrors] = useState<{
        agencyName?: string;
        agencyExpense?: string;
        totalExpense?: string;
        file?: string;
        airlines?: { name?: string; cost?: string }[];
    }>({});

    const handleFileSelect = useCallback((files: File[]) => {
        setSelectedFiles(files);
        if (files.length > 0) {
            setErrors(prev => ({ ...prev, file: undefined }));
        }
    }, []);

    const handleAirlineChange = useCallback((index: number, field: keyof Airline, value: string) => {
        setAirlines(prev => {
            const updatedAirlines = [...prev];
            updatedAirlines[index] = { ...updatedAirlines[index], [field]: value };
            return updatedAirlines;
        });
        setErrors(prev => {
            if (!prev.airlines) return prev;
            const updatedErrors = [...prev.airlines];
            updatedErrors[index] = { ...updatedErrors[index], [field]: undefined };
            return { ...prev, airlines: updatedErrors };
        });
    }, []);

    const addAirline = useCallback(() => {
        setAirlines(prev => [...prev, { name: '', cost: '' }]);
    }, []);

    const removeAirline = useCallback((index: number) => {
        if (airlines.length > 1) {
            setAirlines(prev => prev.filter((_, i) => i !== index));
            setErrors(prev => {
                if (!prev.airlines) return prev;
                const updatedErrors = prev.airlines.filter((_, i) => i !== index);
                return { ...prev, airlines: updatedErrors };
            });
        }
    }, [airlines.length]);

    const validateForm = useCallback(() => {
        const newErrors: typeof errors = {};
        if (!agencyName.trim()) newErrors.agencyName = 'Travel agency name is required';
        if (!agencyExpense.trim()) newErrors.agencyExpense = 'Agency expense is required';
        else if (isNaN(Number(agencyExpense)) || Number(agencyExpense) <= 0) newErrors.agencyExpense = 'Expense must be a positive number';
        if (!totalExpense.trim()) newErrors.totalExpense = 'Total expense is required';
        else if (isNaN(Number(totalExpense)) || Number(totalExpense) <= 0) newErrors.totalExpense = 'Total expense must be a positive number';
        
        if (selectedFiles.length === 0) {
            newErrors.file = 'Please select at least one file to upload';
        } else {
            const oversizedFile = selectedFiles.find(file => file.size > 10 * 1024 * 1024);
            if (oversizedFile) {
                newErrors.file = `File "${oversizedFile.name}" must be less than 10MB`;
            }
        }

        if (transportationType === 'flight') {
            const airlineErrors = airlines.map((airline) => {
                const error: { name?: string; cost?: string } = {};
                if (!airline.name.trim()) error.name = 'Airline name is required';
                if (!airline.cost.trim()) error.cost = 'Cost is required';
                else if (isNaN(Number(airline.cost)) || Number(airline.cost) <= 0) error.cost = 'Cost must be a positive number';
                return error;
            });
            if (airlineErrors.some(error => Object.keys(error).length > 0)) newErrors.airlines = airlineErrors;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [agencyName, agencyExpense, totalExpense, selectedFiles, airlines, transportationType]);

    const uploadFileToCloudinary = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Cloudinary upload error response:", errorData);
                throw new Error(errorData.error?.message || `Cloudinary upload failed with status: ${response.status}`);
            }
            const data = await response.json();
            
            return data.secure_url || null;
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            setErrors(prev => ({ ...prev, file: `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }));
            return null;
        }
    };

    const handleClose = useCallback(() => {
        setAgencyName('');
        setAgencyExpense('');
        setTotalExpense('');
        setSelectedFiles([]);
        setAirlines([{ name: '', cost: '' }]);
        setErrors({});
        setIsSubmitting(false);
        onClose();
    }, [onClose]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        const uploadPromises = selectedFiles.map(file => uploadFileToCloudinary(file));
        const fileUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);

        if (fileUrls.length !== selectedFiles.length) {
            setIsSubmitting(false);
            return;
        }

        const formData: AirlineTicketData = {
            travelAgencyName: agencyName,
            agencyBookingCharge: Number(agencyExpense),
            totalExpense: Number(totalExpense),
            pdfFilePath: JSON.stringify(fileUrls),
            airlines: airlines.map(airline => ({
                name: airline.name,
                cost: Number(airline.cost)
            }))
        };

        onConfirm(formData);
        handleClose();

    }, [agencyName, agencyExpense, totalExpense, selectedFiles, airlines, validateForm, onConfirm, handleClose]);

    if (!isOpen) return null;

    // console.log(transportationType.toLowerCase());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Upload Travel Tickets</h2>
                    </div>
                    <button onClick={handleClose} disabled={isSubmitting} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Travel Agency Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Travel Agency Name <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="agencyName"
                                    value={agencyName}
                                    onChange={(e) => {
                                        setAgencyName(e.target.value);
                                        if (errors.agencyName) setErrors(prev => ({ ...prev, agencyName: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 ${errors.agencyName
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                    placeholder="Type agency name"
                                />
                                {errors.agencyName && <p className="mt-1 text-xs text-red-600">{errors.agencyName}</p>}
                            </div>
                            <div>
                                <label htmlFor="agencyExpense" className="block text-sm font-medium text-gray-700 mb-1">
                                    Agency Booking Charges <span className='text-red-500'>*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input type="text" id="agencyExpense" value={agencyExpense}
                                        onChange={(e) => { setAgencyExpense(e.target.value); if (errors.agencyExpense) setErrors(prev => ({ ...prev, agencyExpense: undefined })); }}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 ${errors.agencyExpense ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.agencyExpense && <p className="mt-1 text-xs text-red-600">{errors.agencyExpense}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Airlines Details */}
                    {transportationType.toLowerCase() === 'flight' && <div className="border border-gray-200 rounded-lg p-4 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Airlines Details <span className='text-red-500'>*</span></h3>
                            <button type="button" onClick={addAirline} className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <Plus size={14} className="mr-1" /> Add Airline
                            </button>
                        </div>
                        <div className="space-y-3 max-h-40 overflow-visible pr-1">
                            {airlines.map((airline, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded border">
                                    <div className="flex-1">
                                        <Autocomplete
                                            value={airline.name}
                                            onChange={(value) => handleAirlineChange(index, 'name', value)}
                                            options={airlineOptions}
                                            placeholder="Select or type airline name"
                                            error={errors.airlines?.[index]?.name}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs z-10">₹</span>
                                            <input type="text" placeholder="Cost" value={airline.cost}
                                                onChange={(e) => handleAirlineChange(index, 'cost', e.target.value)}
                                                className={`w-full pl-6 pr-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ${errors.airlines?.[index]?.cost ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                            />
                                        </div>
                                        {errors.airlines?.[index]?.cost && <p className="mt-1 text-xs text-red-600">{errors.airlines[index].cost}</p>}
                                    </div>
                                    {airlines.length > 1 && (
                                        <button type="button" onClick={() => removeAirline(index)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mt-1" aria-label="Remove airline">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    }

                    {/* Total Expense */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <label htmlFor="totalExpense" className="block text-sm font-medium text-gray-900 mb-2">
                            Total Expense <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">₹</span>
                            <input type="text" id="totalExpense" value={totalExpense}
                                onChange={(e) => { setTotalExpense(e.target.value); if (errors.totalExpense) setErrors(prev => ({ ...prev, totalExpense: undefined })); }}
                                className={`w-full pl-8 pr-4 py-2 border rounded-md text-lg font-normal focus:outline-none focus:ring-1 ${errors.totalExpense ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.totalExpense && <p className="mt-1 text-xs text-red-600">{errors.totalExpense}</p>}
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Attach Tickets <span className='text-red-500'>*</span></h3>
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            selectedFiles={selectedFiles}
                            showValidation={!!errors.file && selectedFiles.length === 0}
                        />
                        {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                    <button onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-70">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                        disabled={isSubmitting || !agencyName.trim() || !agencyExpense.trim() || !totalExpense.trim() || selectedFiles.length === 0 }
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UploadTicketsModal;