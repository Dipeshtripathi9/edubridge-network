export const INTEREST_OPTIONS = [
  'Placement',
  'DSA',
  'AI',
  'Startups',
  'Research',
  'Internships',
  'Higher Studies',
  'Transfer',
  'Data Science',
  'Web Development',
  'Competitive Programming',
  'Open Source',
] as const;

export type Interest = (typeof INTEREST_OPTIONS)[number];

/** Reputation points awarded per action (Module 7). */
export const REPUTATION_POINTS = {
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
  HELPFUL_ANSWER: 10,
  REVIEW_CREATED: 20,
  RESOURCE_UPLOADED: 15,
  RECEIVED_LIKE: 1,
} as const;

export const BADGE_KEYS = {
  CONTRIBUTOR: 'contributor',
  CAMPUS_EXPERT: 'campus_expert',
  PLACEMENT_EXPERT: 'placement_expert',
  TRANSFER_EXPERT: 'transfer_expert',
  COMMUNITY_LEADER: 'community_leader',
} as const;

export const TOPIC_COMMUNITIES = [
  'AI',
  'DSA',
  'Startups',
  'Placement',
  'Data Science',
] as const;

export const API_VERSION = 'v1';
