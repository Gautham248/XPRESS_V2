// src/components/DocumentForm.tsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DocumentType, FormState, Action, FormField, formConfigMap } from './types';

interface DocumentFormProps {
  docType: DocumentType;
  formState: FormState;
  dispatch: React.Dispatch<Action>;
  recordId: number | null;
  onSave: (formData: FormState, recordId: number, docType: DocumentType) => Promise<void>;
}

function DocumentForm({ docType, formState, dispatch, recordId, onSave }: DocumentFormProps) {
  const fields = formConfigMap[docType];
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string | Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', docType, field, value });
    setSaveError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordId) {
      setSaveError("Cannot save: No document record linked. Please upload first.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(formState, recordId, docType);
    } catch (error: any) {
      setSaveError(error.message || "Failed to save details.");
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
              {field.type === 'date' ? (
                <DatePicker
                  id={`${docType}-${field.key}`}
                  selected={fieldValue instanceof Date ? fieldValue : null}
                  onChange={(date: Date | null) => handleChange(field.key, date)}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={isSaving}
                />
              )}
            </div>
          );
        })}
      </div>

      {saveError && ( <div className="text-red-600 text-sm mt-2">{saveError}</div> )}

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={!recordId || isSaving} className={`
    flex justify-center items-center
    py-2 px-4 
    border border-transparent rounded-md shadow-sm 
    text-sm font-medium text-white 
    bg-indigo-600 
    hover:bg-indigo-700 
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