// Per-community capability model — locks each management action to the role
// whose job it is. Campus Lead and the community ADMIN are full leads; the other
// heads are scoped to their named responsibility; Moderator handles moderation.

export type CommunityCapability =
  | 'MANAGE_MEMBERS' // assign roles
  | 'MODERATE' // mute/ban, resolve reports, pin/remove posts
  | 'APPROVE_OPPORTUNITY' // approve/reject opportunity submissions
  | 'RESOLVE_HELP' // resolve help requests
  | 'ANNOUNCE' // post announcements
  | 'VIEW'; // view the management dashboard

const FULL: CommunityCapability[] = [
  'MANAGE_MEMBERS',
  'MODERATE',
  'APPROVE_OPPORTUNITY',
  'RESOLVE_HELP',
  'ANNOUNCE',
  'VIEW',
];

export const ROLE_CAPABILITIES: Record<string, CommunityCapability[]> = {
  ADMIN: FULL, // community admin (creator) — full control
  CAMPUS_LEAD: FULL, // 👑 overall community lead — full control
  OPPORTUNITY_HEAD: ['APPROVE_OPPORTUNITY', 'VIEW'], // 💼
  STUDENT_RELATIONS_HEAD: ['RESOLVE_HELP', 'VIEW'], // 🤝
  MODERATOR: ['MODERATE', 'VIEW'], // 🛡
  MEMBER: [],
};

export function roleHasCapability(
  role: string | null | undefined,
  cap: CommunityCapability,
): boolean {
  return !!role && (ROLE_CAPABILITIES[role] ?? []).includes(cap);
}

/** Platform-wide admins bypass community capability checks. */
export const isPlatformAdmin = (globalRole?: string) =>
  globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN';
