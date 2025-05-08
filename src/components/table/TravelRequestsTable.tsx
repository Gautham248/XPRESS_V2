import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown,
  Filter
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TravelRequest } from '../../data/mockData';

type Column = keyof TravelRequest | 'actions';

interface TravelRequestsTableProps {
  paginatedData: TravelRequest[];
  sortBy: keyof TravelRequest;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: keyof TravelRequest) => void;
  getSortIcon: (column: keyof TravelRequest) => JSX.Element;
  handleRowClick: (requestId: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

const TravelRequestsTable: React.FC<TravelRequestsTableProps> = ({
  paginatedData,
  sortBy,
  sortOrder,
  handleSort,
  getSortIcon,
  handleRowClick,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Column[]>([
    'id',
    'travelerName',
    'travelType',
    'departureDate',
    'returnDate',
    'destination',
    'status',
    'estimatedCost',
    'actions',
  ]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const allColumns: Column[] = [
    'id',
    'travelerName',
    'travelType',
    'departureDate',
    'returnDate',
    'destination',
    'status',
    'estimatedCost',
    'actions',
  ];

  const handleColumnToggle = (column: Column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  // Filter data by date range
  const filteredData = paginatedData.filter((request) => {
    if (!startDate || !endDate) return true;
    const departureDate = new Date(request.departureDate);
    return departureDate >= startDate && departureDate <= endDate;
  });

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Status Filter */}
        <div className="relative">
          <button
            className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Status: {statusFilter}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
          </button>
          {showStatusDropdown && (
            <div className="absolute z-10 right-0 mt-1 w-40 bg-card border rounded-md shadow-elevation-3">
              <div className="py-1">
                {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
                  <button
                    key={status}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50"
                    onClick={() => {
                      setStatusFilter(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button
            className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Type: {typeFilter}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
          </button>
          {showTypeDropdown && (
            <div className="absolute z-10 right-0 mt-1 w-40 bg-card border rounded-md shadow-elevation-3">
              <div className="py-1">
                {['All', 'Domestic', 'International'].map((type) => (
                  <button
                    key={type}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50"
                    onClick={() => {
                      setTypeFilter(type);
                      setShowTypeDropdown(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
            }}
            placeholderText="Select date range"
            className="px-3 py-2 bg-muted rounded-md text-sm w-64"
            isClearable
          />
        </div>

        {/* Column Visibility Filter */}
        <div className="relative">
          <button
            className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28"
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Columns</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
          </button>
          {showColumnsDropdown && (
            <div className="absolute z-10 right-0 mt-1 w-48 bg-card border rounded-md shadow-elevation-3">
              <div className="py-1">
                {allColumns.map((column) => (
                  <button
                    key={column}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center"
                    onClick={() => handleColumnToggle(column)}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    {column === 'actions' ? 'Actions' : column.charAt(0).toUpperCase() + column.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {visibleColumns.includes('id') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    <span>Request ID</span>
                    {getSortIcon('id')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('travelerName') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('travelerName')}
                >
                  <div className="flex items-center">
                    <span>Traveler</span>
                    {getSortIcon('travelerName')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('travelType') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('travelType')}
                >
                  <div className="flex items-center">
                    <span>Type</span>
                    {getSortIcon('travelType')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('departureDate') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('departureDate')}
                >
                  <div className="flex items-center">
                    <span>Departure</span>
                    {getSortIcon('departureDate')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('returnDate') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('returnDate')}
                >
                  <div className="flex items-center">
                    <span>Return</span>
                    {getSortIcon('returnDate')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('destination') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('destination')}
                >
                  <div className="flex items-center">
                    <span>Destination</span>
                    {getSortIcon('destination')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('status') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('estimatedCost') && (
                <th
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('estimatedCost')}
                >
                  <div className="flex items-center">
                    <span>Cost</span>
                    {getSortIcon('estimatedCost')}
                  </div>
                </th>
              )}
              {visibleColumns.includes('actions') && (
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((request, index) => (
              <tr
                key={index}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(request.id)}
              >
                {visibleColumns.includes('id') && (
                  <td className="py-3 px-4 font-medium">{request.id}</td>
                )}
                {visibleColumns.includes('travelerName') && (
                  <td className="py-3 px-4">{request.travelerName}</td>
                )}
                {visibleColumns.includes('travelType') && (
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.travelType === 'Domestic'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {request.travelType}
                    </span>
                  </td>
                )}
                {visibleColumns.includes('departureDate') && (
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{request.departureDate}</span>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('returnDate') && (
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{request.returnDate}</span>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('destination') && (
                  <td className="py-3 px-4">{request.destination}</td>
                )}
                {visibleColumns.includes('status') && (
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'Approved'
                          ? 'bg-success/20 text-success'
                          : request.status === 'Pending'
                            ? 'bg-warning/20 text-warning'
                            : request.status === 'Rejected'
                              ? 'bg-error/20 text-error'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                )}
                {visibleColumns.includes('estimatedCost') && (
                  <td className="py-3 px-4 font-medium">
                    ${request.estimatedCost.toLocaleString()}
                  </td>
                )}
                {visibleColumns.includes('actions') && (
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      className="text-sm text-primary hover:text-primary-light font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(request.id);
                      }}
                    >
                      View
                    </button>
                    {request.status === 'Pending' && (
                      <>
                        <button
                          className="text-sm text-success hover:text-success/80 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle approve action
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="text-sm text-error hover:text-error/80 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle reject action
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No travel requests found.</p>
        </div>
      )}
    </div>
  );
};

export default TravelRequestsTable;