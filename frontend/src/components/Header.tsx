import { PortfolioData } from '../types/portfolio';

interface HeaderProps {
  summary: PortfolioData | null;
  lastUpdated: Date | null;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ summary, lastUpdated, error }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time portfolio tracking and analysis
            </p>
          </div>

          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-500">Total Investment</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary.totalInvestment)}
                </p>
              </div>
              
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-500">Present Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary.totalPresentValue)}
                </p>
              </div>
              
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-500">Total Gain/Loss</p>
                <p className={`text-lg font-bold px-2 py-1 rounded border ${
                  summary.totalGainLoss >= 0 ? 'text-green-900 bg-green-100 border-green-300' : 'text-red-900 bg-red-100 border-red-300'
                }`}>
                  {formatCurrency(summary.totalGainLoss)} ({summary.totalGainLossPercentage.toFixed(2)}%)
                </p>
              </div>
              
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-500">Total Stocks</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.sectors.reduce((total, sector) => total + sector.stocks.length, 0)} holdings
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {formatTime(lastUpdated)}
              </span>
            )}
            
            {error && (
              <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                {error}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Auto-refresh every 15s</span>
          </div>
        </div>
      </div>
    </header>
  );
};