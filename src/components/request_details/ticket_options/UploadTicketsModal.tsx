import React, { useState, useCallback, memo } from 'react';
import { X, Plus, Plane, Trash2 } from 'lucide-react';
import FileUploader from '../../document/FileUploader';
 
export interface Airline {
    name: string;
    cost: string;
}
 
interface UploadTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (agencyName: string, agencyExpense: string, totalExpense: string, file: File | null, airlines: Airline[]) => void;
}
 
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
    const [dragActive, setDragActive] = useState<boolean>(false);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Upload Tickets</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
 
                {/* Scrollable Body */}
                <div className="overflow-y-auto p-8 space-y-8 flex-1">
                    {/* Travel Agency Section */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Agency Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="agencyName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Agency Name *
                                </label>
                                <input
                                    type="text"
                                    id="agencyName"
                                    value={agencyName}
                                    onChange={(e) => {
                                        setAgencyName(e.target.value);
                                        if (errors.agencyName) {
                                            setErrors(prev => ({ ...prev, agencyName: undefined }));
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.agencyName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="Enter travel agency name"
                                />
                                {errors.agencyName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.agencyName}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="agencyExpense" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Agency Expense *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
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
                                        className={`w-full pl-8 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                            errors.agencyExpense ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.agencyExpense && (
                                    <p className="mt-2 text-sm text-red-600">{errors.agencyExpense}</p>
                                )}
                            </div>
                        </div>
                    </div>
 
                    {/* Airline Information */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Airline Information</h3>
                            <button
                                type="button"
                                onClick={addAirline}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Airline
                            </button>
                        </div>
                       
                        <div className="space-y-6">
                            {airlines.map((airline, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-medium text-gray-700">Airline #{index + 1}</h4>
                                        {airlines.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAirline(index)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                aria-label="Remove airline"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`airlineName-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                                                Airline Name *
                                            </label>
                                            <input
                                                type="text"
                                                id={`airlineName-${index}`}
                                                value={airline.name}
                                                onChange={(e) => handleAirlineChange(index, 'name', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.airlines?.[index]?.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="e.g., Air India, IndiGo"
                                            />
                                            {errors.airlines?.[index]?.name && (
                                                <p className="mt-2 text-sm text-red-600">{errors.airlines[index].name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor={`airlineCost-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                                                Cost *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                                <input
                                                    type="text"
                                                    id={`airlineCost-${index}`}
                                                    value={airline.cost}
                                                    onChange={(e) => handleAirlineChange(index, 'cost', e.target.value)}
                                                    className={`w-full pl-8 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                                        errors.airlines?.[index]?.cost ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.airlines?.[index]?.cost && (
                                                <p className="mt-2 text-sm text-red-600">{errors.airlines[index].cost}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
 
                    {/* Total Expense */}
                    <div className="bg-green-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Expense</h3>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">₹</span>
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
                                className={`w-full pl-8 pr-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg font-semibold ${
                                    errors.totalExpense ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.totalExpense && (
                            <p className="mt-2 text-sm text-red-600">{errors.totalExpense}</p>
                        )}
                    </div>
 
                    {/* File Upload Area */}
                    <div className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            showValidation={!!errors.file}
                            selectedFile={selectedFile}
                        />
                        {errors.file && (
                            <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                        )}
                    </div>
                </div>
 
                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-8 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!agencyName.trim() || !agencyExpense.trim() || !totalExpense.trim() || !selectedFile || airlines.some(airline => !airline.name.trim() || !airline.cost.trim())}
                        className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Upload Tickets
                    </button>
                </div>
            </div>
        </div>
    );
});
 
export default UploadTicketsModal;