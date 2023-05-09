export declare enum Module {
    Provider = "provider",
    Account = "account",
    Contract = "contract",
    Block = "block",
    Transaction = "transaction",
    Logs = "logs",
    Proxy = "proxy"
}
export interface GetEtherCompatQuery {
    compatable?: false;
}
export interface GetEtherCompatTxListResponse {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    fee: string;
    isError: boolean;
    input: string;
}
//# sourceMappingURL=index.d.ts.map