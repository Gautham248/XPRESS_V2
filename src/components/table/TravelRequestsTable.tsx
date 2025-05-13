// import React, { useState, useEffect } from 'react';
// import { 
//   Calendar, 
//   ChevronDown,
//   Filter
// } from 'lucide-react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { format } from 'date-fns';
// import { TravelRequest, getStatusColor } from '../../data/mockData';

// type Column = keyof TravelRequest | 'travelDates' | 'actions';

// interface TravelRequestsTableProps {
//   paginatedData: TravelRequest[];
//   sortBy: keyof TravelRequest;
//   sortOrder: 'asc' | 'desc';
//   handleSort: (column: keyof TravelRequest) => void;
//   getSortIcon: (column: keyof TravelRequest) => JSX.Element;
//   handleRowClick: (requestId: string) => void;
//   statusFilter: string;
//   setStatusFilter: (status: string) => void;
//   typeFilter: string;
//   setTypeFilter: (type: string) => void;
// }

// const TravelRequestsTable: React.FC<TravelRequestsTableProps> = ({
//   paginatedData,
//   sortBy,
//   sortOrder,
//   handleSort,
//   getSortIcon,
//   handleRowClick,
//   statusFilter,
//   setStatusFilter,
//   typeFilter,
//   setTypeFilter,
// }) => {
//   // Initialize visibleColumns from localStorage if available, otherwise use default
//   const [visibleColumns, setVisibleColumns] = useState<Column[]>(() => {
//     const savedColumns = localStorage.getItem('travelRequestsTableColumns');
//     return savedColumns
//       ? JSON.parse(savedColumns)
//       : [
//           'id',
//           'travelerName',
//           'projectCode',
//           'travelType',
//           'source',
//           'travelDates',
//           'destination',
//           'departmentCode',
//           'reportingManager',
//           'status',
//           'actions',
//         ];
//   });
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
//   const [showTypeDropdown, setShowTypeDropdown] = useState(false);
//   const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
//   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
//   const [startDate, endDate] = dateRange;

//   const allColumns: Column[] = [
//     'id',
//     'travelerName',
//     'projectCode',
//     'travelType',
//     'source',
//     'travelDates',
//     'destination',
//     'departmentCode',
//     'reportingManager',
//     'status',
//     'actions',
//   ];

//   // Persist visibleColumns to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('travelRequestsTableColumns', JSON.stringify(visibleColumns));
//   }, [visibleColumns]);

//   const handleColumnToggle = (column: Column) => {
//     if (visibleColumns.includes(column)) {
//       setVisibleColumns(visibleColumns.filter((col) => col !== column));
//     } else {
//       setVisibleColumns([...visibleColumns, column]);
//     }
//   };

//   // Filter data by date range
//   const filteredData = paginatedData.filter((request) => {
//     if (!startDate || !endDate) return true;
//     const departureDate = new Date(request.departureDate);
//     return departureDate >= startDate && departureDate <= endDate;
//   });

//   // Format dates to dd-mm-yyyy
//   const formatDate = (date: string) => {
//     return format(new Date(date), 'dd-MM-yyyy');
//   };

//   return (
//     <div className="space-y-3">
//       {/* Filter Controls */}
//       <div className="flex flex-wrap items-center gap-3">
//         {/* Status Filter */}
//         <div className="relative">
//           <button
//             className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 rounded-md min-w-[120px] text-sm hover:bg-gray-200 transition-colors"
//             onClick={() => setShowStatusDropdown(!showStatusDropdown)}
//           >
//             <div className="flex items-center">
//               <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
//               <span>Status: {statusFilter}</span>
//             </div>
//             <ChevronDown className="h-4 w-4 ml-1.5 text-gray-500" />
//           </button>
//           {showStatusDropdown && (
//             <div className="absolute z-10 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
//               <div className="py-1">
//                 {[
//                   'All',
//                   'Pending',
//                   'Approved',
//                   'Rejected',
//                   'Completed',
//                   'Manager Approved',
//                   'Tickets Dispatched',
//                   'Tickets Selected',
//                   'DU Head Approved',
//                   'In-transit',
//                   'Returned',
//                   'Closed',
//                 ].map((status) => (
//                   <button
//                     key={status}
//                     className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
//                     onClick={() => {
//                       setStatusFilter(status);
//                       setShowStatusDropdown(false);
//                     }}
//                   >
//                     {status}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Type Filter */}
//         <div className="relative">
//           <button
//             className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 rounded-md min-w-[120px] text-sm hover:bg-gray-200 transition-colors"
//             onClick={() => setShowTypeDropdown(!showTypeDropdown)}
//           >
//             <div className="flex items-center">
//               <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
//               <span>Type: {typeFilter}</span>
//             </div>
//             <ChevronDown className="h-4 w-4 ml-1.5 text-gray-500" />
//           </button>
//           {showTypeDropdown && (
//             <div className="absolute z-10 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
//               <div className="py-1">
//                 {['All', 'Domestic', 'International'].map((type) => (
//                   <button
//                     key={type}
//                     className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
//                     onClick={() => {
//                       setTypeFilter(type);
//                       setShowTypeDropdown(false);
//                     }}
//                   >
//                     {type}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Date Range Filter */}
//         <div className="relative">
//           <DatePicker
//             selectsRange
//             startDate={startDate}
//             endDate={endDate}
//             onChange={(update: [Date | null, Date | null]) => {
//               setDateRange(update);
//             }}
//             placeholderText="Select date range"
//             className="px-2.5 py-1.5 bg-gray-100 rounded-md text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
//             isClearable
//           />
//         </div>

//         {/* Column Visibility Filter */}
//         <div className="relative">
//           <button
//             className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 rounded-md min-w-[120px] text-sm hover:bg-gray-200 transition-colors"
//             onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
//           >
//             <div className="flex items-center">
//               <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
//               <span>Columns</span>
//             </div>
//             <ChevronDown className="h-4 w-4 ml-1.5 text-gray-500" />
//           </button>
//           {showColumnsDropdown && (
//             <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
//               <div className="py-1">
//                 {allColumns.map((column) => (
//                   <button
//                     key={column}
//                     className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center"
//                     onClick={() => handleColumnToggle(column)}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={visibleColumns.includes(column)}
//                       onChange={() => {}}
//                       className="mr-2"
//                     />
//                     {column === 'actions'
//                       ? 'Actions'
//                       : column === 'travelDates'
//                         ? 'Travel Dates'
//                         : column === 'travelerName'
//                           ? 'Traveler'
//                           : column === 'departmentCode'
//                             ? 'Department'
//                             : column === 'reportingManager'
//                               ? 'Manager'
//                               : column.charAt(0).toUpperCase() + column.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Table with horizontal scroll */}
//       <div className="overflow-x-auto rounded-md border border-gray-200">
//         <table className="w-full text-sm min-w-[1000px]">
//           <thead>
//             <tr className="bg-gray-50 border-b border-gray-200">
//               {visibleColumns.includes('id') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('id')}
//                 >
//                   <div className="flex items-center">
//                     <span>Request ID</span>
//                     {getSortIcon('id')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('travelerName') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('travelerName')}
//                 >
//                   <div className="flex items-center">
//                     <span>Traveler</span>
//                     {getSortIcon('travelerName')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('projectCode') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('projectCode')}
//                 >
//                   <div className="flex items-center">
//                     <span>Project Code</span>
//                     {getSortIcon('projectCode')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('travelType') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('travelType')}
//                 >
//                   <div className="flex items-center">
//                     <span>Type</span>
//                     {getSortIcon('travelType')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('source') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('source')}
//                 >
//                   <div className="flex items-center">
//                     <span>Source</span>
//                     {getSortIcon('source')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('travelDates') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('departureDate')}
//                 >
//                   <div className="flex items-center">
//                     <span>Travel Dates</span>
//                     {getSortIcon('departureDate')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('destination') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('destination')}
//                 >
//                   <div className="flex items-center">
//                     <span>Destination</span>
//                     {getSortIcon('destination')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('departmentCode') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('departmentCode')}
//                 >
//                   <div className="flex items-center">
//                     <span>Department</span>
//                     {getSortIcon('departmentCode')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('reportingManager') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('reportingManager')}
//                 >
//                   <div className="flex items-center">
//                     <span>Manager</span>
//                     {getSortIcon('reportingManager')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('status') && (
//                 <th
//                   className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
//                   onClick={() => handleSort('status')}
//                 >
//                   <div className="flex items-center">
//                     <span>Status</span>
//                     {getSortIcon('status')}
//                   </div>
//                 </th>
//               )}
//               {visibleColumns.includes('actions') && (
//                 <th className="text-right py-2 px-3 font-medium text-gray-600 whitespace-nowrap">
//                   Actions
//                 </th>
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((request, index) => (
//               <tr
//                 key={request.id}
//                 className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
//                 onClick={() => handleRowClick(request.id)}
//               >
//                 {visibleColumns.includes('id') && (
//                   <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">{request.id}</td>
//                 )}
//                 {visibleColumns.includes('travelerName') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.travelerName}</td>
//                 )}
//                 {visibleColumns.includes('projectCode') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.projectCode}</td>
//                 )}
//                 {visibleColumns.includes('travelType') && (
//                   <td className="py-2 px-3 whitespace-nowrap">
//                     <span
//                       className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
//                         request.travelType === 'Domestic'
//                           ? 'bg-blue-100 text-blue-800'
//                           : 'bg-purple-100 text-purple-800'
//                       }`}
//                     >
//                       {request.travelType}
//                     </span>
//                   </td>
//                 )}
//                 {visibleColumns.includes('source') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.source}</td>
//                 )}
//                 {visibleColumns.includes('travelDates') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
//                       <span>
//                         {formatDate(request.departureDate)} - {formatDate(request.returnDate)}
//                       </span>
//                     </div>
//                   </td>
//                 )}
//                 {visibleColumns.includes('destination') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.destination}</td>
//                 )}
//                 {visibleColumns.includes('departmentCode') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.departmentCode}</td>
//                 )}
//                 {visibleColumns.includes('reportingManager') && (
//                   <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{request.reportingManager}</td>
//                 )}
//                 {visibleColumns.includes('status') && (
//                   <td className="py-2 px-3 whitespace-nowrap">
//                     <span
//                       className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
//                     >
//                       {request.status}
//                     </span>
//                   </td>
//                 )}
//                 {visibleColumns.includes('actions') && (
//                   <td className="py-2 px-3 text-right space-x-2 whitespace-nowrap">
//                     <button
//                       className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleRowClick(request.id);
//                       }}
//                     >
//                       View
//                     </button>
//                     {request.status === 'Pending' && (
//                       <>
//                         <button
//                           className="text-xs text-green-600 hover:text-green-800 font-medium"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             // Handle approve action
//                           }}
//                         >
//                           Approve
//                         </button>
//                         <button
//                           className="text-xs text-red-600 hover:text-red-800 font-medium"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             // Handle reject action
//                           }}
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {filteredData.length === 0 && (
//         <div className="py-6 text-center">
//           <p className="text-gray-500">No travel requests found.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TravelRequestsTable;