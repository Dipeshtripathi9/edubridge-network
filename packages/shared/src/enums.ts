// Mirrors the Prisma enums in apps/backend/prisma/schema.prisma.
// Keep in sync with the schema.

export enum UserRole {
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  PHONE = 'PHONE',
}

export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  SCHOLARSHIP = 'SCHOLARSHIP',
  COMPETITION = 'COMPETITION',
  FELLOWSHIP = 'FELLOWSHIP',
  RESEARCH = 'RESEARCH',
}

export enum ReviewCategory {
  PLACEMENT = 'PLACEMENT',
  HOSTEL = 'HOSTEL',
  FACULTY = 'FACULTY',
  CAMPUS_LIFE = 'CAMPUS_LIFE',
}

export enum ResourceType {
  NOTES = 'NOTES',
  PDF = 'PDF',
  ROADMAP = 'ROADMAP',
  PLACEMENT_REPORT = 'PLACEMENT_REPORT',
  STUDY_MATERIAL = 'STUDY_MATERIAL',
}

export enum TransferStatus {
  EXPLORING = 'EXPLORING',
  ELIGIBLE = 'ELIGIBLE',
  APPLIED = 'APPLIED',
  COMPLETED = 'COMPLETED',
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  MENTION = 'MENTION',
  MESSAGE = 'MESSAGE',
  FOLLOW = 'FOLLOW',
  SCHOLARSHIP = 'SCHOLARSHIP',
  INTERNSHIP_DEADLINE = 'INTERNSHIP_DEADLINE',
  TRANSFER_UPDATE = 'TRANSFER_UPDATE',
  BADGE_EARNED = 'BADGE_EARNED',
  SYSTEM = 'SYSTEM',
}

export enum BadgeTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}
