
export enum TronStatus {
    SUCCESS = '1',
    ERROR = '0'
}

export type TronHexString = string
export type TronBase58String = string

export type TronData<T> = {
    data: T,
    success: boolean,
    error: string,
    statusCode: number
    meta: {
        at: number,
        page_size: number,
        fingerprint?: string,
        links?: {
            next: string
        }
    }
}

interface OnlyConfirmQuery {
    onlyConfirmed?: boolean,
    onlyUnconfirmed?: boolean
}

export enum BlockTimestampSort {
    asc = 'block_timestamp,asc',
    desc = 'block_timestamp,desc',
}

type PageQuery<T> = (T & {
    limit?: number,
    orderBy?: BlockTimestampSort,
    minTimestamp?: number,
    maxTimestamp?: number
})


export type GetTronAccountInfoQuery = OnlyConfirmQuery & {
    address: string
}

export interface GetTronAccountInfoResponseOrigin {
    address: TronBase58String,
    balance: number,
    create_time: number,
}

export type GetTronAccountTxListQuery = PageQuery<OnlyConfirmQuery & {
    address: TronBase58String,
    onlyFrom?: boolean,
    onlyTo?: boolean,
    searchInternal?: boolean
}>


export interface GetTronAccountTxListResponse {
    ret: [
        {
            contractRet: "SUCCESS" | "",
            fee: number
        }
    ],
    signature: [string], // no 0x
    txID: string, // no 0x
    net_usage: number,
    raw_data_hex: string, // no 0x
    unfreeze_amount?: string,
    net_fee: number,
    energy_usage: number,
    blockNumber: number,
    block_timestamp: number,//milliseconds
    energy_fee: number,
    energy_usage_total: number,
    raw_data: {
        contract: (
            // Stake TRX/ Unstake TRX
            {
                parameter: {
                    value: {
                        balance?: number,
                        resource_type: string,
                        resource_value?: number,
                        resource: "ENERGY" | number,
                        receiver_address: TronHexString,
                        owner_address: TronHexString
                    },
                    type_url: string
                },
                type: string
            } |
            // Transfer TRC10 & TRX
            {
                parameter: {
                    value: {
                        amount: number,
                        asset_name?: string,
                        owner_address: TronHexString,
                        to_address: TronHexString
                    },
                    type_url: string
                },
                type: "TransferAssetContract"
            } |
            // TriggerSmartContract
            {
                parameter: {
                    value: {
                        data: string,
                        owner_address: TronHexString,
                        contract_address: TronHexString
                    },
                    type_url: "type.googleapis.com/protocol.TriggerSmartContract"
                },
                type: "TriggerSmartContract"
            } |
            {
                parameter: {
                    value: {
                        owner_address: TronHexString
                    },
                    type_url: "type.googleapis.com/protocol.WithdrawBalanceContract"
                },
                type: "WithdrawBalanceContract"
            } |
            // Contract creation
            {
                parameter: {
                    value: {
                        owner_address: TronHexString,
                        new_contract: {
                            bytecode: string,
                            consume_user_resource_percent: number,
                            name: string,// contract name
                            origin_address: TronHexString,
                            abi: any,
                            origin_energy_limit: number
                        }
                    },
                    type_url: "type.googleapis.com/protocol.CreateSmartContract"
                },
                type: "CreateSmartContract"
            }
        )[],
        ref_block_bytes: string,//"1134"
        ref_block_hash: string, // "306fd95d88ddbfa8"
        expiration: number,
        timestamp: number
    },
    "internal_transactions": []
}

export type GetTronAccountTokenTransferQuery = PageQuery<OnlyConfirmQuery & {
    address: TronBase58String,
    onlyFrom?: boolean,
    onlyTo?: boolean,
    searchInternal?: boolean,
    contractAddress: string
}>

export interface GetTronAccountTokenTransferResponse {
    transaction_id: string,
    token_info: {
        symbol: string,
        address: TronBase58String,
        decimals: number,
        name: string
    },
    block_timestamp: number, // milliseconds
    from: TronBase58String,
    to: TronBase58String,
    type: "Transfer",
    value: string // number string
}

export type GetTronTokenBalanceQuery = {
    address: TronBase58String,
    limit?: number,
    orderBy?: BlockTimestampSort
}

export interface GetTronTokenBalanceResponse {
    [key: TronBase58String]: string
}

export type GetTronTransactionLogsQuery = {
    txId: string
}
export type GetTronContractLogsQuery = PageQuery<{
    address: string,
    eventName?: string,
    blockNumber?: number,
}>
export type GetTronBlockLogsQuery = {
    blockNumber: number | 'latest',
    limit?: number
}

export type ValueType = 'bytes32' | 'address' | 'unit256'

export interface GetTronLogsResponse {
    block_number: number,
    block_timestamp: number,
    caller_contract_address: TronBase58String,
    contract_address: TronBase58String,
    event_index: number,
    event_name: string, // only name , no signature
    result: { [key: number | string]: string },
    result_type: {
        [key: string]: ValueType
    },
    // OrdersMatched(bytes32 buyHash, bytes32 sellHash, address indexed maker, address indexed taker, uint256 price, bytes32 indexed metadata)
    event: string,
    transaction_id: string
}