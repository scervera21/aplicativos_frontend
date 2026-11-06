import { ref, computed, type Ref } from 'vue';

export interface TabItem {
  key: string;
  label: string;
  icon?: any;
  areaId?: number | null;
  count?: number;
}

export interface UseTabbedDataTableOptions<T = any> {
  data: Ref<T[]>;
  tabs: Ref<TabItem[]> | TabItem[];
  filterFn?: (item: T, activeTabKey: string, activeTab: TabItem) => boolean;
  initialTab?: string;
}

export function useTabbedDataTable<T extends Record<string, any>>(options: UseTabbedDataTableOptions<T>) {
  const { data, initialTab } = options;
  const rawTabs = options.tabs;
  const tabsRef = (ref(rawTabs) as unknown) as Ref<TabItem[]>;

  const activeTabKey = ref<string>(
    initialTab || (tabsRef.value.length > 0 && tabsRef.value[0] ? tabsRef.value[0].key : 'todas')
  );

  const activeTab = computed<TabItem | undefined>(() => {
    return tabsRef.value.find(t => t.key === activeTabKey.value) || tabsRef.value[0];
  });

  const setTab = (key: string) => {
    activeTabKey.value = key;
  };

  // Filtrado reactivo del conjunto de datos según la pestaña activa
  const filteredData = computed(() => {
    const current = activeTab.value;
    if (!current) return data.value;

    if (options.filterFn) {
      return data.value.filter(item => options.filterFn!(item, activeTabKey.value, current));
    }

    // Si la pestaña es 'todas' o no tiene área asignada, devuelve el total
    if (current.key === 'todas' || current.areaId === null) {
      return data.value;
    }

    return data.value.filter(item => {
      if (current.areaId !== undefined && current.areaId !== null) {
        return item.area_id === current.areaId || item.area?.id === current.areaId;
      }
      const areaName = (item.area?.nombre_area || '').trim().toLowerCase();
      const tabKey = current.key.trim().toLowerCase();
      return areaName.includes(tabKey) || tabKey.includes(areaName);
    });
  });

  // Cálculo de conteos dinámicos en tiempo real para los badges de cada pestaña
  const tabsWithCounts = computed<TabItem[]>(() => {
    return tabsRef.value.map(tab => {
      let count = 0;
      if (tab.key === 'todas' || tab.areaId === null) {
        count = data.value.length;
      } else if (tab.areaId !== undefined && tab.areaId !== null) {
        count = data.value.filter(item => item.area_id === tab.areaId || item.area?.id === tab.areaId).length;
      } else {
        const tabKey = tab.key.trim().toLowerCase();
        count = data.value.filter(item => {
          const areaName = (item.area?.nombre_area || '').trim().toLowerCase();
          return areaName.includes(tabKey) || tabKey.includes(areaName);
        }).length;
      }
      return {
        ...tab,
        count
      };
    });
  });

  return {
    activeTabKey,
    activeTab,
    setTab,
    filteredData,
    tabs: tabsWithCounts
  };
}
