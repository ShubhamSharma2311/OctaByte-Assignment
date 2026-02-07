import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  Row,
} from '@tanstack/react-table';
import { Stock } from '../types/portfolio';

interface PortfolioTableProps {
  stocks: Stock[];
}

const columnHelper = createColumnHelper<Stock>();

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ stocks }) => {
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return `${value.toFixed(2)}%`;
  };

  const columns = useMemo(() => [
    columnHelper.accessor('particulars', {
      header: 'Particulars',
      size: 200,
      cell: (info) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">{info.getValue()}</div>
          <div className="text-xs text-gray-600">{info.row.original.symbol}</div>
        </div>
      ),
    }),
    columnHelper.accessor('purchasePrice', {
      header: 'Purchase Price',
      size: 100,
      cell: (info) => <div className="text-right">{formatCurrency(info.getValue())}</div>,
    }),
    columnHelper.accessor('quantity', {
      header: 'Qty',
      size: 80,
      cell: (info) => <div className="text-right">{formatNumber(info.getValue())}</div>,
    }),
    columnHelper.accessor('investment', {
      header: 'Investment',
      size: 100,
      cell: (info) => <div className="text-right">{formatCurrency(info.getValue())}</div>,
    }),
    columnHelper.accessor('portfolioPercentage', {
      header: 'Portfolio %',
      size: 80,
      cell: (info) => <div className="text-right">{formatPercentage(info.getValue())}</div>,
    }),
    columnHelper.accessor('exchange', {
      header: 'NSE/BSE',
      size: 80,
      cell: (info) => <div className="text-center text-xs font-mono text-gray-800">{info.getValue() || '-'}</div>,
    }),
    columnHelper.accessor('cmp', {
      header: 'CMP',
      size: 100,
      cell: (info) => <div className="text-right font-medium">{formatCurrency(info.getValue())}</div>,
    }),
    columnHelper.accessor('presentValue', {
      header: 'Present Value',
      size: 110,
      cell: (info) => <div className="text-right">{formatCurrency(info.getValue())}</div>,
    }),
    columnHelper.accessor('gainLoss', {
      header: 'Gain/Loss',
      size: 110,
      cell: (info) => {
        const value = info.getValue();
        const percentage = info.row.original.gainLossPercentage;
        
        if (value === undefined || value === null) return <div className="text-center">-</div>;
        
        const colorClass = value >= 0 
          ? 'text-green-900 bg-green-100 border border-green-300' 
          : 'text-red-900 bg-red-100 border border-red-300';
        
        return (
          <div className={`text-right font-semibold px-2 py-1 rounded ${colorClass}`}>
            <div>{formatCurrency(value)}</div>
            {percentage !== undefined && (
              <div className="text-xs font-medium">{formatPercentage(percentage)}</div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('peRatio', {
      header: 'P/E Ratio',
      size: 80,
      cell: (info) => {
        const value = info.getValue();
        return <div className="text-right">{value ? value.toFixed(2) : '-'}</div>;
      },
    }),
    columnHelper.accessor('latestEarnings', {
      header: 'Latest Earnings',
      size: 120,
      cell: (info) => (
        <div className="text-sm truncate max-w-[120px]" title={info.getValue() || ''}>
          {info.getValue() || '-'}
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getRowGroupClassName = (row: Row<Stock>, index: number): string => {
    const prevRow = stocks[index - 1];
    const currentSector = row.original.sector;
    const prevSector = prevRow?.sector;
    
    if (prevSector !== currentSector) {
      return 'border-t-2 border-gray-300';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Holdings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-time portfolio data with live market prices and performance metrics
        </p>
      </div>

      <div className="h-[50vh] overflow-x-auto overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
            {table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id} 
                className={`hover:bg-gray-50 ${getRowGroupClassName(row, index)}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 text-sm whitespace-nowrap text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stocks.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No portfolio data available
        </div>
      )}
    </div>
  );
};
