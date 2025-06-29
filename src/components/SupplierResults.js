'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Map, BarChart3, Building2, Globe, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, Mail, Phone, MapPin, Award, Shield, Users, Globe2, Factory, TrendingDown } from 'lucide-react';

const SupplierResults = ({ suppliers }) => {
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('name');
  const [filterCountry, setFilterCountry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSuppliers, setExpandedSuppliers] = useState(new Set());

  const toggleExpanded = (supplierId) => {
    const newExpanded = new Set(expandedSuppliers);
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId);
    } else {
      newExpanded.add(supplierId);
    }
    setExpandedSuppliers(newExpanded);
  };

  const sortedAndFilteredSuppliers = useMemo(() => {
    let filtered = suppliers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.headquartersCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.companyType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by country
    if (filterCountry !== 'all') {
      filtered = filtered.filter(supplier =>
        supplier.headquartersCountry === filterCountry
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'employees':
          return (b.employees || 0) - (a.employees || 0);
        case 'country':
          return (a.headquartersCountry || '').localeCompare(b.headquartersCountry || '');
        default:
          return 0;
      }
    });
  }, [suppliers, sortBy, filterCountry, searchTerm]);

  const countries = useMemo(() => {
    const countrySet = new Set(suppliers.map(s => s.headquartersCountry).filter(Boolean));
    return Array.from(countrySet).sort();
  }, [suppliers]);

  const formatCurrency = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    if (typeof value === 'string') return value;
    return value.toLocaleString();
  };

  const SupplierDetailRow = ({ supplier }) => {
    const isExpanded = expandedSuppliers.has(supplier.id);
    
    return (
      <>
        <tr className="border-b border-gray-100 hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => toggleExpanded(supplier.id)}
                className="mr-2 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                title={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? (
                  <span className="text-lg font-bold">▼</span>
                ) : (
                  <span className="text-lg font-bold">▶</span>
                )}
              </button>
              <div>
                <div className="font-medium text-gray-900">{supplier.companyName}</div>
                {supplier.website && (
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {supplier.website}
                  </a>
                )}
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">{supplier.companyType || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(supplier.revenue)}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(supplier.employees)}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{supplier.headquartersCountry || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{supplier.yearFounded || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {supplier.certifications?.length > 0 ? supplier.certifications.join(', ') : 'N/A'}
          </td>
        </tr>
        
        {isExpanded && (
          <tr className="bg-gray-50">
            <td colSpan="7" className="px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-black">
                    <div><span className="font-medium">Company Brief:</span> {supplier.companyBrief}</div>
                    <div><span className="font-medium">Headquarters:</span> {supplier.headquartersAddress}</div>
                    <div><span className="font-medium">City:</span> {supplier.headquartersCity}</div>
                    <div><span className="font-medium">Country:</span> {supplier.headquartersCountry}</div>
                    <div><span className="font-medium">Coordinates:</span> {supplier.latitude}, {supplier.longitude}</div>
                    <div><span className="font-medium">Contact Email:</span> {supplier.contactEmail}</div>
                    <div><span className="font-medium">CEO:</span> {supplier.ceo}</div>
                    <div><span className="font-medium">Parent Company:</span> {supplier.parentCompany || 'N/A'}</div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Business Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-black">
                    <div><span className="font-medium">Production Capacity:</span> {supplier.productionCapacity}</div>
                    <div><span className="font-medium">Net Profit Margin:</span> {supplier.netProfitMargin}</div>
                    <div><span className="font-medium">Industries Served:</span> {supplier.industriesServed?.join(', ')}</div>
                    <div><span className="font-medium">Geographic Coverage:</span> {supplier.geographicCoverage?.join(', ')}</div>
                  </div>
                </div>

                {/* Subsidiaries & Structure */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Corporate Structure
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Subsidiaries:</span></div>
                    {supplier.subsidiaries?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.subsidiaries.map((sub, idx) => (
                          <li key={idx}>{sub}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No subsidiaries listed</div>
                    )}
                  </div>
                </div>

                {/* Certifications & Awards */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Certifications & Awards
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Certifications:</span></div>
                    {supplier.certifications?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.certifications.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No certifications listed</div>
                    )}
                    <div><span className="font-medium">Awards:</span></div>
                    {supplier.awards?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.awards.map((award, idx) => (
                          <li key={idx}>{award}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No awards listed</div>
                    )}
                  </div>
                </div>

                {/* ESG & Compliance */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    ESG & Compliance
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Diversity:</span> {supplier.diversity}</div>
                    <div><span className="font-medium">ESG Status:</span> {supplier.esgStatus}</div>
                    <div><span className="font-medium">Cybersecurity:</span> {supplier.cybersecurityUpdates}</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analysis
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Strengths:</span></div>
                    {supplier.strengths?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No strengths listed</div>
                    )}
                    <div><span className="font-medium">Weaknesses:</span></div>
                    {supplier.weaknesses?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No weaknesses listed</div>
                    )}
                  </div>
                </div>

                {/* Supply Chain & Disruptions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Supply Chain & Risks
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Supply Chain Disruptions:</span> {supplier.supplyChainDisruptions}</div>
                    <div><span className="font-medium">Plant Shutdowns:</span> {supplier.plantShutdowns}</div>
                  </div>
                </div>

                {/* Product Offerings & Services */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Factory className="w-4 h-4 mr-2" />
                    Products & Services
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div><span className="font-medium">Product Offerings:</span></div>
                    {supplier.productOfferings && Object.keys(supplier.productOfferings).length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {Object.entries(supplier.productOfferings).map(([product, available]) => (
                          <li key={product}>{product}: {available}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No product offerings listed</div>
                    )}
                    <div><span className="font-medium">Value Added Services:</span></div>
                    {supplier.valueAddedServices?.length > 0 ? (
                      <ul className="list-disc list-inside ml-2">
                        {supplier.valueAddedServices.map((service, idx) => (
                          <li key={idx}>{service}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No value added services listed</div>
                    )}
                  </div>
                </div>

                {/* Recent News */}
                <div className="space-y-4 lg:col-span-2">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Globe2 className="w-4 h-4 mr-2" />
                    Recent News
                  </h4>
                  {supplier.recentNews?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {supplier.recentNews.map((news, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              news.type === 'positive' ? 'bg-green-100 text-green-800' :
                              news.type === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {news.type}
                            </span>
                            <span className="text-xs text-gray-500">{news.date}</span>
                          </div>
                          <h5 className="font-medium text-sm mb-1">{news.title}</h5>
                          <p className="text-xs text-gray-600 mb-2">{news.description}</p>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Source:</span> {news.source}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            <span className="font-medium">Impact:</span> {news.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No recent news available</div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try searching for a different category or check your search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Supplier Discovery Results</h2>
            <p className="text-gray-600 mt-1">
              Found {suppliers.length} suppliers with geographic diversity
            </p>
          </div>
          
          <div className="flex space-x-2">
            {/* <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button> */}
            {/* <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'cards'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button> */}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
              />
            </div>
            
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
            >
              <option value="name">Sort by Name</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="employees">Sort by Employees</option>
              <option value="country">Sort by Country</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Employees
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Founded
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Certifications
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredSuppliers.map((supplier, index) => (
                  <SupplierDetailRow key={supplier.id || index} supplier={supplier} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredSuppliers.map((supplier, index) => (
              <div key={supplier.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{supplier.companyName}</h3>
                  <button
                    onClick={() => toggleExpanded(supplier.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSuppliers.has(supplier.id) ? <span className="text-lg font-bold">▼</span> : <span className="text-lg font-bold">▶</span>}
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Revenue:</span> {formatCurrency(supplier.revenue)}
                  </div>
                  <div>
                    <span className="font-medium">Employees:</span> {formatNumber(supplier.employees)}
                  </div>
                  <div>
                    <span className="font-medium">Country:</span> {supplier.headquartersCountry || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Founded:</span> {supplier.yearFounded || 'N/A'}
                  </div>
                  {supplier.website && (
                    <div>
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Expanded details for card view */}
                {expandedSuppliers.has(supplier.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
                    <div><span className="font-medium">Company Brief:</span> {supplier.companyBrief}</div>
                    <div><span className="font-medium">Headquarters:</span> {supplier.headquartersAddress}</div>
                    <div><span className="font-medium">CEO:</span> {supplier.ceo}</div>
                    <div><span className="font-medium">Certifications:</span> {supplier.certifications?.join(', ') || 'N/A'}</div>
                    <div><span className="font-medium">Strengths:</span> {supplier.strengths?.join(', ') || 'N/A'}</div>
                    <div><span className="font-medium">Recent News:</span> {supplier.recentNews?.length || 0} items</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Suppliers:</span> {suppliers.length}
            </div>
            <div>
              <span className="font-medium">Countries:</span> {countries.length}
            </div>
            <div>
              <span className="font-medium">Showing:</span> {sortedAndFilteredSuppliers.length}
            </div>
            <div>
              <span className="font-medium">Average Revenue:</span> {formatCurrency(
                suppliers.reduce((sum, s) => sum + (s.revenue || 0), 0) / suppliers.length
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierResults; 