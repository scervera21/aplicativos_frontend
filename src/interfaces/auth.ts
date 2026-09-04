// Interfaz para definir la estructura de un permiso.
export interface Permission {
  id: number;
  name: string;
  category: 'access' | 'action';
  module: string;
  status: boolean;
}

// Interfaz para definir la estructura de un rol.
export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}


// Interfaz para definir la estructura de un usuario.
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: boolean;
  roles: Role[];
  password_changed?: string | null
}

// Interfaz para definir la estructura de la respuesta del login.
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Interfaz para definir la estructura del payload del token JWT.
export interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
}