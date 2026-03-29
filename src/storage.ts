import * as fs from 'fs'
import * as path from 'path'
import { UserRecord } from './types'

export class Storage {
  private dataDir: string
  private usersFile: string

  constructor(dataDir: string) {
    this.dataDir = dataDir
    this.usersFile = path.join(dataDir, 'users.json')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  }

  loadUsers(): Record<string, UserRecord> {
    try {
      return JSON.parse(fs.readFileSync(this.usersFile, 'utf8'))
    } catch {
      return {}
    }
  }

  saveUsers(users: Record<string, UserRecord>): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2))
  }

  getUser(userId: string): UserRecord | null {
    const users = this.loadUsers()
    return users[userId] || null
  }

  saveUser(user: UserRecord): void {
    const users = this.loadUsers()
    users[user.id] = user
    this.saveUsers(users)
  }

  getUserCount(): number {
    return Object.keys(this.loadUsers()).length
  }
}
