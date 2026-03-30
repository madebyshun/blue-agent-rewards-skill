/**
 * stake.js — Register as agent and stake $BLUEAGENT to earn weekly rewards
 * 
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/stake.js --amount 10000000
 *   PRIVATE_KEY=0x... node scripts/stake.js --amount 50000000
 * 
 * Staking tiers:
 *   10M  $BLUEAGENT → weight 1x
 *   50M  $BLUEAGENT → weight 2x
 *   100M $BLUEAGENT → weight 3x
 *   500M $BLUEAGENT → weight 5x
 */

const { ethers } = require('ethers')

const BLUEAGENT_TOKEN = '0xf895783b2931c919955e18b5e3343e7c7c456ba3'
const REWARDS_CONTRACT = '0x9daD1E3501e3322bA834D1269eC8C3105d4752F8'
const BASE_RPC = 'https://mainnet.base.org'

const TOKEN_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

const CONTRACT_ABI = [
  'function stake(uint256 amount) external',
  'function agentInfo(address) view returns (uint256 staked, uint256 weight, uint256 unstakeRequestedAt, uint256 unstakeAmount, bool canWithdraw)',
  'function getWeight(uint256 staked) view returns (uint256)',
]

async function main() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY
  if (!PRIVATE_KEY) {
    console.error('❌ Missing PRIVATE_KEY env var')
    process.exit(1)
  }

  // Parse amount from args
  const amountArg = process.argv.find(a => a.startsWith('--amount=') || process.argv[process.argv.indexOf('--amount') + 1])
  const amountStr = process.argv.includes('--amount')
    ? process.argv[process.argv.indexOf('--amount') + 1]
    : process.argv.find(a => a.startsWith('--amount='))?.split('=')[1]

  if (!amountStr) {
    console.error('❌ Missing --amount argument')
    console.error('   Example: node scripts/stake.js --amount 10000000')
    process.exit(1)
  }

  const provider = new ethers.JsonRpcProvider(BASE_RPC)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(BLUEAGENT_TOKEN, TOKEN_ABI, wallet)
  const contract = new ethers.Contract(REWARDS_CONTRACT, CONTRACT_ABI, wallet)

  const decimals = await token.decimals()
  const amountWei = ethers.parseUnits(amountStr, decimals)

  console.log('🟦 Blue Agent Rewards — Stake')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Agent wallet:', wallet.address)
  console.log('Amount:', amountStr, '$BLUEAGENT')

  // Check balance
  const balance = await token.balanceOf(wallet.address)
  console.log('Balance:', ethers.formatUnits(balance, decimals), '$BLUEAGENT')

  if (balance < amountWei) {
    console.error('❌ Insufficient $BLUEAGENT balance')
    process.exit(1)
  }

  // Check current stake
  const info = await contract.agentInfo(wallet.address)
  if (info.staked > 0n) {
    console.log('Current stake:', ethers.formatUnits(info.staked, decimals), '$BLUEAGENT (weight:', info.weight.toString() + 'x)')
  }

  // Calculate weight after stake
  const newTotal = info.staked + amountWei
  const newWeight = await contract.getWeight(newTotal)
  console.log('New total stake:', ethers.formatUnits(newTotal, decimals))
  console.log('New weight:', newWeight.toString() + 'x')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Step 1: Approve
  console.log('⏳ Approving...')
  const approveTx = await token.approve(REWARDS_CONTRACT, amountWei)
  await approveTx.wait(1)
  console.log('✅ Approved')

  // Step 2: Stake
  console.log('⏳ Staking...')
  const stakeTx = await contract.stake(amountWei)
  await stakeTx.wait(1)
  console.log('✅ Staked! tx:', stakeTx.hash)
  console.log('')
  console.log('🎉 Agent registered! You will earn weekly rewards from Blue Agent community pool.')
  console.log('📊 View on Basescan: https://basescan.org/address/' + wallet.address)
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
