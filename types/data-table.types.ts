import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  PaginationState,
  Table,
} from '@tanstack/vue-table'

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  enableSorting?: boolean
  enableColumnFilters?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableColumnVisibility?: boolean
  enableRowSelection?: boolean
  enableRowExpansion?: boolean
  defaultPageSize?: number
}

export interface Column<TData> {
  id: string
  header: string
  accessorKey?: keyof TData & string
  cell?: (info: any) => any
  enableSorting?: boolean
  enableFiltering?: boolean
  meta?: Record<string, any>
}

export type DataTableInstance<TData> = Table<TData>
