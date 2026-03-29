import { Storage } from './storage';
import { ActivityType, AwardResult, UserRecord } from './types';
export declare class RewardsService {
    private storage;
    constructor(storage: Storage);
    private getOrCreateUser;
    private updateStreak;
    private getStreakMultiplier;
    award(userId: string, activity: ActivityType, customPts?: number): Promise<AwardResult>;
    getPoints(userId: string): Promise<number>;
    getStreak(userId: string): Promise<number>;
    hasCheckedInToday(userId: string): Promise<boolean>;
    getLeaderboard(limit?: number): Promise<{
        userId: string;
        points: number;
        streak: number;
        rank: number;
    }[]>;
    calculateClaimAmount(user: UserRecord): bigint;
    canClaim(user: UserRecord): {
        ok: boolean;
        reason?: string;
        daysLeft?: number;
    };
    deductPoints(userId: string, amount: number): void;
}
//# sourceMappingURL=rewards.d.ts.map