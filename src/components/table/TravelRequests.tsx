import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle,
  Download,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { mockTravelRequests, TravelRequest } from '../../data/mockData';
import TravelRequestsTable from './TravelRequestsTable';

const TravelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof TravelRequest>('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Filter the data
  const filteredData = mockTravelRequests.filter(request => {
    const matchesSearch = 
      request.travelerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) || // Added
      request.source.toLowerCase().includes(searchTerm.toLowerCase()); // Added
      
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    const matchesType = typeFilter === 'All' || request.travelType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Sort the data
  const sortedData = [...filteredData].sort((a, b) => {
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
    navigate(`/travel-requests/${requestId}`);
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
      
      <div className="card">
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
            <button className="flex items-center justify-center p-2 bg-muted rounded-md">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <TravelRequestsTable
          paginatedData={paginatedData}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          handleRowClick={handleRowClick}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
        
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