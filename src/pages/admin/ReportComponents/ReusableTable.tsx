
import React from 'react';

interface TableProps {
  headers: string[];
  data: Record<string, any>[];
}

const ReusableTable: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {headers.map((header, cellIndex) => {
                // Convert header to a likely corresponding object key (lowercase, no spaces)
                const key = header.toLowerCase().replace(/\s+/g, '_');
                return (
                  <td key={cellIndex} className="py-3 px-4 text-sm text-gray-700">
                    {row[key] !== undefined ? row[key] : row[Object.keys(row)[cellIndex]]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
