'use client';

import { useState } from 'react';
import { Database, Download, Table, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DatabaseExtractor({ onDatabaseResults }) {
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [databaseType, setDatabaseType] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [databaseData, setDatabaseData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState('');

  const databaseTypes = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mssql', label: 'SQL Server' },
    { value: 'oracle', label: 'Oracle' }
  ];

  const exampleUrls = [
    {
      type: 'MySQL',
      url: 'mysql://username:password@host:3306/database_name'
    },
    {
      type: 'PostgreSQL',
      url: 'postgresql://username:password@host:5432/database_name'
    },
    {
      type: 'MongoDB',
      url: 'mongodb://username:password@host:27017/database_name'
    },
    {
      type: 'SQLite',
      url: 'file:///path/to/database.db'
    },
    {
      type: 'SQL Server',
      url: 'mssql://username:password@server:1433/database'
    }
  ];

  const handleDatabaseConnect = async () => {
    if (!databaseUrl.trim()) {
      toast.error('Please enter a database URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/connect-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          databaseUrl: databaseUrl.trim(),
          databaseType: databaseType === 'auto' ? null : databaseType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to database');
      }

      setDatabaseData(data);
      setSelectedTable(Object.keys(data.tables)[0] || ''); // Select first table by default
      onDatabaseResults(data);
      toast.success(`Connected to ${data.databaseType} database successfully!`);

    } catch (error) {
      console.error('Database connection error:', error);
      setError(error.message);
      toast.error(`Database connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportDatabaseToExcel = async () => {
    if (!databaseData) {
      toast.error('No database data to export');
      return;
    }

    try {
      const response = await fetch('/api/export-database-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          databaseData: databaseData,
          databaseType: databaseData.databaseType,
          databaseUrl: databaseData.databaseUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export database data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export_${databaseData.databaseType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Database data exported successfully!');
    } catch (error) {
      console.error('Error exporting database data:', error);
      toast.error('Failed to export database data');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="h-6 w-6 text-purple-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Database Extractor</h2>
          <p className="text-sm text-gray-500">Connect to any database and extract data in table format</p>
        </div>
      </div>

      {/* Database Connection Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Type
          </label>
          <select
            value={databaseType}
            onChange={(e) => setDatabaseType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {databaseTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database URL
          </label>
          <input
            type="text"
            value={databaseUrl}
            onChange={(e) => setDatabaseUrl(e.target.value)}
            placeholder="Enter your database connection URL..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: mysql://user:password@host:3306/database
          </p>
        </div>

        <button
          onClick={handleDatabaseConnect}
          disabled={loading || !databaseUrl.trim()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              <span>Connect to Database</span>
            </>
          )}
        </button>
      </div>

      {/* Example URLs */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Example Connection URLs:</h3>
        <div className="space-y-2">
          {exampleUrls.map((example, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
              <span className="font-medium text-purple-600">{example.type}:</span>
              <code className="ml-2 text-gray-600">{example.url}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Database Results */}
      {databaseData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <span className="font-medium text-gray-900">
                  Connected to {databaseData.databaseType} Database
                </span>
                <p className="text-sm text-gray-500">
                  {databaseData.metadata.totalTables} tables found
                </p>
              </div>
            </div>
            <button
              onClick={exportDatabaseToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Export to Excel</span>
            </button>
          </div>

          {/* Table Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table to View
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.keys(databaseData.tables).map((tableName) => (
                <option key={tableName} value={tableName}>
                  {tableName} ({databaseData.tables[tableName].totalRows} rows, {databaseData.tables[tableName].totalColumns} columns)
                </option>
              ))}
            </select>
          </div>

          {/* Table Display */}
          {selectedTable && databaseData.tables[selectedTable] && (
            <DatabaseTable 
              tableName={selectedTable}
              tableData={databaseData.tables[selectedTable]}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DatabaseTable({ tableName, tableData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const totalPages = Math.ceil(tableData.rows.length / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = tableData.rows.slice(startIndex, endIndex);

  if (tableData.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">Error loading table: {tableData.error}</span>
        </div>
      </div>
    );
  }

  if (!tableData.rows || tableData.rows.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
        <Table className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No data found in table "{tableName}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Table className="h-5 w-5" />
          <span>{tableName}</span>
        </h3>
        <div className="text-sm text-gray-500">
          {tableData.totalRows.toLocaleString()} rows × {tableData.totalColumns} columns
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableData.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {tableData.columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate"
                    title={String(row[column] || '')}
                  >
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : <span className="text-gray-400 italic">null</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, tableData.rows.length)} of {tableData.rows.length} rows
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}