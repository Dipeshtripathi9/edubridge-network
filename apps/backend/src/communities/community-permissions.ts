// Per-community capability model — locks each management action to the role
// whose job it is. Campus Lead and the community ADMIN are full leads; the other
// heads are scoped to their named responsibility; Moderator handles moderation.

export type CommunityCapability =
  | 'MODERATE' // mute/ban, resolve reports, pin/remove posts
  | 'APPROVE_OPPORTUNITY' // approve/reject opportunity submissions
  | 'RESOLVE_HELP' // resolve help requests
  | 'ANNOUNCE' // post announcements
  | 'VIEW'; // view the management dashboard

// NOTE: assigning/removing roles (MANAGE_MEMBERS) is intentionally NOT a
// community capability — only platform admins manage roles. Community managers
// can run their community but can never change anyone's role.
const FULL: CommunityCapability[] = ['MODERATE', 'APPROVE_OPPORTUNITY', 'RESOLVE_HELP', 'ANNOUNCE', 'VIEW'];

export const ROLE_CAPABILITIES: Record<string, CommunityCapability[]> = {
  ADMIN: FULL, // community admin (creator) — runs the community (no role changes)
  CAMPUS_LEAD: FULL, // 👑 overall community lead (no role changes)
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
