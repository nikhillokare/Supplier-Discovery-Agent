'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Award, BarChart3, Target, CheckCircle, AlertCircle } from 'lucide-react';

const TOPSISAnalysis = ({ suppliers }) => {
  const [weights, setWeights] = useState({
    revenue: 0.25,
    employees: 0.20,
    yearFounded: 0.15,
    certifications: 0.15,
    geographicCoverage: 0.15,
    esgStatus: 0.10
  });

  const criteria = [
    { id: 'revenue', label: 'Revenue', type: 'benefit', weight: weights.revenue },
    { id: 'employees', label: 'Employees', type: 'benefit', weight: weights.employees },
    { id: 'yearFounded', label: 'Year Founded', type: 'benefit', weight: weights.yearFounded },
    { id: 'certifications', label: 'Certifications', type: 'benefit', weight: weights.certifications },
    { id: 'geographicCoverage', label: 'Geographic Coverage', type: 'benefit', weight: weights.geographicCoverage },
    { id: 'esgStatus', label: 'ESG Status', type: 'benefit', weight: weights.esgStatus }
  ];

  const calculateTOPSIS = useMemo(() => {
    if (suppliers.length === 0) return [];

    // Step 1: Create decision matrix
    const decisionMatrix = suppliers.map(supplier => [
      supplier.revenue || 0,
      supplier.employees || 0,
      supplier.yearFounded || 0,
      supplier.certifications?.length || 0,
      supplier.geographicCoverage?.length || 0,
      supplier.esgStatus ? 1 : 0
    ]);

    // Step 2: Normalize the decision matrix
    const normalizedMatrix = [];
    const columnSums = [0, 0, 0, 0, 0, 0];

    // Calculate column sums
    decisionMatrix.forEach(row => {
      row.forEach((value, colIndex) => {
        columnSums[colIndex] += value * value;
      });
    });

    // Normalize
    decisionMatrix.forEach(row => {
      const normalizedRow = row.map((value, colIndex) => 
        value / Math.sqrt(columnSums[colIndex])
      );
      normalizedMatrix.push(normalizedRow);
    });

    // Step 3: Calculate weighted normalized decision matrix
    const weightedMatrix = normalizedMatrix.map(row => 
      row.map((value, colIndex) => value * criteria[colIndex].weight)
    );

    // Step 4: Determine ideal and negative ideal solutions
    const idealSolution = criteria.map((criterion, colIndex) => {
      const values = weightedMatrix.map(row => row[colIndex]);
      return criterion.type === 'benefit' ? Math.max(...values) : Math.min(...values);
    });

    const negativeIdealSolution = criteria.map((criterion, colIndex) => {
      const values = weightedMatrix.map(row => row[colIndex]);
      return criterion.type === 'benefit' ? Math.min(...values) : Math.max(...values);
    });

    // Step 5: Calculate separation measures
    const separationFromIdeal = weightedMatrix.map(row => {
      return Math.sqrt(row.reduce((sum, value, colIndex) => {
        return sum + Math.pow(value - idealSolution[colIndex], 2);
      }, 0));
    });

    const separationFromNegativeIdeal = weightedMatrix.map(row => {
      return Math.sqrt(row.reduce((sum, value, colIndex) => {
        return sum + Math.pow(value - negativeIdealSolution[colIndex], 2);
      }, 0));
    });

    // Step 6: Calculate relative closeness to ideal solution
    const relativeCloseness = separationFromNegativeIdeal.map((negSep, index) => {
      const posSep = separationFromIdeal[index];
      return negSep / (posSep + negSep);
    });

    // Step 7: Rank suppliers
    const rankedSuppliers = suppliers.map((supplier, index) => ({
      ...supplier,
      topsisScore: relativeCloseness[index],
      rank: 0
    }));

    // Sort by TOPSIS score (descending)
    rankedSuppliers.sort((a, b) => b.topsisScore - a.topsisScore);

    // Assign ranks
    rankedSuppliers.forEach((supplier, index) => {
      supplier.rank = index + 1;
    });

    return rankedSuppliers;
  }, [suppliers, weights]);

  const handleWeightChange = (criteriaId, newWeight) => {
    setWeights(prev => ({
      ...prev,
      [criteriaId]: parseFloat(newWeight)
    }));
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (rank <= 5) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">TOPSIS Supplier Ranking</h2>
        <p className="text-gray-600">
          Multi-criteria decision analysis using TOPSIS methodology
        </p>
      </div>

      {/* Weight Configuration */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Criteria Weights Configuration</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {criteria.map(criterion => (
            <div key={criterion.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {criterion.label}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights[criterion.id]}
                  onChange={(e) => handleWeightChange(criterion.id, e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {(weights[criterion.id] * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Total Weight: {(Object.values(weights).reduce((sum, weight) => sum + weight, 0) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                TOPSIS Score
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Employees
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Certifications
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                Geographic Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {calculateTOPSIS.map((supplier, index) => (
              <tr key={supplier.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankColor(supplier.rank)}`}>
                    {supplier.rank === 1 && <Award className="h-3 w-3 mr-1" />}
                    #{supplier.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{supplier.companyName}</div>
                    <div className="text-sm text-gray-500">{supplier.companyType}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${getScoreColor(supplier.topsisScore)}`}>
                    {(supplier.topsisScore * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {supplier.revenue ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(supplier.revenue) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {supplier.employees ? supplier.employees.toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {supplier.certifications?.length || 0}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {supplier.geographicCoverage?.length || 0} countries
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analysis Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">Top Performer</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {calculateTOPSIS[0]?.companyName || 'N/A'}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Score: {calculateTOPSIS[0] ? (calculateTOPSIS[0].topsisScore * 100).toFixed(1) + '%' : 'N/A'}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">High Performers</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {calculateTOPSIS.filter(s => s.topsisScore >= 0.7).length} suppliers
          </p>
          <p className="text-xs text-green-600 mt-1">
            Score ≥ 70%
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Average Score</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {calculateTOPSIS.length > 0 ? 
              (calculateTOPSIS.reduce((sum, s) => sum + s.topsisScore, 0) / calculateTOPSIS.length * 100).toFixed(1) + '%' : 
              'N/A'
            }
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Across all suppliers
          </p>
        </div>
      </div>

      {/* Methodology Explanation */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">TOPSIS Methodology</h3>
        <p className="text-sm text-gray-600 mb-3">
          TOPSIS (Technique for Order Preference by Similarity to an Ideal Solution) is a multi-criteria decision analysis method that:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Normalizes decision matrix to eliminate scale differences</li>
          <li>• Applies weights to criteria based on importance</li>
          <li>• Identifies ideal and negative ideal solutions</li>
          <li>• Calculates relative closeness to ideal solution</li>
          <li>• Ranks alternatives based on their performance scores</li>
        </ul>
      </div>
    </div>
  );
};

export default TOPSISAnalysis; 