import { UserRecord } from './types';
export declare class Storage {
    private dataDir;
    private usersFile;
    constructor(dataDir: string);
    loadUsers(): Record<string, UserRecord>;
    saveUsers(users: Record<string, UserRecord>): void;
    getUser(userId: string): UserRecord | null;
    saveUser(user: UserRecord): void;
    getUserCount(): number;
}
//# sourceMappingURL=storage.d.ts.map