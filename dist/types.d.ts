export type ActivityType = 'checkin' | 'trivia_win' | 'submit' | 'referral' | 'weekly_top' | 'custom';
export interface UserRecord {
    id: string;
    points: number;
    streak: number;
    lastCheckin: number;
    lastClaim: number;
    claimedTotal: number;
    joinedAt: number;
    walletAddress?: string;
    isOG?: boolean;
}
export interface AwardResult {
    userId: string;
    activity: ActivityType;
    pointsAwarded: number;
    totalPoints: number;
    streak: number;
    streakBonus: number;
    isOG: boolean;
}
export interface ClaimResult {
    success: boolean;
    userId: string;
    walletAddress: string;
    tokensUser: bigint;
    tokensFee: bigint;
    txHash?: string;
    error?: string;
}
export interface LeaderboardEntry {
    userId: string;
    points: number;
    streak: number;
    rank: number;
}
export interface RewardsConfig {
    rewardWalletPrivateKey: string;
    rewardWalletAddress: string;
    agentId: string;
    feePercent?: number;
    treasuryAddress?: string;
    dataDir?: string;
}
//# sourceMappingURL=types.d.ts.map