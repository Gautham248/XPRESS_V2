import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle,
  Download,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Calendar,
  Filter
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { mockTravelRequests, TravelRequest, getStatusColor } from '../../data/mockData';

type Column = keyof TravelRequest | 'travelDates' | 'actions';

const TravelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof TravelRequest>('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Table-specific states
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem('travelRequestsTableColumns');
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          'id',
          'travelerName',
          'projectCode',
          'travelType',
          'source',
          'travelDates',
          'destination',
          'departmentCode',
          'reportingManager',
          'status',
          'actions',
        ];
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const allColumns: Column[] = [
    'id',
    'travelerName',
    'projectCode',
    'travelType',
    'source',
    'travelDates',
    'destination',
    'departmentCode',
    'reportingManager',
    'status',
    'actions',
  ];

  // Persist visibleColumns to localStorage
  useEffect(() => {
    localStorage.setItem('travelRequestsTableColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const handleColumnToggle = (column: Column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  // Filter the data (search, status, type)
  const filteredData = mockTravelRequests.filter(request => {
    const matchesSearch = 
      request.travelerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.source.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    const matchesType = typeFilter === 'All' || request.travelType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter data by date range
  const dateFilteredData = filteredData.filter((request) => {
    if (!startDate || !endDate) return true;
    const departureDate = new Date(request.departureDate);
    return departureDate >= startDate && departureDate <= endDate;
  });

  // Sort the data
  const sortedData = [...dateFilteredData].sort((a, b) => {
    const aSortValue = a[sortBy];
    const bSortValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      if (typeof aSortValue === 'string' && typeof bSortValue === 'string') {
        return aSortValue.localeCompare(bSortValue);
      }
      return Number(aSortValue) - Number(bSortValue);
    } else {
      if (typeof aSortValue === 'string' && typeof bSortValue === 'string') {
        return bSortValue.localeCompare(aSortValue);
      }
      return Number(bSortValue) - Number(aSortValue);
    }
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  
  const handleSort = (column: keyof TravelRequest) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  const getSortIcon = (column: keyof TravelRequest) => {
    if (sortBy !== column) {
      return <ChevronDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronDown className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4 transform rotate-180" />;
  };

  const handleRowClick = (requestId: string) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user) return;

    const path = window.location.pathname;
    let basePath = '';
    
    if (user.role === 'admin') {
      basePath = '/admin/travel-requests';
    } else if (user.role === 'manager') {
      basePath = path.includes('team-requests') ? '/manager/team-requests' : '/manager/my-requests';
    } else if (user.role === 'employee') {
      basePath = '/employee/my-requests';
    }
    
    navigate(`${basePath}/${requestId}`);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd-MM-yyyy');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Requests</h2>
        <button className="btn-primary flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>
      
      <div className="card max-w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by traveler, destination, ID, project code, or source..."
              className="pl-10 pr-4 py-2 w-full rounded-md bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
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
                    {[
                      'All',
                      'Pending',
                      'Approved',
                      'Rejected',
                      'Completed',
                      'Manager Approved',
                      'Tickets Dispatched',
                      'Tickets Selected',
                      'DU Head Approved',
                      'In-transit',
                      'Returned',
                      'Closed',
                    ].map((status) => (
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
            
            <button className="flex items-center justify-center p-2 bg-muted rounded-md">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                setDateRange(update);
              }}
              placeholderText="Select date range"
              className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
              isClearable
            />
          </div>

          <div className="relative">
            <button
              className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 rounded-md min-w-[120px] text-sm hover:bg-gray-200 transition-colors"
              onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
            >
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>Columns</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-1.5 text-gray-500" />
            </button>
            {showColumnsDropdown && (
              <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  {allColumns.map((column) => (
                    <button
                      key={column}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center"
                      onClick={() => handleColumnToggle(column)}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      {column === 'actions'
                        ? 'Actions'
                        : column === 'travelDates'
                          ? 'Travel Dates'
                          : column === 'travelerName'
                            ? 'Traveler'
                            : column === 'departmentCode'
                              ? 'Department'
                              : column === 'reportingManager'
                                ? 'Manager'
                                : column.charAt(0).toUpperCase() + column.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-w-[1000px] border border-gray-200 rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {visibleColumns.includes('id') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
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
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('travelerName')}
                  >
                    <div className="flex items-center">
                      <span>Traveler</span>
                      {getSortIcon('travelerName')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('projectCode') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('projectCode')}
                  >
                    <div className="flex items-center">
                      <span>Project Code</span>
                      {getSortIcon('projectCode')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('travelType') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('travelType')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {getSortIcon('travelType')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('source') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('source')}
                  >
                    <div className="flex items-center">
                      <span>Source</span>
                      {getSortIcon('source')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('travelDates') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('departureDate')}
                  >
                    <div className="flex items-center">
                      <span>Travel Dates</span>
                      {getSortIcon('departureDate')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('destination') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('destination')}
                  >
                    <div className="flex items-center">
                      <span>Destination</span>
                      {getSortIcon('destination')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('departmentCode') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('departmentCode')}
                  >
                    <div className="flex items-center">
                      <span>Department</span>
                      {getSortIcon('departmentCode')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('reportingManager') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('reportingManager')}
                  >
                    <div className="flex items-center">
                      <span>Manager</span>
                      {getSortIcon('reportingManager')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('status') && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('actions') && (
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((request) => (
                <tr 
                  key={request.id} 
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(request.id)}
                >
                  {visibleColumns.includes('id') && (
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      {request.id}
                    </td>
                  )}
                  {visibleColumns.includes('travelerName') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.travelerName}
                    </td>
                  )}
                  {visibleColumns.includes('projectCode') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.projectCode}
                    </td>
                  )}
                  {visibleColumns.includes('travelType') && (
                    <td className="py-3 px-4 whitespace-nowrap">
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
                  {visibleColumns.includes('source') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.source}
                    </td>
                  )}
                  {visibleColumns.includes('travelDates') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>
                          {formatDate(request.departureDate)} - {formatDate(request.returnDate)}
                        </span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('destination') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.destination}
                    </td>
                  )}
                  {visibleColumns.includes('departmentCode') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.departmentCode}
                    </td>
                  )}
                  {visibleColumns.includes('reportingManager') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      {request.reportingManager}
                    </td>
                  )}
                  {visibleColumns.includes('status') && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('actions') && (
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
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
                            }}
                          >
                            Approve
                          </button>
                          <button 
                            className="text-sm text-error hover:text-error/80 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
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
        
        {paginatedData.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No travel requests found.</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button 
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum 
                        ? 'bg-primary text-white' 
                        : 'bg-muted hover:bg-muted/70'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select 
              className="bg-muted rounded-md border-input px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelRequests;