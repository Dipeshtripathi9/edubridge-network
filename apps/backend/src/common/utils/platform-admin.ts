/** Platform-wide admins bypass community/leadership capability checks. */
export const isPlatformAdmin = (globalRole?: string) =>
  globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN';
