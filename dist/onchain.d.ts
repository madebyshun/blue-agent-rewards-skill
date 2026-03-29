export declare class OnchainService {
    private provider;
    private wallet;
    private token;
    constructor(privateKey: string);
    getBalance(): Promise<bigint>;
    transfer(toAddress: string, amount: bigint): Promise<string>;
    transferWithFee(userAddress: string, treasuryAddress: string, totalAmount: bigint, feePercent: number): Promise<{
        txHashUser: string;
        txHashFee: string;
        amountUser: bigint;
        amountFee: bigint;
    }>;
}
//# sourceMappingURL=onchain.d.ts.map