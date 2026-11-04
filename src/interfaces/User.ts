/**
 * Se define los tipos para que TypeScript pueda validar las propiedades que
 * devuelve el backend y que serán utilizadas en los componentes. 
 */

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  gerencia_id: number;  // id de la gerencia responsable para ignorarla al actualizar
  gerencia?: {    // desglose de la gerencia responsable que permite mostrar el nombre y la sigla en el frontend
    id: number;
    nombre_gerencia: string;
    sigla: string;
  };
  roles?: (Role | string)[]; 
  permissions?: (Permission | string)[];
}