import { CommunityType, PostType, UserRole, UserStatus } from './enums';

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

export interface CommunitySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: CommunityType;
  topic?: string | null;
  memberCount: number;
  postCount: number;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  isMember?: boolean;
}

export interface PostSummary {
  id: string;
  type: PostType;
  title?: string | null;
  body: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  createdAt: string;
  author: {
    id: string;
    reputationPoints?: number;
    profile?: { fullName: string; username?: string | null; avatarUrl?: string | null } | null;
  };
}
