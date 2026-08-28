export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
  roles: string[];
  permissions: {
    access: string[];
    actions: string[];
  };
}