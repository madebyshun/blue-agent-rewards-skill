export type ActivityType =
  | 'checkin'     // +5 pts
  | 'trivia_win'  // +25 pts
  | 'submit'      // +20 pts
  | 'referral'    // +50 pts
  | 'weekly_top'  // +100 pts
  | 'custom'      // custom pts

export interface UserRecord {
  id: string
  points: number
  streak: number
  lastCheckin: number
  lastClaim: number
  claimedTotal: number
  joinedAt: number
  walletAddress?: string
  isOG?: boolean
}

export interface AwardResult {
  userId: string
  activity: ActivityType
  pointsAwarded: number
  totalPoints: number
  streak: number
  streakBonus: number
  isOG: boolean
}

export interface ClaimResult {
  success: boolean
  userId: string
  walletAddress: string
  tokensUser: bigint
  tokensFee: bigint
  txHash?: string
  error?: string
}

export interface LeaderboardEntry {
  userId: string
  points: number
  streak: number
  rank: number
}

export interface RewardsConfig {
  rewardWalletPrivateKey: string
  rewardWalletAddress: string
  agentId: string
  feePercent?: number
  treasuryAddress?: string
  dataDir?: string
}
