export type MealStatus = 'ON_TIME' | 'LATE' | 'SKIPPED';

export type PrivacyMode = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

export type InteractionType = 'LIKE' | 'COMMENT' | 'NUDGE';

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface DailyLog {
  id: number;
  userId: number;
  logDate: string;
  ateOnTime: MealStatus;
  ateOnTimeLabel?: string;
  hadSnacks: boolean;
  studyMinutes: number;
  note?: string;
}

export interface CustomTask {
  id: number;
  title: string;
  category?: string;
  targetTime?: string;
  isCompleted: boolean;
}

export interface ProofPost {
  id: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  dailyLogId?: number;
  imageUrl: string;
  caption?: string;
  privacyMode: PrivacyMode;
  privacyModeLabel?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  nudgeCount: number;
  likedByCurrentUser: boolean;
}

export interface Interaction {
  id: number;
  postId: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  type: InteractionType;
  content?: string;
  createdAt: string;
}
