'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Map, BarChart3, Building2, Globe, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import SupplierSearch from '../components/SupplierSearch';
import AnalysisTabs from '../components/AnalysisTabs';
import DatabaseExtractor from '../components/DatabaseExtractor';
import { toast } from 'react-hot-toast';

export default function Home() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [databaseData, setDatabaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'database'

  const handleSearch = async (category) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/discover-suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      const data = await response.json();
      
      if (data.suppliers) {
        setSuppliers(data.suppliers);
      } else {
        console.error('No suppliers found:', data.error);
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error searching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (results) => {
    setSuppliers(results);
  };

  const handlePdfResults = (pdfSuppliers) => {
    setSuppliers((prev) => {
      // Merge and deduplicate by id or companyName
      const all = [...prev, ...pdfSuppliers];
      const seen = new Set();
      return all.filter(supplier => {
        const key = supplier.id || supplier.companyName;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  };

  const exportToExcel = async () => {
    if (suppliers.length === 0) {
      toast.error('No suppliers to export');
      return;
    }

    try {
      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suppliers, category: 'suppliers' }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDatabaseResults = (data) => {
    setDatabaseData(data);
    setActiveTab('database'); // Switch to database tab when data is loaded
  };

  useEffect(() => {
    // Get user location for map features
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supplier Discovery Agent</h1>
                <p className="text-sm text-gray-500">AI-powered procurement research platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToExcel}
                disabled={suppliers.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'suppliers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Supplier Discovery</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database Extractor</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'suppliers' && (
          <div>
            <SupplierSearch 
              onSearch={handleSearch} 
              onSearchResults={handleSearchResults}
              loading={loading} 
            />
            
            {suppliers.length > 0 && (
              <div className="mt-8">
                <AnalysisTabs 
                  suppliers={suppliers} 
                  userLocation={userLocation}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <DatabaseExtractor onDatabaseResults={handleDatabaseResults} />
          </div>
        )}

        {/* Empty State */}
        {/* {!loading && suppliers.length === 0 && (
          <div className="mt-8 text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching for a different category or check your search terms.
            </p>
          </div>
        )} */}
      </main>
    </div>
  );
}
