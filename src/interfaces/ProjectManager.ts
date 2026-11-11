import type { Actividad } from './Actividad';

export interface ProjectManagerAplicativoInfo {
  id: number;
  nombre_aplicativo: string;
  alias: string;
  responsable: string;
  gerencia_id?: number | null;
  gerencia_responsable?: string;
  gerencia_sigla?: string | null;
  gerencia_nombre?: string | null;
  estatus?: string;
  pap?: boolean;
}

export interface ProjectManagerMetricas {
  total: number;
  culminadas: number;
  pendientes: number;
  atrasadas: number;
}

export interface ProjectManagerIndicadores {
  avance_total: number;
  avance_pendiente: number;
  metricas: ProjectManagerMetricas;
}

export interface CicloDeVidaArea {
  area_id: number;
  nombre_area: string;
  total_actividades: number;
  actividades_culminadas: number;
  avance_area: number;
  actividades: Actividad[];
}

export interface ProjectManagerData {
  aplicativo: ProjectManagerAplicativoInfo;
  indicadores: ProjectManagerIndicadores;
  ciclo_de_vida_por_areas: CicloDeVidaArea[];
}

export interface ProjectManagerResumenItem {
  aplicativo_id: number;
  nombre_aplicativo: string;
  alias: string;
  gerencia: string;
  gerencia_sigla?: string | null;
  gerencia_nombre?: string | null;
  responsable: string;
  avance_total: number;
  avance_pendiente: number;
  metricas: ProjectManagerMetricas;
}

export interface ProjectManagerMutationResponse {
  status: string;
  message: string;
  data: {
    actividad: Actividad;
    nuevo_avance_aplicativo: number;
    nuevo_avance_pendiente: number;
  };
}

