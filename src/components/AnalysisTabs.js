'use client';

import { useState } from 'react';
import { Building2, Map, BarChart3, TrendingUp, FileText, Globe } from 'lucide-react';
import SupplierResults from './SupplierResults';
import SupplierMap from './SupplierMap';
import ComparisonMatrix from './ComparisonMatrix';
import TOPSISAnalysis from './TOPSISAnalysis';
import NewsAnalysis from './NewsAnalysis';
import NewsSummaryBySupplier from './NewsSummaryBySupplier';

const AnalysisTabs = ({ suppliers, userLocation }) => {
  const [activeTab, setActiveTab] = useState('suppliers');

  const tabs = [
    {
      id: 'suppliers',
      name: 'Supplier Discovery Results',
      icon: Building2,
      component: SupplierResults,
      description: 'Detailed supplier information with expandable details'
    },
    {
      id: 'map',
      name: 'Supplier Map',
      icon: Map,
      component: SupplierMap,
      description: 'Geographic visualization of supplier locations'
    },
    {
      id: 'comparison',
      name: 'Comparison Matrix',
      icon: BarChart3,
      component: ComparisonMatrix,
      description: 'Side-by-side comparison of supplier metrics'
    },
    {
      id: 'topsis',
      name: 'TOPSIS Analysis',
      icon: TrendingUp,
      component: TOPSISAnalysis,
      description: 'Multi-criteria decision analysis ranking'
    },
    
    {
      id: 'news-analysis',
      name: 'Detailed News Analysis',
      icon: Globe,
      component: NewsAnalysis,
      description: 'Comprehensive news analysis and insights'
    },
    {
      id: 'news-summary',
      name: 'News Summary Supplier',
      icon: FileText,
      component: NewsSummaryBySupplier,
      // description: 'News sentiment analysis summary'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {ActiveComponent && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
            
            <ActiveComponent 
              suppliers={suppliers} 
              userLocation={userLocation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisTabs; 