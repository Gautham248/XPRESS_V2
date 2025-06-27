// src/components/DocumentForm.tsx

import React, { useState, useEffect } from 'react'; // Import useEffect
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { DocumentType, FormState, Action, FormField, formConfigMap } from './types';

interface DocumentFormProps {
  docType: DocumentType;
  formState: FormState;
  dispatch: React.Dispatch<Action>;
  onSave: (formData: FormState, docType: DocumentType) => Promise<void>;
  isSaving: boolean;
  isReadyToSubmit: boolean;
  toast: typeof toast;
}

function DocumentForm({ docType, formState, dispatch, onSave, isSaving, isReadyToSubmit, toast }: DocumentFormProps) {
  const fields = formConfigMap[docType];
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // --- FIX: Add this useEffect hook ---
  // This effect will run whenever the docType prop changes (i.e., when the tab switches).
  // It clears any existing validation errors from the previous tab.
  useEffect(() => {
    setValidationErrors({});
  }, [docType]);
  // --- END FIX ---

  const handleChange = (field: keyof FormState, value: string | Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', docType, field, value });

    if (validationErrors[field]) {
      setValidationErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToSubmit || isSaving) {
      console.error("Form submitted when not ready or while saving.");
      return;
    }

    const errors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.validationRegex) {
        const value = formState[field.key];
        if (typeof value === 'string' && value && !field.validationRegex.test(value)) {
          errors[field.key] = field.validationMessage || `Invalid format for ${field.label}.`;
        }
      }
      if (field.required && !formState[field.key]) {
        errors[field.key] = `${field.label} is required.`;
      }
    });

    // Validation logic for expiry date
    const expiryDateValue = formState.expiryDate;
    if (expiryDateValue && expiryDateValue instanceof Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        if (expiryDateValue < today) {
            errors.expiryDate = 'Expiry date cannot be in the past.';
        }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (errors.expiryDate === 'Expiry date cannot be in the past.') {
          toast.error('This document is expired and cannot be uploaded.');
      }
      return;
    }

    setValidationErrors({});
    await onSave(formState, docType);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field: FormField) => {
          const fieldValue = formState[field.key];
          const fieldError = validationErrors[field.key];

          return (
            <div key={field.key} className="flex flex-col">
              <label htmlFor={`${docType}-${field.key}`} className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'date' ? (
                <DatePicker
                  id={`${docType}-${field.key}`}
                  selected={fieldValue instanceof Date ? fieldValue : null}
                  onChange={(date: Date | null) => handleChange(field.key, date)}
                  className={`block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                    fieldError ? 'ring-2 ring-red-500' : 'focus:ring-blue-600'
                  }`}
                  dateFormat="dd/MM/yyyy"
                  required={field.required}
                  disabled={isSaving}
                  autoComplete="off"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              ) : (
                <input
                  id={`${docType}-${field.key}`}
                  type={field.type}
                  className={`block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                    fieldError ? 'ring-2 ring-red-500' : 'focus:ring-blue-600'
                  }`}
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={isSaving}
                />
              )}
              {fieldError && (
                <p className="text-red-600 text-xs mt-1">{fieldError}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={!isReadyToSubmit || isSaving} className={`
          flex justify-center items-center py-2 px-4
          border border-transparent rounded-md shadow-sm
          text-sm font-medium text-white
          bg-indigo-600 hover:bg-indigo-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}>
          {isSaving ? 'Saving...' : 'Save Document Information'}
        </button>
      </div>
    </form>
  );
}

export default DocumentForm;