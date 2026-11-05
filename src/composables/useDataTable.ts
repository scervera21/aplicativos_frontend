import { ref, computed, type Ref } from 'vue';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  type?: 'text' | 'date' | 'number' | 'custom';
}

export interface DataTableFeatures {
  searchable?: boolean;
  dateRangeFilter?: boolean;
  columnVisibility?: boolean;
  exportExcel?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSizes?: number[];
}

export interface UseDataTableOptions<T = any> {
  data: Ref<T[]>;
  columns: DataTableColumn[];
  features?: DataTableFeatures;
  initialPageSize?: number;
  dateField?: string;
  idField?: string;
}

export function useDataTable<T extends Record<string, any>>(options: UseDataTableOptions<T>) {
  const {
    data,
    columns: initialColumns,
    features = {},
    initialPageSize = 10,
    dateField = 'created_at',
    idField = 'id',
  } = options;

  // Estado reactivo de columnas
  const columns = ref<DataTableColumn[]>(
    initialColumns.map(col => ({
      ...col,
      visible: col.visible !== false,
      sortable: col.sortable !== false,
    }))
  );

  // Filtros reactivos
  const searchQuery = ref('');
  const startDate = ref('');
  const endDate = ref('');

  // Ordenamiento (Sorting)
  const sortColumn = ref<string | null>(null);
  const sortDirection = ref<'asc' | 'desc'>('asc');

  // Paginación
  const currentPage = ref(1);
  const pageSize = ref(initialPageSize);
  const pageSizes = ref(features.pageSizes || [10, 25, 50, 100]);

  // Selección de filas
  const selectedIds = ref<Set<any>>(new Set());

  // Conmutar ordenamiento
  const toggleSort = (columnKey: string) => {
    const col = columns.value.find(c => c.key === columnKey);
    if (!col || col.sortable === false) return;

    if (sortColumn.value === columnKey) {
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc';
      } else {
        sortColumn.value = null;
        sortDirection.value = 'asc';
      }
    } else {
      sortColumn.value = columnKey;
      sortDirection.value = 'asc';
    }
  };

  // Filtrado de datos (Búsqueda global + Rango de Fechas)
  const filteredData = computed(() => {
    let result = [...data.value];

    // 1. Búsqueda global
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(item => {
        return Object.entries(item).some(([k, val]) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') {
            return JSON.stringify(val).toLowerCase().includes(q);
          }
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. Filtro de rango de fechas
    if (startDate.value || endDate.value) {
      const start = startDate.value ? new Date(startDate.value).getTime() : null;
      const end = endDate.value ? new Date(`${endDate.value}T23:59:59`).getTime() : null;

      result = result.filter(item => {
        const itemDateVal = item[dateField];
        if (!itemDateVal) return false;
        const itemTime = new Date(itemDateVal).getTime();
        if (isNaN(itemTime)) return true;

        if (start && itemTime < start) return false;
        if (end && itemTime > end) return false;
        return true;
      });
    }

    // 3. Ordenamiento
    if (sortColumn.value) {
      const key = sortColumn.value;
      const isAsc = sortDirection.value === 'asc';

      result.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return isAsc ? valA - valB : valB - valA;
        }

        return isAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  });

  // Paginación de los datos procesados
  const totalRecords = computed(() => filteredData.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)));

  const paginatedData = computed(() => {
    if (features.pagination === false) return filteredData.value;
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredData.value.slice(start, start + pageSize.value);
  });

  // Ajustar página al cambiar filtros
  const setPage = (page: number) => {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value);
  };

  const setPageSize = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
  };

  // Columnas visibles activas
  const visibleColumns = computed(() => columns.value.filter(col => col.visible !== false));

  const toggleColumnVisibility = (key: string) => {
    const col = columns.value.find(c => c.key === key);
    if (col) {
      col.visible = !col.visible;
    }
  };

  // Gestión de selección múltiple
  const isSelected = (id: any) => selectedIds.value.has(id);

  const toggleSelectRow = (id: any) => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  };

  const allSelected = computed(() => {
    const currentIds = paginatedData.value.map(row => row[idField]);
    return currentIds.length > 0 && currentIds.every(id => selectedIds.value.has(id));
  });

  const isIndeterminate = computed(() => {
    const currentIds = paginatedData.value.map(row => row[idField]);
    const someSelected = currentIds.some(id => selectedIds.value.has(id));
    return someSelected && !allSelected.value;
  });

  const toggleSelectAll = () => {
    const currentIds = paginatedData.value.map(row => row[idField]);
    if (allSelected.value) {
      currentIds.forEach(id => selectedIds.value.delete(id));
    } else {
      currentIds.forEach(id => selectedIds.value.add(id));
    }
  };

  const clearSelection = () => {
    selectedIds.value.clear();
  };

  // Exportar a archivo CSV/Excel nativo sin dependencias pesadas
  const exportToExcel = (fileName: string = 'exportacion_datos') => {
    const exportableCols = visibleColumns.value.filter(c => c.key !== 'select' && c.key !== 'acciones');
    const headers = exportableCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

    const rows = filteredData.value.map(row => {
      return exportableCols.map(col => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    columns,
    visibleColumns,
    toggleColumnVisibility,
    searchQuery,
    startDate,
    endDate,
    sortColumn,
    sortDirection,
    toggleSort,
    currentPage,
    pageSize,
    pageSizes,
    totalPages,
    totalRecords,
    paginatedData,
    setPage,
    setPageSize,
    selectedIds,
    isSelected,
    toggleSelectRow,
    allSelected,
    isIndeterminate,
    toggleSelectAll,
    clearSelection,
    exportToExcel,
  };
}

