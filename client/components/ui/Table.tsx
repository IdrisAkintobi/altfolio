import { ReactNode } from 'react';
import { Pagination } from '../Pagination';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  getRowKey: (item: T) => string;
}

export function Table<T>({
  data,
  columns,
  emptyMessage = 'No data found',
  emptyIcon,
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  getRowKey,
}: TableProps<T>) {
  const showPagination = currentPage !== undefined && totalPages !== undefined && onPageChange && onNextPage && onPrevPage;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 font-medium ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : ''
                  } ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={getRowKey(item)} className="hover:bg-slate-800/50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : ''
                      } ${column.className || ''}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onNext={onNextPage}
          onPrev={onPrevPage}
        />
      )}
    </div>
  );
}
