// src/components/CommentsModal.tsx (or similar path)

import React from 'react';
import { X, MessageSquare } from 'lucide-react';

interface Comment {
  employeeName: string;
  commentText: string;
  timestamp: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, comments }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Request Comments</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm text-gray-900">{comment.employeeName}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                  </div>
                  <p className="text-gray-700 mt-1">{comment.commentText}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No comments have been added to this request.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;