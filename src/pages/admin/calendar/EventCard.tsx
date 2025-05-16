interface EventCardProps {
  type: 'Departure' | 'Return';
  count: number;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ type, count, onClick }) => {
  return (
    <div
      className={`bg-${type === 'Departure' ? 'blue' : 'green'}-50 border-l-4 border-${type === 'Departure' ? 'blue' : 'green'}-500 py-1 pl-0.5 rounded-md text-sm cursor-pointer hover:bg-${type === 'Departure' ? 'blue' : 'green'}-100 transition-colors duration-200`}
      onClick={onClick}
    >
      <div className={`text-${type === 'Departure' ? 'blue' : 'green'}-700 font-medium text-xs`}>
        {type === 'Departure' ? 'Departures' : 'Returns'}
      </div>
      <div className="text-gray-600">{count}</div>
    </div>
  );
};

export default EventCard;