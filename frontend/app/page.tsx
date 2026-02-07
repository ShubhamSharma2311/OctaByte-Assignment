'use client';

import { useMemo } from 'react';
import { usePortfolioData } from '../src/hooks/usePortfolioData';
import { Header } from '../src/components/Header';
import { LoadingState } from '../src/components/LoadingState';
import { SectorSummaryComponent } from '../src/components/SectorSummary';
import { PortfolioTable } from '../src/components/PortfolioTable';
import { Stock } from '../src/types/portfolio';

export default function PortfolioDashboard() {
  const { data, loading, error, lastUpdated } = usePortfolioData();

  const sortedStocks = useMemo(() => {
    if (!data?.sectors) return [];
    
    // Extract all stocks from all sectors
    const allStocks = data.sectors.flatMap(sector => sector.stocks);
    
    return [...allStocks].sort((a: Stock, b: Stock) => {
      const sectorA = a.sector || 'Unknown';
      const sectorB = b.sector || 'Unknown';
      
      if (sectorA !== sectorB) {
        return sectorA.localeCompare(sectorB);
      }
      
      const nameA = a.particulars || a.symbol || '';
      const nameB = b.particulars || b.symbol || '';
      return nameA.localeCompare(nameB);
    });
  }, [data?.sectors]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingState message="Loading portfolio data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        summary={data} 
        lastUpdated={lastUpdated} 
        error={error} 
      />
      
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {data && (
          <>
            <PortfolioTable stocks={sortedStocks} />
            
            {data.sectors && data.sectors.length > 0 && (
              <SectorSummaryComponent sectors={data.sectors} />
            )}
          </>
        )}
        
        {!data && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No portfolio data available</p>
            {error && (
              <p className="text-red-600 mt-2">{error}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
