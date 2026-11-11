export interface DetalleAplicativo {
    descripcion?: string;
    pap?: boolean;
    estatus?: string;
    lenguajes_frontend?: string;
    lenguajes_backend?: string;
    bases_datos?: string;
    observaciones?: string;
}

export interface MetricasActividadesAplicativo {
    total: number;
    culminadas: number;
    pendientes: number;
    atrasadas: number;
}

export interface Aplicativo {
    id: number;
    nombre_aplicativo: string;
    alias: string;
    responsable: string;
    fecha_inicio: string;
    fecha_fin: string;
    gerencia_responsable?: string | null;   // sigla o nombre de la gerencia responsable para mostrarlo en el frontend
    gerencia_sigla?: string | null;
    gerencia_nombre?: string | null;
    gerencia?: {
        id: number;
        nombre_gerencia: string;
        sigla?: string | null;
    } | null;
    gerencia_id?: number;   // id de la gerencia responsable para ignorarla al actualizar la gerencia
    avance_total?: number;
    avance_pendiente?: number;
    metricas_actividades?: MetricasActividadesAplicativo;
    avanceAplicativo?: number; // compatibilidad legacy
    detalles?: DetalleAplicativo[];
    descripcion?: string;
    pap?: boolean;
    estatus?: string;
}
