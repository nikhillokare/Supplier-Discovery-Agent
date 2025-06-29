'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, Filter, ExternalLink } from 'lucide-react';

const NewsAnalysis = ({ suppliers }) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const allNews = useMemo(() => {
    const news = [];
    suppliers.forEach(supplier => {
      if (supplier.recentNews && Array.isArray(supplier.recentNews)) {
        supplier.recentNews.forEach(newsItem => {
          news.push({
            ...newsItem,
            supplierName: supplier.companyName,
            supplierId: supplier.id || supplier.companyName
          });
        });
      }
    });
    return news.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [suppliers]);

  const filteredNews = useMemo(() => {
    let filtered = allNews;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(news => news.type === filterType);
    }
    
    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(news => news.supplierId === selectedSupplier);
    }
    
    return filtered;
  }, [allNews, filterType, selectedSupplier]);

  const newsStats = useMemo(() => {
    const positive = allNews.filter(news => news.type === 'positive').length;
    const negative = allNews.filter(news => news.type === 'negative').length;
    const neutral = allNews.filter(news => news.type === 'neutral').length;
    
    return { positive, negative, neutral, total: allNews.length };
  }, [allNews]);

  const getNewsIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNewsColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNewsTextColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-800';
      case 'negative':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const suppliersWithNews = suppliers.filter(s => s.recentNews && s.recentNews.length > 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recent News Analysis</h2>
        <p className="text-gray-600">
          Latest news and developments for suppliers in the last 45 days
        </p>
      </div>

      {/* News Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Positive News</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{newsStats.positive}</p>
          <p className="text-sm text-green-600">
            {newsStats.total > 0 ? ((newsStats.positive / newsStats.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-900">Negative News</span>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-1">{newsStats.negative}</p>
          <p className="text-sm text-red-600">
            {newsStats.total > 0 ? ((newsStats.negative / newsStats.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Neutral News</span>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-1">{newsStats.neutral}</p>
          <p className="text-sm text-gray-600">
            {newsStats.total > 0 ? ((newsStats.neutral / newsStats.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Total News</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{newsStats.total}</p>
          <p className="text-sm text-blue-600">
            Last 45 days
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
        >
          <option value="all">All News</option>
          <option value="positive">Positive News</option>
          <option value="negative">Negative News</option>
          <option value="neutral">Neutral News</option>
        </select>
        
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
        >
          <option value="all">All Suppliers</option>
          {suppliersWithNews.map(supplier => (
            <option key={supplier.id || supplier.companyName} value={supplier.id || supplier.companyName}>
              {supplier.companyName}
            </option>
          ))}
        </select>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length > 0 ? (
          filteredNews.map((news, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getNewsColor(news.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getNewsIcon(news.type)}
                    <span className={`text-sm font-medium ${getNewsTextColor(news.type)}`}>
                      {news.type === 'positive' ? 'Positive' : 
                       news.type === 'negative' ? 'Negative' : 'Neutral'} News
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(news.date)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">
                    {news.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">{news.supplierName}</span>
                    {news.source && (
                      <span>Source: {news.source}</span>
                    )}
                  </div>
                  
                  {news.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {news.description}
                    </p>
                  )}
                  
                  {news.impact && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-600">Impact: </span>
                      <span className="text-xs text-gray-700">{news.impact}</span>
                    </div>
                  )}
                </div>
                
                {news.url && (
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No news found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search for a different category.
            </p>
          </div>
        )}
      </div>

      {/* News Summary by Supplier */}
      {suppliersWithNews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">News Summary by Supplier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliersWithNews.map(supplier => {
              const supplierNews = supplier.recentNews || [];
              const positive = supplierNews.filter(n => n.type === 'positive').length;
              const negative = supplierNews.filter(n => n.type === 'negative').length;
              const neutral = supplierNews.filter(n => n.type === 'neutral').length;
              
              return (
                <div key={supplier.id || supplier.companyName} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{supplier.companyName}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Positive:</span>
                      <span className="font-medium text-black">{positive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Negative:</span>
                      <span className="font-medium text-black">{negative}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Neutral:</span>
                      <span className="font-medium text-black">{neutral}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-black">Total:</span>
                        <span className="font-bold text-black">{supplierNews.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAnalysis; 