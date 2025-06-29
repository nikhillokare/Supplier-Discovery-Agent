'use client';

import { useState, useMemo } from 'react';
import { Check, X, Minus, BarChart3, Filter } from 'lucide-react';

const ComparisonMatrix = ({ suppliers }) => {
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [sortBy, setSortBy] = useState('name');

  const criteriaOptions = [
    { id: 'companyType', label: 'Company Type', type: 'text' },
    { id: 'revenue', label: 'Revenue', type: 'currency' },
    { id: 'employees', label: 'Employees', type: 'number' },
    { id: 'yearFounded', label: 'Year Founded', type: 'number' },
    { id: 'headquartersCountry', label: 'Headquarters', type: 'text' },
    { id: 'certifications', label: 'Certifications', type: 'array' },
    { id: 'industriesServed', label: 'Industries Served', type: 'array' },
    { id: 'geographicCoverage', label: 'Geographic Coverage', type: 'array' },
    { id: 'productionCapacity', label: 'Production Capacity', type: 'text' },
    { id: 'esgStatus', label: 'ESG Status', type: 'text' },
    { id: 'netProfitMargin', label: 'Net Profit Margin', type: 'text' },
    { id: 'parentCompany', label: 'Parent Company', type: 'text' },
  ];

  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'employees':
          return (b.employees || 0) - (a.employees || 0);
        case 'yearFounded':
          return (a.yearFounded || 9999) - (b.yearFounded || 9999);
        default:
          return 0;
      }
    });
  }, [suppliers, sortBy]);

  const handleSupplierToggle = (supplierId) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleCriteriaToggle = (criteriaId) => {
    setSelectedCriteria(prev => 
      prev.includes(criteriaId) 
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    switch (type) {
      case 'currency':
        if (typeof value === 'string') return value;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'array':
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : 'None';
        }
        return value;
      default:
        return value;
    }
  };

  const getComparisonValue = (supplier, criteriaId) => {
    const criteria = criteriaOptions.find(c => c.id === criteriaId);
    if (!criteria) return 'N/A';
    
    const value = supplier[criteriaId];
    return formatValue(value, criteria.type);
  };

  const displaySuppliers = selectedSuppliers.length > 0 
    ? suppliers.filter(s => selectedSuppliers.includes(s.id || s.companyName))
    : sortedSuppliers.slice(0, 5);

  const displayCriteria = selectedCriteria.length > 0
    ? criteriaOptions.filter(c => selectedCriteria.includes(c.id))
    : criteriaOptions.slice(0, 6);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Comparison Matrix</h2>
        <p className="text-gray-600">
          Compare suppliers across different criteria and metrics
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Supplier Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Select Suppliers ({displaySuppliers.length} shown)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortedSuppliers.map(supplier => (
              <button
                key={supplier.id || supplier.companyName}
                onClick={() => handleSupplierToggle(supplier.id || supplier.companyName)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSuppliers.includes(supplier.id || supplier.companyName) || 
                  (selectedSuppliers.length === 0 && displaySuppliers.includes(supplier))
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {supplier.companyName}
              </button>
            ))}
          </div>
        </div>

        {/* Criteria Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Comparison Criteria</h3>
          <div className="flex flex-wrap gap-2">
            {criteriaOptions.map(criteria => (
              <button
                key={criteria.id}
                onClick={() => handleCriteriaToggle(criteria.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCriteria.includes(criteria.id) || 
                  (selectedCriteria.length === 0 && displayCriteria.includes(criteria))
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {criteria.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sort Suppliers By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="name">Company Name</option>
            <option value="revenue">Revenue (High to Low)</option>
            <option value="employees">Employees (High to Low)</option>
            <option value="yearFounded">Year Founded (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Criteria
              </th>
              {displaySuppliers.map(supplier => (
                <th key={supplier.id || supplier.companyName} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200 min-w-[200px]">
                  {supplier.companyName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayCriteria.map(criteria => (
              <tr key={criteria.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                  {criteria.label}
                </td>
                {displaySuppliers.map(supplier => (
                  <td key={supplier.id || supplier.companyName} className="px-4 py-3 text-sm text-gray-900">
                    {getComparisonValue(supplier, criteria.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Comparison Summary</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {displaySuppliers.length} suppliers × {displayCriteria.length} criteria
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Top Performers</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {(() => {
              const publicCompanies = displaySuppliers.filter(s => s.companyType === 'Public').length;
              return `${publicCompanies} public companies`;
            })()}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Geographic Diversity</span>
          </div>
          <p className="text-sm text-purple-700 mt-1">
            {new Set(displaySuppliers.map(s => s.headquartersCountry).filter(Boolean)).size} countries
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMatrix; 