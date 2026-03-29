"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueAgentRewards = void 0;
const storage_1 = require("./storage");
const rewards_1 = require("./rewards");
const onchain_1 = require("./onchain");
const DEFAULT_TREASURY = '0xf31f59e7b8b58555f7871f71973a394c4c8f1bffe5';
class BlueAgentRewards {
    constructor(config) {
        this.config = {
            feePercent: 5,
            treasuryAddress: DEFAULT_TREASURY,
            dataDir: './data',
            ...config,
        };
        this.storage = new storage_1.Storage(this.config.dataDir);
        this.rewards = new rewards_1.RewardsService(this.storage);
        this.onchain = new onchain_1.OnchainService(this.config.rewardWalletPrivateKey);
    }
    async award(userId, activity, customPts) {
        return this.rewards.award(String(userId), activity, customPts);
    }
    async getPoints(userId) {
        return this.rewards.getPoints(String(userId));
    }
    async getStreak(userId) {
        return this.rewards.getStreak(String(userId));
    }
    async hasCheckedInToday(userId) {
        return this.rewards.hasCheckedInToday(String(userId));
    }
    async getLeaderboard(limit = 10) {
        return this.rewards.getLeaderboard(limit);
    }
    async claim(userId, walletAddress) {
        const uid = String(userId);
        const user = this.storage.getUser(uid);
        if (!user) {
            return { success: false, userId: uid, walletAddress, tokensUser: 0n, tokensFee: 0n, error: 'User not found' };
        }
        const { ok, reason, daysLeft } = this.rewards.canClaim(user);
        if (!ok) {
            return {
                success: false, userId: uid, walletAddress,
                tokensUser: 0n, tokensFee: 0n,
                error: daysLeft ? `${reason} — ${daysLeft} days left` : reason,
            };
        }
        const claimAmount = this.rewards.calculateClaimAmount(user);
        if (claimAmount === 0n) {
            return { success: false, userId: uid, walletAddress, tokensUser: 0n, tokensFee: 0n, error: 'Nothing to claim' };
        }
        try {
            const { txHashUser, txHashFee, amountUser, amountFee } = await this.onchain.transferWithFee(walletAddress, this.config.treasuryAddress, claimAmount, this.config.feePercent);
            // Deduct points after successful transfer
            this.rewards.deductPoints(uid, user.points);
            return {
                success: true,
                userId: uid,
                walletAddress,
                tokensUser: amountUser,
                tokensFee: amountFee,
                txHash: txHashUser,
            };
        }
        catch (e) {
            return {
                success: false, userId: uid, walletAddress,
                tokensUser: 0n, tokensFee: 0n,
                error: e.message,
            };
        }
    }
}
exports.BlueAgentRewards = BlueAgentRewards;
//# sourceMappingURL=index.js.map