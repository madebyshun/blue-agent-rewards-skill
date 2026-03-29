/**
 * Test @blueagent/rewards-skill (offline — no onchain)
 * Run: node test.js
 */

const { BlueAgentRewards } = require('./dist/index.js')

const rewards = new BlueAgentRewards({
  rewardWalletPrivateKey: '0x' + 'a'.repeat(64), // dummy key for offline test
  rewardWalletAddress: '0x0000000000000000000000000000000000000001',
  agentId: 'test-agent',
  dataDir: './test-data',
})

async function run() {
  console.log('\n🟦 Blue Agent Rewards Skill — Test\n')

  const userId = 12345

  // 1. Check in
  console.log('--- Test 1: Daily check-in ---')
  const r1 = await rewards.award(userId, 'checkin')
  console.log(`pointsAwarded: ${r1.pointsAwarded}`)
  console.log(`totalPoints: ${r1.totalPoints}`)
  console.log(`streak: ${r1.streak}`)
  console.log(`isOG: ${r1.isOG}`)

  // 2. Check in again (should be 0 — already done today)
  console.log('\n--- Test 2: Check-in again (should be 0) ---')
  const r2 = await rewards.award(userId, 'checkin')
  console.log(`pointsAwarded: ${r2.pointsAwarded} (expected: 0)`)

  // 3. Trivia win
  console.log('\n--- Test 3: Win trivia ---')
  const r3 = await rewards.award(userId, 'trivia_win')
  console.log(`pointsAwarded: ${r3.pointsAwarded} (expected: 25)`)
  console.log(`totalPoints: ${r3.totalPoints}`)

  // 4. Referral
  console.log('\n--- Test 4: Referral ---')
  const r4 = await rewards.award(userId, 'referral')
  console.log(`pointsAwarded: ${r4.pointsAwarded} (expected: 50)`)
  console.log(`totalPoints: ${r4.totalPoints}`)

  // 5. Submit project
  console.log('\n--- Test 5: Submit project ---')
  const r5 = await rewards.award(userId, 'submit')
  console.log(`pointsAwarded: ${r5.pointsAwarded} (expected: 20)`)
  console.log(`totalPoints: ${r5.totalPoints}`)

  // 6. Get points
  console.log('\n--- Test 6: Get points ---')
  const pts = await rewards.getPoints(userId)
  console.log(`points: ${pts} (expected: 100)`)

  // 7. Has checked in today
  console.log('\n--- Test 7: hasCheckedInToday ---')
  const checked = await rewards.hasCheckedInToday(userId)
  console.log(`hasCheckedInToday: ${checked} (expected: true)`)

  // 8. Leaderboard
  console.log('\n--- Test 8: Leaderboard ---')
  const lb = await rewards.getLeaderboard(5)
  console.log(`leaderboard entries: ${lb.length}`)
  lb.forEach(e => console.log(`  #${e.rank} userId:${e.userId} — ${e.points} pts`))

  // 9. Claim (offline — will fail onchain but check logic)
  console.log('\n--- Test 9: Claim (expect fail — no real wallet) ---')
  const claim = await rewards.claim(userId, '0xA17F8154B5B4e314fC83Fa83EEf3dFcf71F4BB48')
  console.log(`success: ${claim.success}`)
  if (!claim.success) console.log(`error: ${claim.error}`)

  // Cleanup
  const fs = require('fs')
  fs.rmSync('./test-data', { recursive: true, force: true })

  console.log('\n✅ Tests complete!')
}

run().catch(console.error)
