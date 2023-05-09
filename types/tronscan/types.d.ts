export declare enum TronStatus {
    SUCCESS = "1",
    ERROR = "0"
}
export type TronHexString = string;
export type TronBase58String = string;
export type TronData<T> = {
    data: T;
    success: boolean;
    error: string;
    statusCode: number;
    meta: {
        at: number;
        page_size: number;
        fingerprint?: string;
        links?: {
            next: string;
            current: string;
        };
    };
};
interface OnlyConfirmQuery {
    onlyConfirmed?: boolean;
    onlyUnconfirmed?: boolean;
}
export declare enum BlockTimestampSort {
    asc = "block_timestamp,asc",
    desc = "block_timestamp,desc"
}
type PageQuery<T> = (T & {
    limit?: number;
    orderBy?: BlockTimestampSort;
    minTimestamp?: number;
    maxTimestamp?: number;
});
export type GetTronAccountInfoQuery = OnlyConfirmQuery & {
    address: string;
};
export interface GetTronAccountInfoResponseOrigin {
    address: TronBase58String;
    balance: number;
    create_time: number;
}
export type GetTronAccountTxListQuery = PageQuery<OnlyConfirmQuery & {
    address: TronBase58String;
    onlyFrom?: boolean;
    onlyTo?: boolean;
    searchInternal?: boolean;
}>;
export interface GetTronAccountTxListResponse {
    ret: [
        {
            contractRet: "SUCCESS" | "";
            fee: number;
        }
    ];
    signature: [string];
    txID: string;
    net_usage: number;
    raw_data_hex: string;
    unfreeze_amount?: string;
    net_fee: number;
    energy_usage: number;
    blockNumber: number;
    block_timestamp: number;
    energy_fee: number;
    energy_usage_total: number;
    raw_data: {
        contract: ({
            parameter: {
                value: {
                    balance?: number;
                    resource_type: string;
                    resource_value?: number;
                    resource: "ENERGY" | number;
                    receiver_address: TronHexString;
                    owner_address: TronHexString;
                };
                type_url: string;
            };
            type: string;
        } | {
            parameter: {
                value: {
                    amount: number;
                    asset_name?: string;
                    owner_address: TronHexString;
                    to_address: TronHexString;
                };
                type_url: string;
            };
            type: "TransferAssetContract";
        } | {
            parameter: {
                value: {
                    data: string;
                    owner_address: TronHexString;
                    contract_address: TronHexString;
                };
                type_url: "type.googleapis.com/protocol.TriggerSmartContract";
            };
            type: "TriggerSmartContract";
        } | {
            parameter: {
                value: {
                    owner_address: TronHexString;
                };
                type_url: "type.googleapis.com/protocol.WithdrawBalanceContract";
            };
            type: "WithdrawBalanceContract";
        } | {
            parameter: {
                value: {
                    owner_address: TronHexString;
                    new_contract: {
                        bytecode: string;
                        consume_user_resource_percent: number;
                        name: string;
                        origin_address: TronHexString;
                        abi: any;
                        origin_energy_limit: number;
                    };
                };
                type_url: "type.googleapis.com/protocol.CreateSmartContract";
            };
            type: "CreateSmartContract";
        })[];
        ref_block_bytes: string;
        ref_block_hash: string;
        expiration: number;
        timestamp: number;
    };
    "internal_transactions": [];
}
export type GetTronAccountTokenTransferQuery = PageQuery<OnlyConfirmQuery & {
    address: TronBase58String;
    onlyFrom?: boolean;
    onlyTo?: boolean;
    searchInternal?: boolean;
    contractAddress: string;
}>;
export interface GetTronAccountTokenTransferResponse {
    transaction_id: string;
    token_info: {
        symbol: string;
        address: TronBase58String;
        decimals: number;
        name: string;
    };
    block_timestamp: number;
    from: TronBase58String;
    to: TronBase58String;
    type: "Transfer";
    value: string;
}
export type GetTronTokenBalanceQuery = {
    address: TronBase58String;
    limit?: number;
    orderBy?: BlockTimestampSort;
};
export interface GetTronTokenBalanceResponse {
    [key: TronBase58String]: string;
}
export type GetTronTransactionLogsQuery = {
    txId: string;
};
export type GetTronContractLogsQuery = PageQuery<{
    address: string;
    eventName?: string;
    blockNumber?: number;
}>;
export type GetTronBlockLogsQuery = {
    blockNumber: number | 'latest';
    limit?: number;
};
export type ValueType = 'bytes32' | 'address' | 'unit256';
export interface GetTronLogsResponse {
    block_number: number;
    block_timestamp: number;
    caller_contract_address: TronBase58String;
    contract_address: TronBase58String;
    event_index: number;
    event_name: string;
    result: {
        [key: number | string]: string;
    };
    result_type: {
        [key: string]: ValueType;
    };
    event: string;
    transaction_id: string;
}
export type GetEtherCompatLogsResponse = {
    address: string;
    blockNumber: string;
    timeStamp: string;
    logIndex: string;
    hash: string;
    event: string;
    eventName: string;
    result: {
        [key: number | string]: string;
    };
    resultType: {
        [key: string]: ValueType;
    };
};
export {};
//# sourceMappingURL=types.d.ts.map