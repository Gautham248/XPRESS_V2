import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  DocumentType,
  FormState,
  Action,
  FormField,
  formConfigMap,
} from './types';

interface DocumentFormProps {
  docType: DocumentType;
  formState: FormState;
  dispatch: React.Dispatch<Action>;
}

function DocumentForm({ docType, formState, dispatch }: DocumentFormProps) {
  const fields = formConfigMap[docType];

  const handleChange = (field: string, value: string | Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', docType, field, value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field: FormField) => {
          const fieldValue = formState[field.key];

          return (
            <div key={field.key} className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'select' && 'options' in field && field.options ? (
                <select
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                >
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <DatePicker
                  selected={fieldValue instanceof Date || fieldValue === null ? fieldValue : null}
                  onChange={(date) => handleChange(field.key, date)}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  dateFormat="dd/MM/yyyy"
                  maxDate={field.maxDate}
                  minDate={field.minDate}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DocumentForm;