import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  filterable?: boolean;
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
  getTripTypeColor?: (tripType: string) => string;
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
  getTripTypeColor,
  renderActions,
  onRowClick,
}: DataTableProps<T>) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  
  // ADDED: New state to track if the SLA breach filter is active
  const [isSlaBreachedFilter, setIsSlaBreachedFilter] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const savedColumns = localStorage.getItem(`${title}TableColumns`);
    const defaultCols = headers.map(h => h.key);
    if (renderActions) defaultCols.push('actions');
    return savedColumns ? JSON.parse(savedColumns) : defaultCols;
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [activeColumnFilterKey, setActiveColumnFilterKey] = useState<string | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const columnsDropdownRef = useRef<HTMLDivElement>(null);
  const activeColumnFilterPopoverRef = useRef<HTMLDivElement>(null);

  // CHANGED: useEffect now reads the 'slaBreached' parameter from the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const statusParam = urlParams.get('status');
    const dateParam = urlParams.get('date');
    const slaParam = urlParams.get('slaBreached'); // Read our new param

    if (statusParam && statusOptions.length > 0) {
      const statusArray = statusParam.split(',').map(s => s.trim()).filter(status => statusOptions.includes(status));
      setStatusFilter(new Set(statusArray));
    } else {
      setStatusFilter(new Set());
    }
    
    // Set the SLA breach filter state based on the URL parameter
    setIsSlaBreachedFilter(slaParam === 'true');

    // Only apply the single-day date filter if the SLA filter is not active
    if (dateParam && dateFilterKey && !slaParam) {
      try {
        const filterDate = new Date(dateParam);
        if (!isNaN(filterDate.getTime())) {
          setStartDate(filterDate);
          setEndDate(filterDate);
        } else {
          setStartDate(null);
          setEndDate(null);
        }
      } catch (e) {
        console.error("Error parsing date from URL:", e);
        setStartDate(null);
        setEndDate(null);
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [location.search, dateFilterKey, statusOptions]);

  useEffect(() => {
    localStorage.setItem(`${title}TableColumns`, JSON.stringify(visibleColumns));
  }, [visibleColumns, title]);

  useEffect(() => {
    if (sortBy && headers.length > 0 && !headers.some(h => h.key === sortBy)) {
      setSortBy(headers[0].key);
    }
  }, [headers, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setShowStatusDropdown(false);
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) setShowTypeDropdown(false);
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) setShowColumnsDropdown(false);
      if (activeColumnFilterKey && activeColumnFilterPopoverRef.current && !activeColumnFilterPopoverRef.current.contains(event.target as Node)) {
        const clickedOnAColumnFilterTrigger = Array.from(document.querySelectorAll('.column-filter-trigger-button'))
                                                 .some(btn => btn.contains(event.target as Node));
        if (!clickedOnAColumnFilterTrigger) setActiveColumnFilterKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeColumnFilterKey]);

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => 
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
    );
  };

  // CHANGED: Now checks the SLA filter state
  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           statusFilter.size > 0 || 
           typeFilter !== 'All' || 
           startDate !== null || 
           endDate !== null ||
           isSlaBreachedFilter || // Check for SLA filter
           Object.values(columnFilters).some(val => val && val.trim() !== '');
  };

  // CHANGED: Now clears the SLA filter state
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter(new Set());
    setTypeFilter('All');
    setStartDate(null);
    setEndDate(null);
    setColumnFilters({});
    setIsSlaBreachedFilter(false); // Reset SLA filter
    setActiveColumnFilterKey(null);
    setCurrentPage(1);
    setSortBy(null);
    if (location.search) navigate(location.pathname, { replace: true });
  };

  const handleStatusToggle = (status: string) => {
    setStatusFilter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
    setCurrentPage(1);
  };

  // CHANGED: This is the main filtering logic update
  const filteredData = data.filter(item => {
    const matchesSearch = searchableFields.length === 0 || searchableFields.some(field => 
      String(item[field] ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusOptions.length === 0 || statusFilter.size === 0 || statusFilter.has(item.currentStatusName);
    const matchesType = typeOptions.length === 0 || typeFilter === 'All' || item.travelType === typeFilter;
    
    // ADDED: SLA breach condition logic.
    // This is true by default, unless the filter is active.
    // It uses 'item.updatedAt' as per your API response.
    const slaBreachedCondition = !isSlaBreachedFilter || (
        item.updatedAt && 
        (new Date().getTime() - new Date(item.updatedAt).getTime()) > (24 * 60 * 60 * 1000) // 24 hours in milliseconds
    );

    // Combine all filters
    if (!(matchesSearch && matchesStatus && matchesType && slaBreachedCondition)) {
        return false;
    }

    for (const key in columnFilters) {
      const filterValue = columnFilters[key];
      if (filterValue && filterValue.trim() !== '') {
        if (!String(item[key] ?? '').toLowerCase().includes(filterValue.toLowerCase())) return false;
      }
    }
    return true;
  });

  const dateFilteredData = filteredData.filter(item => {
    if (!dateFilterKey || (!startDate && !endDate)) return true;

    const itemDateValue = item[dateFilterKey];
    if (!itemDateValue) return false;

    const dateValue = new Date(itemDateValue);
    if (isNaN(dateValue.getTime())) return false;
    
    const sDate = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
    const eDate = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;

    if (sDate && eDate) {
      return dateValue >= sDate && dateValue <= eDate;
    }
    if (sDate) {
      return dateValue >= sDate;
    }
    if (eDate) {
      return dateValue <= eDate;
    }

    return true;
  });

  const sortedData = sortBy ? [...dateFilteredData].sort((a, b) => {
    const keyToSort = sortBy === 'createdAt' ? 'requestCreationDate' : sortBy;
    const aSortValue = a[keyToSort];
    const bSortValue = b[keyToSort];

    if (sortBy === 'createdAt') {
      const aDate = new Date(aSortValue);
      const bDate = new Date(bSortValue);
      if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
        return 0;
      }
      return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    
    if (sortOrder === 'asc') {
      return String(aSortValue ?? '').localeCompare(String(bSortValue ?? ''), undefined, { numeric: true });
    } else { 
      return String(bSortValue ?? '').localeCompare(String(aSortValue ?? ''), undefined, { numeric: true });
    }
  }) : dateFilteredData;

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' ? <ChevronDown className="h-4 w-4 transform rotate-180" /> : <ChevronDown className="h-4 w-4" />;
  };

  const formatDateForDisplay = (dateInput: string | Date): string => {
    try { return format(new Date(dateInput), 'dd-MM-yyyy'); } 
    catch (e) { return String(dateInput); }
  };

  const exportToExcel = () => {
    const exportData = sortedData.map(item => {
      const exportItem: any = {};
      headers.forEach(header => {
        if (visibleColumns.includes(header.key)) {
          exportItem[header.displayName] = item[header.key] ?? 'N/A';
        }
      });
      return exportItem;
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [{}]); 
    if (exportData.length > 0 && exportData[0]) {
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(String(key).length, ...exportData.map(row => String(row[key] || '').length))
      }));
      worksheet['!cols'] = colWidths;
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${currentDate}.xlsx`);
  };

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  }, [sortedData.length, itemsPerPage, currentPage]);
  
  const stickyHeaderBg = 'bg-gray-50';
  const stickyCellBg = 'bg-gray-50';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {newButtonLabel && newButtonPath && (
          <button className="btn-primary flex items-center" onClick={() => navigate(newButtonPath)}>
            <PlusCircle className="h-4 w-4 mr-2" />{newButtonLabel}
          </button>
        )}
      </div>
      
      <div className="card max-w-full">
        {/* ... The component's JSX remains the same from here on ... */}
        {/* No changes were needed in the render/JSX part of this component */}
        {/* I'm including it all as requested */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input type="text"
              className="pl-10 pr-4 py-2 w-full rounded-md bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search by Project, Traveler, Source, or Destination..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3">
            {statusOptions.length > 0 && (
              <div className="relative" ref={statusDropdownRef}>
                <button className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28 text-sm"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Status: {statusFilter.size === 0 ? 'All' : `${statusFilter.size} selected`}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute z-20 right-0 mt-1 w-48 bg-card border rounded-md shadow-elevation-3">
                    <div className="py-1">
                      {statusOptions.map(opt => (
                        <label key={opt} className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center">
                          <input
                            type="checkbox"
                            checked={statusFilter.has(opt)}
                            onChange={() => handleStatusToggle(opt)}
                            className="mr-2"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {typeOptions.length > 0 && (
              <div className="relative" ref={typeDropdownRef}>
                <button className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28 text-sm"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
                  <div className="flex items-center"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><span>Type: {typeFilter}</span></div>
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-20 right-0 mt-1 w-40 bg-card border rounded-md shadow-elevation-3">
                    <div className="py-1">
                      {['All', ...typeOptions].map(opt => (
                        <button key={opt} className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 ${typeFilter === opt ? 'bg-muted/70 font-semibold' : ''}`}
                          onClick={() => { setTypeFilter(opt); setShowTypeDropdown(false); setCurrentPage(1); }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button className="flex items-center justify-center p-2 bg-muted rounded-md hover:bg-muted/70 transition-colors"
              onClick={exportToExcel} title="Export to Excel">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {dateFilterKey && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Request Date:</span>
              <DatePicker
                selected={startDate}
                onChange={(date) => { setStartDate(date); setCurrentPage(1); }}
                placeholderText="Start date"
                className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
              <span className="text-sm text-gray-500">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => { setEndDate(date); setCurrentPage(1); }}
                placeholderText="End date"
                className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                minDate={startDate ?? undefined}
                isClearable
              />
            </div>
          )}
          <div className="relative" ref={columnsDropdownRef}>
            <button className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 rounded-md min-w-[120px] text-sm hover:bg-gray-200 transition-colors"
              onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
              <div className="flex items-center"><Filter className="h-4 w-4 mr-1.5 text-gray-500" /><span>Columns</span></div>
              <ChevronDown className="h-4 w-4 ml-1.5 text-gray-500" />
            </button>
            {showColumnsDropdown && (
              <div className="absolute z-20 right-0 mt-1 w-96 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {headers.map(h => (
                    <button key={h.key} className="text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center" onClick={() => handleColumnToggle(h.key)}>
                      <input type="checkbox" checked={visibleColumns.includes(h.key)} readOnly className="mr-2 pointer-events-none" />{h.displayName}
                    </button>
                  ))}
                  {renderActions && (
                    <button className="text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center" onClick={() => handleColumnToggle('actions')}>
                      <input type="checkbox" checked={visibleColumns.includes('actions')} readOnly className="mr-2 pointer-events-none" />Actions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {hasActiveFilters() && (
            <button onClick={clearAllFilters} title="Clear all filters"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors">
              <X className="h-4 w-4" /><span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto w-full border border-gray-200 rounded-md">
          <table className="w-full min-w-full table-auto">
             <thead>
              <tr className="border-b">
                {headers.map(header => visibleColumns.includes(header.key) && (
                  <th key={header.key} className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap relative group">
                    <div className="flex items-center justify-between w-full">
                      <div onClick={() => { if (header.sortable !== false) handleSort(header.key); }}
                        className={`flex items-center ${header.sortable !== false ? 'cursor-pointer hover:text-foreground' : ''}`}>
                        <span>{header.displayName}</span>{header.sortable !== false && getSortIcon(header.key)}
                      </div>
                      {header.filterable !== false && header.key !== 'currentStatusName' && header.key !== 'travelType' && header.key !== 'isRoundTrip' && header.key !== 'travelDates' && (
                        <button title={`Filter by ${header.displayName}`}
                          onClick={(e) => { e.stopPropagation(); setActiveColumnFilterKey(k => k === header.key ? null : header.key); }}
                          className={`column-filter-trigger-button ml-2 p-0.5 rounded hover:bg-muted/50 ${columnFilters[header.key]?.trim() ? 'text-primary' : 'text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity'}`}>
                          <Filter className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {activeColumnFilterKey === header.key && (
                      <div ref={activeColumnFilterPopoverRef} onClick={(e) => e.stopPropagation()}
                        className="absolute z-20 top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-lg w-56">
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Filter: {header.displayName}</p>
                        <input type="text" placeholder="Enter filter..." autoFocus
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          value={columnFilters[header.key] || ''}
                          onChange={(e) => { setColumnFilters(f => ({ ...f, [header.key]: e.target.value })); setCurrentPage(1); }} />
                      </div>
                    )}
                  </th>
                ))}
                {renderActions && visibleColumns.includes('actions') && (
                  <th className={`text-right py-3 px-4 font-medium text-muted-foreground whitespace-nowrap sticky right-0 z-10 border-l border-gray-300 ${stickyHeaderBg}`}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  onClick={() => onRowClick?.(item)}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                  data-testid={`row-${item.id}`}
                >
                  {headers.map(header => visibleColumns.includes(header.key) && (
                    <td
                      key={header.key}
                      className="py-3 px-4 whitespace-nowrap text-sm"
                      data-testid={`cell-${item.id}-${header.key}`}
                    >
                      {header.key === 'travelDates' && item.departureDate && item.returnDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          <span>{formatDateForDisplay(item.departureDate)} - {formatDateForDisplay(item.returnDate)}</span>
                        </div>
                      ) : header.key === 'currentStatusName' && getStatusColor ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item[header.key])}`}>
                          {item[header.key] ?? 'N/A'}
                        </span>
                      ) : header.key === 'travelType' && getTypeColor ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item[header.key])}`}>
                          {item[header.key] ?? 'N/A'}
                        </span>
                      ) : header.key === 'isRoundTrip' && getTripTypeColor ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTripTypeColor(item[header.key])}`}>
                          {item[header.key] ?? 'N/A'}
                        </span>
                      ) : ( String(item[header.key] ?? 'N/A') )}
                    </td>
                  ))}
                  {renderActions && visibleColumns.includes('actions') && (
                    <td className={`py-3 px-4 text-right space-x-2 whitespace-nowrap sticky right-0 z-10 border-l border-gray-300 ${stickyCellBg}`}>
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedData.length === 0 && (
          <div className="py-8 text-center"><p className="text-muted-foreground">No data found matching your criteria.</p></div>
        )}
        
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button title="First page" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronLeft className="h-4 w-4 mr-px" /><ChevronLeft className="h-4 w-4 -ml-1.5" />
            </button>
            <button title="Previous page" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum = (totalPages <= 5 || currentPage <= 3) ? i + 1 : (currentPage >= totalPages - 2) ? totalPages - 4 + i : currentPage - 2 + i;
                if (pageNum > totalPages || pageNum < 1) return null; 
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/70'}`}>
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button title="Next page" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button title="Last page" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronRight className="h-4 w-4 -mr-1.5" /><ChevronRight className="h-4 w-4 ml-px" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-muted rounded-md border-input px-2 py-1 text-sm">
              {[5, 10, 25, 50].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;