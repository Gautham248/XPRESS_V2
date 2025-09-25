import React, { useEffect, useState } from 'react';
 
export interface ButtonConfig {
  text: string;
  bgColor: string;
  textColor?: string;
  onClick: () => void;
  isLoading?: boolean;
}
 
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string | React.ReactNode;
  buttons: ButtonConfig[];
}
 
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  buttons,
}) => {
  const [show, setShow] = useState(false);
 
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
 
  if (!isOpen && !show) return null;
 
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
 
        {/* Title */}
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        )}
 
        {/* Content */}
        <div className="mb-6 text-gray-600">{content}</div>
 
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              disabled={button.isLoading}
              className={`px-4 py-2 rounded-md  font-medium ${button.bgColor} ${button.textColor || 'text-white'} hover:opacity-90 transition-opacity flex items-center justify-center min-w-[80px] ${
                button.isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {button.isLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                    className="animate-spin"
                  />
                </svg>
              ) : (
                button.text
              )}
            </button>
          ))}
</div>
      </div>
    </div>
  );
};
 
export default ConfirmationModal;