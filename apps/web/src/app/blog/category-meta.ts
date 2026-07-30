export type BlogCategory = 'CAREER' | 'COLLEGE' | 'JOB';

export const CATEGORY_META: Record<BlogCategory, { label: string; tagClass: 'tagCareer' | 'tagCollege' | 'tagJob' }> = {
  CAREER: { label: 'Career', tagClass: 'tagCareer' },
  COLLEGE: { label: 'College', tagClass: 'tagCollege' },
  JOB: { label: 'Job', tagClass: 'tagJob' },
};
