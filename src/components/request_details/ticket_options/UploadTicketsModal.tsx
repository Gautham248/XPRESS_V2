import React, { useState, useCallback, memo } from 'react';
import { X, Plus, Plane } from 'lucide-react';
import FileUploader from '../../document/FileUploader';
import Autocomplete from './Autocomplete';

export interface Airline {
    name: string;
    cost: string;
}

interface UploadTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (agencyName: string, agencyExpense: string, totalExpense: string, file: File | null, airlines: Airline[]) => void;
}

// Sample data - replace with your actual data source
const TRAVEL_AGENCIES = [
    'MakeMyTrip',
    'Goibibo',
    'Cleartrip',
    'Yatra',
    'Booking.com',
    'Expedia',
    'Thomas Cook',
    'Cox & Kings',
    'SOTC Travel',
    'Kesari Tours'
];

const AIRLINE_NAMES = [
    'IndiGo',
    'Air India',
    'SpiceJet',
    'Vistara',
    'GoAir',
    'AirAsia India',
    'Emirates',
    'Qatar Airways',
    'Singapore Airlines',
    'Lufthansa',
    'British Airways',
    'Thai Airways',
    'Etihad Airways',
    'Turkish Airlines',
    'Malaysia Airlines'
];

const UploadTicketsModal: React.FC<UploadTicketsModalProps> = memo(({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [agencyName, setAgencyName] = useState<string>('');
    const [agencyExpense, setAgencyExpense] = useState<string>('');
    const [totalExpense, setTotalExpense] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [airlines, setAirlines] = useState<Airline[]>([{ name: '', cost: '' }]);
    const [, setDragActive] = useState<boolean>(false);
    const [errors, setErrors] = useState<{
        agencyName?: string;
        agencyExpense?: string;
        totalExpense?: string;
        file?: string;
        airlines?: { name?: string; cost?: string }[];
    }>({});

    const handleFileSelect = useCallback((file: File | null) => {
        setSelectedFile(file);
        if (file) {
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

        if (!agencyName.trim()) {
            newErrors.agencyName = 'Travel agency name is required';
        }

        if (!agencyExpense.trim()) {
            newErrors.agencyExpense = 'Agency expense is required';
        } else if (isNaN(Number(agencyExpense)) || Number(agencyExpense) <= 0) {
            newErrors.agencyExpense = 'Expense must be a positive number';
        }

        if (!totalExpense.trim()) {
            newErrors.totalExpense = 'Total expense is required';
        } else if (isNaN(Number(totalExpense)) || Number(totalExpense) <= 0) {
            newErrors.totalExpense = 'Total expense must be a positive number';
        }

        if (!selectedFile) {
            newErrors.file = 'Please select a file to upload';
        } else if (selectedFile.size > 10 * 1024 * 1024) {
            newErrors.file = 'File size must be less than 10MB';
        }

        const airlineErrors = airlines.map((airline) => {
            const error: { name?: string; cost?: string } = {};
            if (!airline.name.trim()) {
                error.name = 'Airline name is required';
            }
            if (!airline.cost.trim()) {
                error.cost = 'Cost is required';
            } else if (isNaN(Number(airline.cost)) || Number(airline.cost) <= 0) {
                error.cost = 'Cost must be a positive number';
            }
            return error;
        });

        if (airlineErrors.some(error => Object.keys(error).length > 0)) {
            newErrors.airlines = airlineErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [agencyName, agencyExpense, totalExpense, selectedFile, airlines]);

    const handleSubmit = useCallback(() => {
        if (validateForm()) {
            onConfirm(agencyName, agencyExpense, totalExpense, selectedFile, airlines);
            handleClose();
        }
    }, [agencyName, agencyExpense, totalExpense, selectedFile, airlines, validateForm, onConfirm]);

    const handleClose = useCallback(() => {
        setAgencyName('');
        setAgencyExpense('');
        setTotalExpense('');
        setSelectedFile(null);
        setAirlines([{ name: '', cost: '' }]);
        setErrors({});
        setDragActive(false);
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Upload Travel Tickets</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Travel Agency Details Row */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Travel Agency Name <span className='text-red-500'>*</span>
                                </label>
                                <Autocomplete
                                    value={agencyName}
                                    onChange={(value) => {
                                        setAgencyName(value);
                                        if (errors.agencyName) {
                                            setErrors(prev => ({ ...prev, agencyName: undefined }));
                                        }
                                    }}
                                    options={TRAVEL_AGENCIES}
                                    placeholder="Select or type agency name"
                                    error={errors.agencyName}
                                />
                            </div>
                            <div>
                                <label htmlFor="agencyExpense" className="block text-sm font-medium text-gray-700 mb-1">
                                    Travel Agency Expense <span className='text-red-500'>*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input
                                        type="text"
                                        id="agencyExpense"
                                        value={agencyExpense}
                                        onChange={(e) => {
                                            setAgencyExpense(e.target.value);
                                            if (errors.agencyExpense) {
                                                setErrors(prev => ({ ...prev, agencyExpense: undefined }));
                                            }
                                        }}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.agencyExpense ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.agencyExpense && (
                                    <p className="mt-1 text-xs text-red-600">{errors.agencyExpense}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Airlines Details Section */}
                    <div className="border border-gray-200 rounded-lg p-4 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Airlines Details <span className='text-red-500'>*</span></h3>
                            <button
                                type="button"
                                onClick={addAirline}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <Plus size={14} className="mr-1" />
                                Add Airline
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-40 overflow-visible">
                            {airlines.map((airline, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                    <div className="flex-1">
                                        <Autocomplete
                                            value={airline.name}
                                            onChange={(value) => handleAirlineChange(index, 'name', value)}
                                            options={AIRLINE_NAMES}
                                            placeholder="Select or type airline name"
                                            error={errors.airlines?.[index]?.name}
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs z-10">₹</span>
                                        <input
                                            type="text"
                                            placeholder="Cost"
                                            value={airline.cost}
                                            onChange={(e) => handleAirlineChange(index, 'cost', e.target.value)}
                                            className={`w-full pl-6 pr-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.airlines?.[index]?.cost ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.airlines?.[index]?.cost && (
                                            <p className="mt-1 text-xs text-red-600">{errors.airlines[index].cost}</p>
                                        )}
                                    </div>
                                    {airlines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAirline(index)}
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                            aria-label="Remove airline"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Expense Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <label htmlFor="totalExpense" className="block text-sm font-medium text-gray-900 mb-2">
                            Total Expense
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">₹</span>
                            <input
                                type="text"
                                id="totalExpense"
                                value={totalExpense}
                                onChange={(e) => {
                                    setTotalExpense(e.target.value);
                                    if (errors.totalExpense) {
                                        setErrors(prev => ({ ...prev, totalExpense: undefined }));
                                    }
                                }}
                                className={`w-full pl-8 pr-4 py-2 border rounded-md text-lg font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.totalExpense ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.totalExpense && (
                            <p className="mt-1 text-xs text-red-600">{errors.totalExpense}</p>
                        )}
                    </div>

                    {/* File Upload Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Attach Ticket</h3>
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            showValidation={!!errors.file}
                            selectedFile={selectedFile}
                        />
                        {errors.file && (
                            <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!agencyName.trim() || !agencyExpense.trim() || !totalExpense.trim() || !selectedFile || airlines.some(airline => !airline.name.trim() || !airline.cost.trim())}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UploadTicketsModal;