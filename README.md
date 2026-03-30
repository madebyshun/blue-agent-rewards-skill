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
| `feePercent` | number | `5` (or `2` if creator set) | % sent to Blue Agent treasury |
| `creatorAddress` | string | — | Creator/agent wallet — earns 3% of every claim. Can be a human wallet (project owner) or an agent wallet (autonomous agent) |
| `creatorFeePercent` | number | `3` | % sent to creator (only if `creatorAddress` set) |
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

**Without `creatorAddress`:**
```
User claims 1,000,000 $BLUEAGENT
├── 950,000 → user wallet      (95%)
└──  50,000 → treasury         (5%)
```

**With `creatorAddress`:**
```
User claims 1,000,000 $BLUEAGENT
├── 920,000 → user wallet      (92%)
├──  30,000 → creator wallet   (3%)
└──  50,000 → treasury         (5%)
```

`creatorAddress` can be:
- **A human wallet** — project owner earns 3% from their community
- **An agent wallet** — autonomous agent earns 3% and self-funds operations

The more users claim, the more the creator/agent earns — automatically, onchain, no manual intervention.

Treasury fee goes to Blue Agent for ecosystem development and token burns.

## Use Cases

**1. Community Bot (human creator)**
```typescript
// Project owner earns 3% from their community
const rewards = new BlueAgentRewards({
  agentId: 'my-project-bot',
  rewardWalletPrivateKey: '...',
  rewardWalletAddress: '...',
  creatorAddress: '0xPROJECT_OWNER_WALLET',
})
```

**2. Autonomous Agent**
```typescript
// Agent has its own wallet and earns 3% to self-fund operations
const rewards = new BlueAgentRewards({
  agentId: 'my-ai-agent',
  rewardWalletPrivateKey: '...',
  rewardWalletAddress: '...',
  creatorAddress: '0xAGENT_WALLET', // agent's own wallet
})
// The more users claim → the more the agent earns → agent self-sustains
```

**3. No creator (pure community)**
```typescript
// 95% user / 5% treasury — no one earns extra
const rewards = new BlueAgentRewards({
  agentId: 'my-bot',
  rewardWalletPrivateKey: '...',
  rewardWalletAddress: '...',
  // no creatorAddress
})
```

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

## For Agents — Earn $BLUEAGENT

Agents on Bankr can stake $BLUEAGENT and earn weekly rewards from the Blue Agent community pool.

**Every user claim → 5% goes to Agent Rewards Pool → distributed to staked agents weekly.**

### Step 1: Install

```bash
git clone https://github.com/madebyshun/blue-agent-rewards-skill
cd blue-agent-rewards-skill
npm install
```

### Step 2: Stake

```bash
PRIVATE_KEY=0xYOUR_AGENT_WALLET_KEY npm run stake -- --amount 10000000
```

Staking tiers:
- 10M $BLUEAGENT → weight 1x
- 50M $BLUEAGENT → weight 2x
- 100M $BLUEAGENT → weight 3x
- 500M $BLUEAGENT → weight 5x

### Step 3: Claim weekly rewards

```bash
PRIVATE_KEY=0xYOUR_AGENT_WALLET_KEY npm run claim
```

**Rewards Contract:** `0x9daD1E3501e3322bA834D1269eC8C3105d4752F8` on Base

## Community

- Telegram: [t.me/blueagent_hub](https://t.me/blueagent_hub)
- Bot: [@Blockyagent_beta_bot](https://t.me/Blockyagent_beta_bot)
- X: [@blocky_agent](https://x.com/blocky_agent)

---

*Built by Blocky Studio · Powered by Bankr · Base*
