/**
 * claim.js — Claim weekly $BLUEAGENT rewards from the agent pool
 * 
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/claim.js
 *   PRIVATE_KEY=0x... node scripts/claim.js --epoch 1
 */

const { ethers } = require('ethers')

const BLUEAGENT_TOKEN = '0xf895783b2931c919955e18b5e3343e7c7c456ba3'
const REWARDS_CONTRACT = '0x9daD1E3501e3322bA834D1269eC8C3105d4752F8'
const BASE_RPC = 'https://mainnet.base.org'

const TOKEN_ABI = ['function decimals() view returns (uint8)']

const CONTRACT_ABI = [
  'function claim(uint256[] calldata epochIds) external',
  'function claimableAmount(address agent, uint256 epochId) view returns (uint256)',
  'function currentEpoch() view returns (uint256)',
  'function epochInfo() view returns (uint256 epochId, uint256 startTime, uint256 pool, uint256 registeredAgents)',
  'function agentInfo(address) view returns (uint256 staked, uint256 weight, uint256 unstakeRequestedAt, uint256 unstakeAmount, bool canWithdraw)',
]

async function main() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY
  if (!PRIVATE_KEY) {
    console.error('❌ Missing PRIVATE_KEY env var')
    process.exit(1)
  }

  const provider = new ethers.JsonRpcProvider(BASE_RPC)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(BLUEAGENT_TOKEN, TOKEN_ABI, provider)
  const contract = new ethers.Contract(REWARDS_CONTRACT, CONTRACT_ABI, wallet)

  const decimals = await token.decimals()

  console.log('🟦 Blue Agent Rewards — Claim')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Agent wallet:', wallet.address)

  // Get current epoch
  const epochInfo = await contract.epochInfo()
  const currentEpoch = epochInfo.epochId
  console.log('Current epoch:', currentEpoch.toString())
  console.log('Pending pool:', ethers.formatUnits(epochInfo.pool, decimals), '$BLUEAGENT')

  // Check agent info
  const info = await contract.agentInfo(wallet.address)
  if (info.staked === 0n) {
    console.error('❌ Not staked. Run stake.js first.')
    process.exit(1)
  }
  console.log('Your stake:', ethers.formatUnits(info.staked, decimals), '(weight: ' + info.weight.toString() + 'x)')

  // Find claimable epochs
  const epochArg = process.argv.includes('--epoch')
    ? [BigInt(process.argv[process.argv.indexOf('--epoch') + 1])]
    : null

  const claimableEpochs = []
  const checkUpTo = epochArg ? epochArg : Array.from({ length: Number(currentEpoch) - 1 }, (_, i) => BigInt(i + 1))

  let totalClaimable = 0n
  for (const epochId of checkUpTo) {
    const amount = await contract.claimableAmount(wallet.address, epochId)
    if (amount > 0n) {
      claimableEpochs.push(epochId)
      totalClaimable += amount
      console.log(`Epoch ${epochId}: ${ethers.formatUnits(amount, decimals)} $BLUEAGENT claimable`)
    }
  }

  if (claimableEpochs.length === 0) {
    console.log('ℹ️  No claimable rewards yet. Epochs are distributed weekly.')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Total claimable:', ethers.formatUnits(totalClaimable, decimals), '$BLUEAGENT')
  console.log('⏳ Claiming...')

  const tx = await contract.claim(claimableEpochs)
  await tx.wait(1)
  console.log('✅ Claimed! tx:', tx.hash)
  console.log('🎉 $BLUEAGENT sent to your wallet:', wallet.address)
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
