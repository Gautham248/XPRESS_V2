import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, X, Eye, Check, X as XIcon } from 'lucide-react';
import { mockTravelRequests, getStatusColor } from '../../data/mockData';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState(mockTravelRequests);
  const tableRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [tableHeight, setTableHeight] = useState(0);
  const [columnWidths, setColumnWidths] = useState({
    tick: 150,
    actions: 200,
    status: 150,
    type: 150,
    traveler: 150,
    department: 150,
    travelDates: 200,
    manager: 150
  });
  const [activeColumn, setActiveColumn] = useState(null);
  
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    deletedItem: null,
    deletedIndex: null,
  });

  const handleViewClick = (item, e) => {
    e.stopPropagation();
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

    navigate(`${basePath}/${item.id}`);
  };

  const handleMarkDone = (item, e) => {
    e.stopPropagation();
    const itemIndex = tableData.findIndex(data => data.id === item.id);
    const deletedItem = tableData[itemIndex];
    let newTableData = tableData.filter(data => data.id !== item.id);

    if (itemIndex < tableData.length - 1) {
      const nextItem = newTableData[itemIndex];
      newTableData = newTableData.filter((_, index) => index !== itemIndex);
      newTableData.unshift(nextItem);
    }

    setTableData(newTableData);
    setToast({
      visible: true,
      message: 'Task Done',
      type: 'success',
      deletedItem,
      deletedIndex: itemIndex,
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (toast.deletedItem && toast.deletedIndex !== undefined) {
      const newTableData = [...tableData];
      newTableData.splice(toast.deletedIndex, 0, toast.deletedItem);
      setTableData(newTableData);
      setToast(prev => ({ ...prev, visible: false }));
    }
  };

  const getTypeColor = (type) => {
    return type === 'Domestic' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800';
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd-MM-yyyy');
  };

  const handleActionClick = (e, action, request) => {
    e.stopPropagation();
    console.log(`${action} clicked for request ${request.id}`);
  };

  const handleResizeStart = (e, column) => {
    e.preventDefault();
    setResizing(true);
    setStartX(e.clientX);
    setActiveColumn(column);
  };

  const handleResizeMove = (e) => {
    if (!resizing || !activeColumn) return;
    
    const diff = e.clientX - startX;
    setStartX(e.clientX);
    
    setColumnWidths(prevWidths => ({
      ...prevWidths,
      [activeColumn]: Math.max(50, prevWidths[activeColumn] + diff)
    }));
  };

  const handleResizeEnd = () => {
    setResizing(false);
    setActiveColumn(null);
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizing, activeColumn, startX]);

  // Calculate table height for resizer
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableRef.current) {
        const headerHeight = tableRef.current.querySelector('thead tr').offsetHeight;
        const bodyHeight = tableRef.current.querySelector('tbody').offsetHeight;
        setTableHeight(headerHeight + bodyHeight);
      }
    };

    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);

    return () => {
      window.removeEventListener('resize', updateTableHeight);
    };
  }, [tableData]);

  const rowHeight = 60;

  const renderResizer = (column) => (
    <div 
      className={`absolute top-0 right-0 w-[3px] bg-gray-300 cursor-col-resize hover:bg-blue-500 ${resizing && activeColumn === column ? 'bg-blue-500' : ''}`}
      onMouseDown={(e) => handleResizeStart(e, column)}
      style={{ height: `${tableHeight}px`, zIndex: 40 }}
    />
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      {toast.visible && (
        <div className="fixed top-4 right-4 left-4 md:left-auto flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 max-w-sm z-50 animate-slide-down">
          <div className={`flex-shrink-0 ${toast.type === 'success' ? 'text-green-500' : toast.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 mr-2">
            <p className="text-sm text-gray-700">{toast.message}</p>
          </div>
          <button
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            onClick={handleUndoDelete}
          >
            Undo
          </button>
          <button
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="shadow-md rounded-lg bg-white overflow-hidden max-w-full">
        <div className="w-full relative">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table ref={tableRef} className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  <th style={{ width: `${columnWidths.tick}px` }} className="sticky top-0 left-0 z-40 bg-gray-50 border-r border-gray-200">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></div>
                    {renderResizer('tick')}
                  </th>
                  <th style={{ width: `${columnWidths.actions}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
                    {renderResizer('actions')}
                  </th>
                  <th style={{ width: `${columnWidths.status}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
                    {renderResizer('status')}
                  </th>
                  <th style={{ width: `${columnWidths.type}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</div>
                    {renderResizer('type')}
                  </th>
                  <th style={{ width: `${columnWidths.traveler}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traveler</div>
                    {renderResizer('traveler')}
                  </th>
                  <th style={{ width: `${columnWidths.department}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</div>
                    {renderResizer('department')}
                  </th>
                  <th style={{ width: `${columnWidths.travelDates}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Dates</div>
                    {renderResizer('travelDates')}
                  </th>
                  <th style={{ width: `${columnWidths.manager}px` }} className="sticky top-0 z-30 bg-gray-50">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</div>
                    {renderResizer('manager')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50 relative">
                    <td className="sticky left-0 z-20 bg-white border-r border-gray-200 mt-2 border-gray-200">
                      <div 
                        className="flex h-full items-center justify-center border-b border-gray-200" 
                        style={{ height: `${rowHeight}px` }}
                      >
                        <button
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-md flex items-center justify-center transition-colors duration-200 border border-green-200"
                          onClick={(e) => handleMarkDone(request, e)}
                          title="Mark as done"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                      {/* Fallback bottom line for the last row */}
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 21 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.actions}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <button
                            className="inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium shadow-sm transition-colors duration-200"
                            onClick={(e) => handleViewClick(request, e)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                          {request.status === 'Pending' && (
                            <>
                              <button
                                className="inline-flex items-center px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md text-xs font-medium shadow-sm transition-colors duration-200"
                                onClick={(e) => handleActionClick(e, 'approve', request)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              <button
                                className="inline-flex items-center px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium shadow-sm transition-colors duration-200"
                                onClick={(e) => handleActionClick(e, 'reject', request)}
                              >
                                <XIcon className="h-3 w-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Fallback bottom line for the last row */}
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.status}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.type}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getTypeColor(
                            request.travelType
                          )}`}
                        >
                          {request.travelType}
                        </span>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.traveler}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.travelerName}</div>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.department}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.departmentCode}</div>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.travelDates}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.departureDate && request.returnDate
                            ? `${formatDate(request.departureDate)} - ${formatDate(request.returnDate)}`
                            : 'N/A'}
                        </div>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                    <td style={{ width: `${columnWidths.manager}px` }} className="border-b border-gray-200 relative">
                      <div className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.reportingManager || 'N/A'}</div>
                      </div>
                      {index === tableData.length - 1 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
                          style={{ zIndex: 1 }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {resizing && (
        <div 
          className="fixed inset-0 z-50 cursor-col-resize" 
          style={{ 
            pointerEvents: 'all',
            backgroundColor: 'transparent'
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;