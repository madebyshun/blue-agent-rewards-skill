"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnchainService = void 0;
const ethers_1 = require("ethers");
const BLUEAGENT_CONTRACT = '0xf895783b2931c919955e18b5e3343e7c7c456ba3';
const BASE_RPC = 'https://mainnet.base.org';
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
];
class OnchainService {
    constructor(privateKey) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(BASE_RPC);
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.token = new ethers_1.ethers.Contract(BLUEAGENT_CONTRACT, ERC20_ABI, this.wallet);
    }
    async getBalance() {
        return await this.token.balanceOf(this.wallet.address);
    }
    async transfer(toAddress, amount) {
        const tx = await this.token.transfer(toAddress, amount);
        await tx.wait();
        return tx.hash;
    }
    async transferWithFee(userAddress, treasuryAddress, totalAmount, feePercent) {
        const amountFee = (totalAmount * BigInt(feePercent)) / 100n;
        const amountUser = totalAmount - amountFee;
        // Check balance
        const balance = await this.getBalance();
        if (balance < totalAmount) {
            throw new Error(`Insufficient reward wallet balance: ${ethers_1.ethers.formatUnits(balance, 18)}`);
        }
        // Send to user
        const txHashUser = await this.transfer(userAddress, amountUser);
        // Send fee to treasury
        let txHashFee = '';
        if (amountFee > 0n) {
            txHashFee = await this.transfer(treasuryAddress, amountFee);
        }
        return { txHashUser, txHashFee, amountUser, amountFee };
    }
}
exports.OnchainService = OnchainService;
//# sourceMappingURL=onchain.js.map