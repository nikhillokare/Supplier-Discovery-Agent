'use client';

const NewsSummaryBySupplier = ({ suppliers }) => {
  if (!suppliers || suppliers.length === 0) return null;

  return (
    <div>
      {/* <h2 className="text-xl font-bold text-gray-900 mb-4">News Summary Supplier</h2> */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">Supplier</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">Positive</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">Negative</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">Neutral</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">Total</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => {
              const news = supplier.recentNews || [];
              const positive = news.filter(n => n.type === 'positive').length;
              const negative = news.filter(n => n.type === 'negative').length;
              const neutral = news.filter(n => n.type === 'neutral').length;
              return (
                <tr key={supplier.id || supplier.companyName}>
                  <td className="px-4 py-3 border-b text-black">{supplier.companyName}</td>
                  <td className="px-4 py-3 border-b text-green-700">{positive}</td>
                  <td className="px-4 py-3 border-b text-red-700">{negative}</td>
                  <td className="px-4 py-3 border-b text-gray-700">{neutral}</td>
                  <td className="px-4 py-3 border-b font-semibold text-black">{news.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsSummaryBySupplier; 