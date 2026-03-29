"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
// Constants
const ACTIVITY_POINTS = {
    checkin: 5,
    trivia_win: 25,
    submit: 20,
    referral: 50,
    weekly_top: 100,
    custom: 0,
};
const TOKENS_PER_POINT = 1000n; // 1 pt = 1,000 $BLUEAGENT (18 decimals handled separately)
const MIN_CLAIM_POINTS = 100;
const CLAIM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const OG_LIMIT = 100;
const OG_MULTIPLIER = 2;
class RewardsService {
    constructor(storage) {
        this.storage = storage;
    }
    getOrCreateUser(userId) {
        const existing = this.storage.getUser(userId);
        if (existing)
            return existing;
        const userCount = this.storage.getUserCount();
        const isOG = userCount < OG_LIMIT;
        const user = {
            id: userId,
            points: 0,
            streak: 0,
            lastCheckin: 0,
            lastClaim: 0,
            claimedTotal: 0,
            joinedAt: Date.now(),
            isOG,
        };
        this.storage.saveUser(user);
        return user;
    }
    updateStreak(user) {
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const yesterday = todayStart - 86400000;
        const wasYesterday = user.lastCheckin >= yesterday && user.lastCheckin < todayStart;
        const newStreak = wasYesterday ? user.streak + 1 : 1;
        const streakBonus = newStreak >= 3 ? 3 : 0;
        return { newStreak, streakBonus };
    }
    getStreakMultiplier(streak) {
        if (streak >= 14)
            return 2.0;
        if (streak >= 7)
            return 1.5;
        return 1.0;
    }
    async award(userId, activity, customPts) {
        const user = this.getOrCreateUser(userId);
        let basePoints = activity === 'custom' ? (customPts || 0) : ACTIVITY_POINTS[activity];
        let streakBonus = 0;
        // Update streak for checkin
        if (activity === 'checkin') {
            const todayStart = new Date().setHours(0, 0, 0, 0);
            if (user.lastCheckin >= todayStart) {
                // Already checked in today
                return {
                    userId,
                    activity,
                    pointsAwarded: 0,
                    totalPoints: user.points,
                    streak: user.streak,
                    streakBonus: 0,
                    isOG: user.isOG || false,
                };
            }
            const { newStreak, streakBonus: sb } = this.updateStreak(user);
            user.streak = newStreak;
            user.lastCheckin = Date.now();
            streakBonus = sb;
        }
        const totalAwarded = basePoints + streakBonus;
        user.points += totalAwarded;
        this.storage.saveUser(user);
        return {
            userId,
            activity,
            pointsAwarded: totalAwarded,
            totalPoints: user.points,
            streak: user.streak,
            streakBonus,
            isOG: user.isOG || false,
        };
    }
    async getPoints(userId) {
        const user = this.storage.getUser(userId);
        return user?.points || 0;
    }
    async getStreak(userId) {
        const user = this.storage.getUser(userId);
        return user?.streak || 0;
    }
    async hasCheckedInToday(userId) {
        const user = this.storage.getUser(userId);
        if (!user)
            return false;
        const todayStart = new Date().setHours(0, 0, 0, 0);
        return user.lastCheckin >= todayStart;
    }
    async getLeaderboard(limit = 10) {
        const users = this.storage.loadUsers();
        return Object.values(users)
            .filter(u => u.points > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, limit)
            .map((u, i) => ({ userId: u.id, points: u.points, streak: u.streak, rank: i + 1 }));
    }
    calculateClaimAmount(user) {
        const pts = user.points;
        if (pts < MIN_CLAIM_POINTS)
            return 0n;
        const streakMult = this.getStreakMultiplier(user.streak);
        const ogMult = user.isOG ? OG_MULTIPLIER : 1;
        // Tier bonus
        let tierBonus = 1.0;
        if (pts >= 1000)
            tierBonus = 1.2;
        else if (pts >= 500)
            tierBonus = 1.1;
        const totalMult = streakMult * ogMult * tierBonus;
        const tokens = Math.floor(pts * totalMult) * Number(TOKENS_PER_POINT);
        // Convert to 18 decimals
        return BigInt(tokens) * (10n ** 18n);
    }
    canClaim(user) {
        if (user.points < MIN_CLAIM_POINTS) {
            return { ok: false, reason: `Need at least ${MIN_CLAIM_POINTS} pts to claim` };
        }
        const now = Date.now();
        const cooldownLeft = user.lastClaim + CLAIM_COOLDOWN_MS - now;
        if (user.lastClaim > 0 && cooldownLeft > 0) {
            const daysLeft = Math.ceil(cooldownLeft / 86400000);
            return { ok: false, reason: `Cooldown active`, daysLeft };
        }
        return { ok: true };
    }
    deductPoints(userId, amount) {
        const user = this.storage.getUser(userId);
        if (!user)
            return;
        user.claimedTotal = (user.claimedTotal || 0) + amount;
        user.points = 0;
        user.lastClaim = Date.now();
        this.storage.saveUser(user);
    }
}
exports.RewardsService = RewardsService;
//# sourceMappingURL=rewards.js.map