import { UserRole, UserStatus } from './enums';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  total?: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PublicUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  reputationPoints: number;
  profile?: PublicProfile | null;
}

export interface PublicProfile {
  fullName: string;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  collegeId?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  cgpa?: number | null;
  state?: string | null;
  city?: string | null;
  interests: string[];
}

export interface AuthResult {
  tokens: AuthTokens;
  user: PublicUser;
}

