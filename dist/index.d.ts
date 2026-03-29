import { ActivityType, AwardResult, ClaimResult, LeaderboardEntry, RewardsConfig } from './types';
export declare class BlueAgentRewards {
    private storage;
    private rewards;
    private onchain;
    private config;
    constructor(config: RewardsConfig);
    award(userId: number | string, activity: ActivityType, customPts?: number): Promise<AwardResult>;
    getPoints(userId: number | string): Promise<number>;
    getStreak(userId: number | string): Promise<number>;
    hasCheckedInToday(userId: number | string): Promise<boolean>;
    getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
    claim(userId: number | string, walletAddress: string): Promise<ClaimResult>;
}
export type { ActivityType, AwardResult, ClaimResult, LeaderboardEntry, RewardsConfig };
//# sourceMappingURL=index.d.ts.map