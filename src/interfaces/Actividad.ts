import type { Gerencia } from "./Gerencia";
import type { Area } from "./Area";

export interface Actividad {
    id: number;
    nombre_actividad: string;
    fecha_creacion: string;
    fecha_culminacion?: string;
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
    estado: 'PENDIENTE' | 'CULMINADO' | 'ATRASADO';
    porcentaje: number | null;
    completado: boolean;
    comentarios?: string;
    area_id: number;
    aplicativo_id: number;
    gerencias_colaboradoras?: Gerencia[];
    area?: Area;
}