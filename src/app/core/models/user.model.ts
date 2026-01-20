export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
  role?: Role;
}

export interface Client {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  dateNaissance: string;
  city: string;
  nationality: string;
  numberNationality: number;
}
