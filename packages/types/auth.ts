export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean | null;
  profileImageUrl: string | null;
  role: string;
  createdAt: Date | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthContext {
  user: AuthUser;
  session: AuthSession;
}

export interface SignInResult {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}
