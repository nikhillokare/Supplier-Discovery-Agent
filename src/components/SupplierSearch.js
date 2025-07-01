'use client';

import { useState } from 'react';
import { Search, Loader2, Globe, Database, Brain, FileUp } from 'lucide-react';

const SupplierSearch = ({ onSearch, onSearchResults, loading }) => {
  const [category, setCategory] = useState('');
  const [searchProgress, setSearchProgress] = useState({
    stage: '',
    message: '',
    progress: 0
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate progress updates for real-time search
    const progressStages = [
      { stage: 'searching', message: 'Searching Google for suppliers...', progress: 20 },
      { stage: 'extracting', message: 'Extracting company names...', progress: 40 },
      { stage: 'analyzing', message: 'Analyzing with AI...', progress: 60 },
      { stage: 'processing', message: 'Processing detailed information...', progress: 80 },
      { stage: 'finalizing', message: 'Finalizing results...', progress: 100 }
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setSearchProgress(progressStages[currentStage]);
        currentStage++;
      } else {
        clearInterval(progressInterval);
      }
    }, 2000);

    onSearch(category);
  };

  // PDF upload handler (just store file in state)
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
  };

  // Extract PDF handler with comprehensive supplier discovery
  const handleExtractPdf = async () => {
    if (!pdfFile) return;
    setPdfLoading(true);
    
    // Progressive status updates for PDF-based discovery
    const progressStages = [
      { stage: 'pdf-extract', message: 'Extracting text from PDF...', progress: 20 },
      { stage: 'pdf-analyze', message: 'Identifying procurement categories...', progress: 40 },
      { stage: 'pdf-search', message: 'Searching suppliers via Google SERP...', progress: 60 },
      { stage: 'pdf-process', message: 'Analyzing suppliers with AI...', progress: 80 },
      { stage: 'pdf-complete', message: 'PDF-based supplier discovery complete!', progress: 100 }
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length - 1) {
        setSearchProgress(progressStages[currentStage]);
        currentStage++;
      }
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const res = await fetch('/api/discover-suppliers-from-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      clearInterval(progressInterval);
      
      if (data.suppliers && data.suppliers.length > 0) {
        setSearchProgress({ stage: 'pdf-complete', message: `Discovered ${data.suppliers.length} suppliers from PDF!`, progress: 100 });
        if (onSearchResults) onSearchResults(data.suppliers);
      } else {
        setSearchProgress({ stage: 'pdf-error', message: data.error || 'No suppliers found in PDF.', progress: 0 });
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('PDF extraction error:', err);
      setSearchProgress({ stage: 'pdf-error', message: 'Error processing PDF.', progress: 0 });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleAnalyzeCompany = async (e) => {
    e.preventDefault();
    setAnalyzeLoading(true);
    setSearchProgress({ stage: 'analyzing', message: 'Analyzing company website...', progress: 30 });
    try {
      const res = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: category })
      });
      const data = await res.json();
      if (data.supplier) {
        setSearchProgress({ stage: 'analyzing', message: 'Company analysis complete!', progress: 100 });
        if (onSearchResults) onSearchResults([data.supplier]);
      } else {
        setSearchProgress({ stage: 'analyzing', message: 'Failed to analyze company.', progress: 0 });
      }
    } catch (err) {
      setSearchProgress({ stage: 'analyzing', message: 'Error analyzing company.', progress: 0 });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const suggestedCategories = [
    'Aluminium',
    'Steel',
    'Electronics',
    'Automotive',
    'Pharmaceuticals',
    'Chemicals',
    'Textiles',
    'Machinery',
    'Software',
    'Logistics Services',
    'Plastics',
    'Food & Beverage',
    'Construction Materials',
    'Medical Devices',
    'Renewable Energy'
  ];

  const isUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Real-Time Supplier Discovery
          </h2>
          <p className="text-gray-600">
            AI-powered live search using Google SERP API and OpenAI for comprehensive supplier intelligence
          </p>
        </div>

        <form onSubmit={isUrl(category) ? handleAnalyzeCompany : handleSubmit} className="space-y-4 text-black">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter procurement category (e.g., Aluminium, Electronics, Automotive)"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              disabled={loading}
            />
          </div>

          <div className="flex justify-center">
            {isUrl(category) ? (
              <button
                type="submit"
                disabled={analyzeLoading || !category.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {analyzeLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing Company...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !category.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Discovering Suppliers...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Discover 3 Suppliers</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* PDF Upload Section */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">📄 PDF-Based Supplier Discovery</h3>
              <p className="text-sm text-orange-700">Upload procurement documents to automatically discover relevant suppliers</p>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer bg-white hover:bg-orange-50 px-6 py-3 rounded-lg border border-orange-300 text-orange-700 font-medium transition-colors">
                <FileUp className="h-5 w-5" />
                <span>{pdfFile ? `📎 ${pdfFile.name}` : 'Upload PDF Document'}</span>
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </label>
              
              {pdfFile && (
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleExtractPdf}
                    disabled={pdfLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Discovering Suppliers from PDF...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        <span>Discover Suppliers from PDF</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="px-4 py-2 text-sm text-orange-600 hover:text-orange-800 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Real-time Progress Indicator */}
        {(loading || pdfLoading) && (
          <div className={`mt-6 p-4 rounded-lg border ${pdfLoading ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex space-x-2">
                <Globe className={`h-4 w-4 ${pdfLoading ? 'text-orange-600' : 'text-blue-600'}`} />
                <Database className={`h-4 w-4 ${pdfLoading ? 'text-orange-600' : 'text-blue-600'}`} />
                <Brain className={`h-4 w-4 ${pdfLoading ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <span className={`text-sm font-medium ${pdfLoading ? 'text-orange-900' : 'text-blue-900'}`}>
                {searchProgress.stage ? searchProgress.stage.charAt(0).toUpperCase() + searchProgress.stage.slice(1).replace('-', ' ') : 'Initializing...'}
              </span>
            </div>
            
            <div className="mb-2">
              <div className={`flex justify-between text-xs mb-1 ${pdfLoading ? 'text-orange-700' : 'text-blue-700'}`}>
                <span>{searchProgress.message}</span>
                <span>{searchProgress.progress}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${pdfLoading ? 'bg-orange-200' : 'bg-blue-200'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${pdfLoading ? 'bg-orange-600' : 'bg-blue-600'}`}
                  style={{ width: `${searchProgress.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className={`text-xs ${pdfLoading ? 'text-orange-600' : 'text-blue-600'}`}>
              <div className="flex items-center space-x-4">
                {pdfLoading ? (
                  <>
                    <span>📄 PDF Processing</span>
                    <span>🔍 Google SERP API</span>
                    <span>🤖 OpenAI GPT-4</span>
                  </>
                ) : (
                  <>
                    <span>🔍 Google SERP API</span>
                    <span>🤖 OpenAI GPT-4</span>
                    <span>📊 Real-time Data</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Categories */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Popular categories (3 suppliers each):</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((suggestedCategory) => (
              <button
                key={suggestedCategory}
                onClick={() => setCategory(suggestedCategory)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestedCategory}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600 text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-green-900">Live Google Search</h3>
            <p className="text-sm text-green-700">Real-time supplier discovery using Google SERP API</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-purple-600 text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-purple-900">AI Analysis</h3>
            <p className="text-sm text-purple-700">OpenAI GPT-4 powered data extraction and analysis</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-600 text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-blue-900">Up to 20 Suppliers</h3>
            <p className="text-sm text-blue-700">Comprehensive analysis with geographic diversity</p>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Sources:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
            <div>• Google SERP API - Real-time web search</div>
            <div>• OpenAI GPT-4 - Intelligent data extraction</div>
            <div>• Company websites - Direct information</div>
            <div>• Industry databases - Verified data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierSearch; 