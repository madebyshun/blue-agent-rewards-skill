"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Storage {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.usersFile = path.join(dataDir, 'users.json');
        if (!fs.existsSync(dataDir))
            fs.mkdirSync(dataDir, { recursive: true });
    }
    loadUsers() {
        try {
            return JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
        }
        catch {
            return {};
        }
    }
    saveUsers(users) {
        fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    }
    getUser(userId) {
        const users = this.loadUsers();
        return users[userId] || null;
    }
    saveUser(user) {
        const users = this.loadUsers();
        users[user.id] = user;
        this.saveUsers(users);
    }
    getUserCount() {
        return Object.keys(this.loadUsers()).length;
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map