import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle,
  Download,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface Header {
  key: string;
  displayName: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  headers: Header[];
  data: T[];
  title: string;
  searchableFields?: string[];
  statusOptions?: string[];
  typeOptions?: string[];
  dateFilterKey?: string;
  newButtonLabel?: string;
  newButtonPath?: string;
  getStatusColor?: (status: string) => string;
  getTypeColor?: (type: string) => string;
  renderActions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends Record<string, any>>({
  headers,
  data,
  title,
  searchableFields = [],
  statusOptions = [],
  typeOptions = [],
  dateFilterKey,
  newButtonLabel,
  newButtonPath,
  getStatusColor,
  getTypeColor,
  renderActions,
  onRowClick,
}: DataTableProps<T>) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>(headers[0]?.key || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const savedColumns = localStorage.getItem(`${title}TableColumns`);
    return savedColumns ? JSON.parse(savedColumns) : headers.map(h => h.key).concat(renderActions ? ['actions'] : []);
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Refs for dropdown outside click detection
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const columnsDropdownRef = useRef<HTMLDivElement>(null);

  // Persist visibleColumns to localStorage
  useEffect(() => {
    localStorage.setItem(`${title}TableColumns`, JSON.stringify(visibleColumns));
  }, [visibleColumns, title]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColumnToggle = (column: string) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           selectedStatuses.length > 0 || 
           typeFilter !== 'All' || 
           startDate !== null || 
           endDate !== null;
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setTypeFilter('All');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = searchableFields.length === 0 || searchableFields.some(field => 
      String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusOptions.length === 0 || selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesType = typeOptions.length === 0 || typeFilter === 'All' || item.travelType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter by date range
  const dateFilteredData = filteredData.filter(item => {
    if (!dateFilterKey || (!startDate && !endDate)) return true;
    const dateValue = new Date(item[dateFilterKey]);
    
    if (startDate && endDate) {
      return dateValue >= startDate && dateValue <= endDate;
    } else if (startDate) {
      return dateValue >= startDate;
    } else if (endDate) {
      return dateValue <= endDate;
    }
    return true;
  });

  // Sort data
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

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronDown className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4 transform rotate-180" />;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd-MM-yyyy');
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export - only include visible columns
    const exportData = sortedData.map(item => {
      const exportItem: any = {};
      headers.forEach(header => {
        if (visibleColumns.includes(header.key)) {
          if (header.key === 'travelDates' && item.departureDate && item.returnDate) {
            exportItem[header.displayName] = `${formatDate(item.departureDate)} - ${formatDate(item.returnDate)}`;
          } else {
            exportItem[header.displayName] = item[header.key];
          }
        }
      });
      return exportItem;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key] || '').length))
    }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${title.replace(/\s+/g, '_')}_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {newButtonLabel && newButtonPath && (
          <button 
            className="btn-primary flex items-center"
            onClick={() => navigate(newButtonPath)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {newButtonLabel}
          </button>
        )}
      </div>
      
      <div className="card max-w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder={`Search by ${searchableFields.map(f => f).join(', ') || 'fields'}...`}
              className="pl-10 pr-4 py-2 w-full rounded-md bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {statusOptions.length > 0 && (
              <div className="relative" ref={statusDropdownRef}>
                <button 
                  className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Status: {selectedStatuses.length > 0 ? selectedStatuses.join(', ') : 'None'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute z-10 right-0 mt-1 w-48 bg-card border rounded-md shadow-elevation-3">
                    <div className="py-1">
                      {statusOptions.map(status => (
                        <label
                          key={status}
                          className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={() => {
                              if (selectedStatuses.includes(status)) {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                              } else {
                                setSelectedStatuses([...selectedStatuses, status]);
                              }
                            }}
                            className="mr-2"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {typeOptions.length > 0 && (
              <div className="relative" ref={typeDropdownRef}>
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
                      {['All', ...typeOptions].map(type => (
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
            )}
            
            <button 
              className="flex items-center justify-center p-2 bg-muted rounded-md hover:bg-muted/70 transition-colors"
              onClick={exportToExcel}
              title="Export to Excel"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {dateFilterKey && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  placeholderText="Start date"
                  className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </div>
              <span className="text-sm text-gray-500">to</span>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  placeholderText="End date"
                  className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                  minDate={startDate}
                  isClearable
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="relative" ref={columnsDropdownRef}>
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
                  {headers.map(header => (
                    <button
                      key={header.key}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center"
                      onClick={() => handleColumnToggle(header.key)}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(header.key)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      {header.displayName}
                    </button>
                  ))}
                  {renderActions && (
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center"
                      onClick={() => handleColumnToggle('actions')}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('actions')}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      Actions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clear All Filters Button */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto w-full border border-gray-200 rounded-md">
          <table className="w-full min-w-full table-auto">
            <thead>
              <tr className="border-b">
                {headers.map(header => visibleColumns.includes(header.key) && (
                  <th 
                    key={header.key}
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => header.sortable !== false && handleSort(header.key)}
                  >
                    <div className="flex items-center">
                      <span>{header.displayName}</span>
                      {header.sortable !== false && getSortIcon(header.key)}
                    </div>
                  </th>
                ))}
                {renderActions && visibleColumns.includes('actions') && (
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr 
                  key={index}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(item)}
                >
                  {headers.map(header => visibleColumns.includes(header.key) && (
                    <td key={header.key} className="py-3 px-4 whitespace-nowrap">
                      {header.key === 'travelDates' && item.departureDate && item.returnDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {formatDate(item.departureDate)} - {formatDate(item.returnDate)}
                          </span>
                        </div>
                      ) : header.key === 'status' && getStatusColor ? (
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item[header.key])}`}
                        >
                          {item[header.key]}
                        </span>
                      ) : header.key === 'travelType' && getTypeColor ? (
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item[header.key])}`}
                        >
                          {item[header.key]}
                        </span>
                      ) : (
                        item[header.key]
                      )}
                    </td>
                  ))}
                  {renderActions && visibleColumns.includes('actions') && (
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedData.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No data found.</p>
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

export default DataTable;