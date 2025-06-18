import React from 'react';
import { 
  Check, 
  Clock, 
  X 
} from 'lucide-react';
import { TimelineStep } from './types';


interface TimelineModalProps {
  timeline: TimelineStep[];
  onClose: () => void;
}

const TimelineModal: React.FC<TimelineModalProps> = ({ timeline, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Request Closure Timeline</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {timeline.map((step, index) => (
            <div key={step.id} className="flex items-start relative">
              {/* Connector Line */}
              {index < timeline.length - 1 && (
                <div
                  className={`absolute left-[1rem] top-[2rem] w-0.5 h-[calc(100%-1rem)] ${
                    step.rejected
                      ? 'bg-red-200'
                      : step.completed || step.isModified
                      ? 'bg-green-200'
                      : 'bg-gray-200'
                  }`}
                />
              )}
              {/* Circle Indicator */}
              <div
                className={`mr-4 flex flex-col items-center w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.rejected
                    ? 'bg-red-100 text-red-600'
                    : step.active
                    ? 'bg-purple-100 text-purple-500'
                    : step.completed || step.isModified
                    ? 'bg-green-100 text-green-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.rejected ? (
                  <X className="h-4 w-4" />
                ) : step.active ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
              {/* Status and Description */}
              <div>
                <p
                  className={`font-medium ${
                    step.rejected
                      ? 'text-red-600'
                      : step.active
                      ? 'text-purple-600'
                      : step.completed || step.isModified
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.status}
                </p>
                <p
                  className={`text-sm ${
                    step.rejected
                      ? 'text-red-500'
                      : step.active
                      ? 'text-purple-500'
                      : step.completed || step.isModified
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {step.date}
                </p>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;