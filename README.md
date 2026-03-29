# @blueagent/rewards-skill

> Plug-and-play $BLUEAGENT rewards for any Telegram bot or AI agent on Base.

Give your users real onchain rewards — without building a token system from scratch.

## Install

```bash
npm install github:madebyshun/blue-agent-rewards-skill
```

## Quick Start

```typescript
import { BlueAgentRewards } from '@blueagent/rewards-skill'

const rewards = new BlueAgentRewards({
  rewardWalletPrivateKey: process.env.REWARD_WALLET_KEY!,
  rewardWalletAddress: process.env.REWARD_WALLET_ADDRESS!,
  agentId: 'my-bot',
})

// Daily check-in
bot.command('checkin', async (ctx) => {
  const result = await rewards.award(ctx.from.id, 'checkin')
  if (result.pointsAwarded === 0) {
    ctx.reply('Already checked in today!')
    return
  }
  ctx.reply(`✅ +${result.pointsAwarded} pts! Total: ${result.totalPoints} pts`)
})

// Claim $BLUEAGENT
bot.command('claim', async (ctx) => {
  const result = await rewards.claim(ctx.from.id, '0xYOUR_WALLET')
  if (result.success) {
    ctx.reply(`🎉 Claimed! Tx: ${result.txHash}`)
  } else {
    ctx.reply(`❌ ${result.error}`)
  }
})
```

## API

### `new BlueAgentRewards(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `rewardWalletPrivateKey` | string | required | Wallet holding $BLUEAGENT to distribute |
| `rewardWalletAddress` | string | required | Address of reward wallet |
| `agentId` | string | required | Unique identifier for your agent |
| `feePercent` | number | `5` | % sent to Blue Agent treasury |
| `treasuryAddress` | string | Blue Agent treasury | Where fees go |
| `dataDir` | string | `./data` | Directory for user data storage |

### `award(userId, activity, customPts?)`

Award points to a user.

```typescript
const result = await rewards.award(userId, 'checkin')
// result.pointsAwarded — pts earned this action
// result.totalPoints  — total pts balance
// result.streak       — current streak days
// result.isOG         — OG Builder status (2x multiplier)
```

**Activity types & default points:**

| Activity | Points |
|---|---|
| `checkin` | +5 pts |
| `trivia_win` | +25 pts |
| `submit` | +20 pts |
| `referral` | +50 pts |
| `weekly_top` | +100 pts |
| `custom` | custom via `customPts` |

### `claim(userId, walletAddress)`

Transfer $BLUEAGENT onchain to user.

```typescript
const result = await rewards.claim(userId, '0x...')
// result.success      — true/false
// result.tokensUser   — tokens sent to user (BigInt, 18 decimals)
// result.tokensFee    — tokens sent to treasury (BigInt)
// result.txHash       — transaction hash on Base
// result.error        — error message if failed
```

### `getPoints(userId)` → `number`
### `getStreak(userId)` → `number`
### `hasCheckedInToday(userId)` → `boolean`
### `getLeaderboard(limit?)` → `LeaderboardEntry[]`

## How Fees Work

Every claim is split automatically:

```
User claims 1,000,000 $BLUEAGENT
├── 950,000 → user wallet  (95%)
└──  50,000 → Blue Agent treasury (5%)
```

Fee goes to Blue Agent treasury, used for burns and ecosystem development.

## Multipliers

| Condition | Multiplier |
|---|---|
| OG Builder (first 100 users) | ×2 forever |
| 7-day streak | ×1.5 |
| 14-day streak | ×2.0 |
| Streak ≥ 3 days | +3 pts bonus |
| Claim 500+ pts | +10% bonus |
| Claim 1000+ pts | +20% bonus |

## $BLUEAGENT Token

- **Contract:** `0xf895783b2931c919955e18b5e3343e7c7c456ba3`
- **Chain:** Base · Uniswap v4
- **Rate:** 1 pt = 1,000 $BLUEAGENT
- **Min claim:** 100 pts = 100,000 $BLUEAGENT
- **Cooldown:** 7 days between claims

## Community

- Telegram: [t.me/blueagent_hub](https://t.me/blueagent_hub)
- Bot: [@Blockyagent_beta_bot](https://t.me/Blockyagent_beta_bot)
- X: [@blocky_agent](https://x.com/blocky_agent)

---

*Built by Blocky Studio · Powered by Bankr · Base*
