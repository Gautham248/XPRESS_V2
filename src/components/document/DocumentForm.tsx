// DocumentForm.tsx
import React, { useState } from 'react'; // Added useState for isSaving
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  DocumentType,
  FormState,
  Action,
  FormField,
  formConfigMap,
} from './types'; // Assuming types.ts is in the same directory
import axios from 'axios'; // For potential direct PUT, or parent handles it

interface DocumentFormProps {
  docType: DocumentType;
  formState: FormState;
  dispatch: React.Dispatch<Action>;
  recordId: number | null; // ID of the record to update
  onSave: (formData: FormState, recordId: number, docType: DocumentType) => Promise<void>; // Callback to parent for saving
}

function DocumentForm({ docType, formState, dispatch, recordId, onSave }: DocumentFormProps) {
  const fields = formConfigMap[docType];
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);


  const handleChange = (field: string, value: string | Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', docType, field, value });
    setSaveError(null); // Clear error on field change
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordId) {
      setSaveError("Cannot save details: No document record linked. Please upload the document first.");
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(formState, recordId, docType);
      // Success message might be handled by parent, or show a temporary one here
      // dispatch({ type: 'RESET_FORM', docType }); // Parent might do this
    } catch (error: any) {
      console.error("Error saving document details:", error);
      setSaveError(error.message || "Failed to save details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field: FormField) => {
          const fieldValue = formState[field.key];
          return (
            <div key={field.key} className="flex flex-col space-y-1">
              <label htmlFor={`${docType}-${field.key}`} className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'select' && 'options' in field && field.options ? (
                <select
                  id={`${docType}-${field.key}`}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={isSaving}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <DatePicker
                  id={`${docType}-${field.key}`}
                  selected={fieldValue instanceof Date ? fieldValue : (typeof fieldValue === 'string' ? new Date(fieldValue) : null) }
                  onChange={(date) => handleChange(field.key, date)}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  dateFormat="dd/MM/yyyy"
                  maxDate={field.maxDate}
                  minDate={field.minDate}
                  required={field.required}
                  disabled={isSaving}
                  autoComplete="off"
                />
              ) : (
                <input
                  id={`${docType}-${field.key}`}
                  type={field.type}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : (typeof fieldValue === 'number' ? String(fieldValue) : '')}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={isSaving}
                />
              )}
            </div>
          );
        })}
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{saveError}</span>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!recordId || isSaving}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
            !recordId || isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md hover:shadow-lg'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Document Information</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default DocumentForm;