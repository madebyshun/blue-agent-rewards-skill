import { Storage } from './storage'
import { RewardsService } from './rewards'
import { OnchainService } from './onchain'
import {
  ActivityType,
  AwardResult,
  ClaimResult,
  LeaderboardEntry,
  RewardsConfig,
} from './types'

const DEFAULT_TREASURY = '0xf31f59e7b8b58555f7871f71973a394c4c8f1bffe5'

export class BlueAgentRewards {
  private storage: Storage
  private rewards: RewardsService
  private onchain: OnchainService
  private config: Required<RewardsConfig>

  constructor(config: RewardsConfig) {
    const hasCreator = !!config.creatorAddress
    this.config = {
      feePercent: hasCreator ? 2 : 5,   // 2% treasury if creator set, else 5%
      creatorAddress: '',
      creatorFeePercent: hasCreator ? 3 : 0,
      treasuryAddress: DEFAULT_TREASURY,
      dataDir: './data',
      ...config,
    }

    this.storage = new Storage(this.config.dataDir)
    this.rewards = new RewardsService(this.storage)
    this.onchain = new OnchainService(this.config.rewardWalletPrivateKey)
  }

  async award(
    userId: number | string,
    activity: ActivityType,
    customPts?: number
  ): Promise<AwardResult> {
    return this.rewards.award(String(userId), activity, customPts)
  }

  async getPoints(userId: number | string): Promise<number> {
    return this.rewards.getPoints(String(userId))
  }

  async getStreak(userId: number | string): Promise<number> {
    return this.rewards.getStreak(String(userId))
  }

  async hasCheckedInToday(userId: number | string): Promise<boolean> {
    return this.rewards.hasCheckedInToday(String(userId))
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return this.rewards.getLeaderboard(limit)
  }

  async claim(userId: number | string, walletAddress: string): Promise<ClaimResult> {
    const uid = String(userId)
    const user = this.storage.getUser(uid)

    if (!user) {
      return { success: false, userId: uid, walletAddress, tokensUser: 0n, tokensFee: 0n, error: 'User not found' }
    }

    const { ok, reason, daysLeft } = this.rewards.canClaim(user)
    if (!ok) {
      return {
        success: false, userId: uid, walletAddress,
        tokensUser: 0n, tokensFee: 0n,
        error: daysLeft ? `${reason} — ${daysLeft} days left` : reason,
      }
    }

    const claimAmount = this.rewards.calculateClaimAmount(user)
    if (claimAmount === 0n) {
      return { success: false, userId: uid, walletAddress, tokensUser: 0n, tokensFee: 0n, error: 'Nothing to claim' }
    }

    try {
      const { txHashUser, txHashFee, txHashCreator, amountUser, amountFee, amountCreator } = await this.onchain.transferWithFee(
        walletAddress,
        this.config.treasuryAddress,
        claimAmount,
        this.config.feePercent,
        this.config.creatorAddress || undefined,
        this.config.creatorFeePercent
      )

      // Deduct points after successful transfer
      this.rewards.deductPoints(uid, user.points)

      return {
        success: true,
        userId: uid,
        walletAddress,
        tokensUser: amountUser,
        tokensFee: amountFee,
        tokensCreator: amountCreator,
        txHash: txHashUser,
        txHashCreator: txHashCreator || undefined,
      }
    } catch (e: any) {
      return {
        success: false, userId: uid, walletAddress,
        tokensUser: 0n, tokensFee: 0n,
        error: e.message,
      }
    }
  }
}

// Re-export types
export type { ActivityType, AwardResult, ClaimResult, LeaderboardEntry, RewardsConfig }
