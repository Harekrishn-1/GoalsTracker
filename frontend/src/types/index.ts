export type GoalCategory = 'Personal' | 'Study' | 'Work' | 'Health' | string;

export interface Goal {
    _id: string;
    title: string;
    category: GoalCategory;
    startTime?: string;
    endTime?: string;
    date: string;
    progress: number;
    submitted: boolean;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TargetGoal {
    _id: string;
    title: string;
    category: GoalCategory;
    deadline: string; // 'YYYY-MM-DD'
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
    remindersEnabled: boolean;
    remindersSent?: {
        twoDay: boolean;
        oneDay: boolean;
        zeroDay: boolean;
    };
    notes?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTargetGoalPayload {
    title: string;
    category?: GoalCategory;
    deadline: string;
    progress?: number;
    remindersEnabled?: boolean;
    notes?: string;
}

export interface UpdateTargetGoalPayload {
    id: string;
    updates: Partial<Pick<TargetGoal, 'title' | 'category' | 'deadline' | 'progress' | 'remindersEnabled' | 'notes'>>;
}

export interface User {
    _id: string;
    firstName: string;
    emailId: string;
    role: 'user' | 'admin' | string;
}

export interface AdminStats {
    totalUsers: number;
    activeToday: number;
    activeThisWeek: number;
    newThisWeek: number;
    totalGoals: number;
    goalsCompleted: number;
    completionRate: number;
}

export interface MotivationalQuote {
    id: string;
    quote: string;
    author: string;
}

export interface NudgeToast {
    id: string;
    text: string;
}

export interface RegisterCredentials {
    firstName: string;
    emailId: string;
    password: string;
}

export interface LoginCredentials {
    emailId: string;
    password: string;
}

export interface CreateGoalPayload {
    title: string;
    category?: GoalCategory;
    date: string;
    progress?: number;
    startTime?: string;
    endTime?: string;
}

export interface EditGoalPayload {
    id: string;
    updates: Partial<Pick<Goal, 'title' | 'category' | 'startTime' | 'endTime' | 'progress'>>;
}

export interface CopyGoalsPayload {
    fromDate: string;
    toDate: string;
    goalIds: string[];
}
