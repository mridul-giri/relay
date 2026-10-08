export interface Merchant {
  id: string;
  name: string;
  email: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  merchant: Merchant;
  token: string;
}
