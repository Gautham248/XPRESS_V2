interface ViewToggleProps {
  view: 'Month' | 'Week';
  onViewChange: (newView: 'Month' | 'Week') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex space-x-2">
      <button
        className={`px-4 py-2 rounded-md ${view === 'Month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        onClick={() => onViewChange('Month')}
      >
        Month
      </button>
      <button
        className={`px-4 py-2 rounded-md ${view === 'Week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        onClick={() => onViewChange('Week')}
      >
        Week
      </button>
    </div>
  );
};

export default ViewToggle;