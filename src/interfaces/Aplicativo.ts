
export interface DetalleAplicativo {
    descripcion?: string;
    pap?: boolean;
    estatus?: string;
    lenguajes_frontend?: string;
    lenguajes_backend?: string;
    bases_datos?: string;
    observaciones?: string;
}

export interface Aplicativo {
    id: number;
    nombre_aplicativo: string;
    alias: string;
    responsable: string;
    fecha_inicio: string;
    fecha_fin: string;
    gerencia_responsable?: string | null;   // nombre de la gerencia responsable para mostrarlo en el frontend
    gerencia_id?: number;   // id de la gerencia responsable para ignorarla al actualizar la gerencia
    avanceAplicativo?: number;
    detalles?: DetalleAplicativo[];
}