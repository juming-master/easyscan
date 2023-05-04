import { JsonFragment } from 'ethers'
import { GetEtherCompatQuery } from '../types'

export interface HttpClient<T> {
    get: {
        (query: string): Promise<T>
    }
}

export enum Status {
    SUCCESS = '1',
    ERROR = '0'
}

export enum Sort {
    ASC = 'asc',
    DESC = 'desc'
}

export enum TokenType {
    ERC20 = 'ERC20',
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
    NONE = 'NONE'
}

export interface ERC20 { symbol: string, name: string, decimals: number }

export type BlockNumber = number | 'latest'

export interface Data<T> {
    status: Status,
    message: "OK" | "NOTOK",
    result: T,
    error?: Error | string
}

export interface GetRequest {
    <T>(query: object): Promise<Data<T>>
}

export interface QueryRequired {
    module: string,
    action: string,
    apiKey: string
}

/**************************************** Account ******************************************/

export type AccountTokenBalanceQuery = {
    contractaddress?: string,
    tokenname?: string,
    address?: string,
    tag?: BlockNumber
}
export type AccountTokenBalanceResponse = string

// account balance
export type AccountBalanceQuery = { tag?: BlockNumber, address: string | string[] }
export type AccountBalanceResponse<T = AccountBalanceQuery['address']> = T extends string ? string : { account: string, balance: string }[]

// account txlistinternal
export type AccountTxListInternalQueryByAddress = {
    address?: string,
    startblock?: BlockNumber,
    endblock?: BlockNumber
    page: number,
    offset: number,
    sort?: Sort
}

export type AccountTxListInternalQuery = {
    txhash: string
} | AccountTxListInternalQueryByAddress

export type AccountTxListInternalResponse = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    from: string,
    to: string,
    value: string,
    contractAddress: string,
    input: string,
    type: string,
    gas: string,
    gasUsed: string,
    traceId: string,
    isError: string,
    errCode: string
}

export type AccountTxListQuery = {
    address?: string,
    startblock?: BlockNumber,
    endblock?: BlockNumber
    page: number,
    offset: number,
    sort?: Sort
} & GetEtherCompatQuery

export type AccountTxListResponse = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    transactionIndex: string,
    from: string,
    to: string,
    value: string,
    gas: string,
    gasPrice: string,
    isError: string,
    txreceipt_status: string,
    input: string,
    contractAddress: string,
    cumulativeGasUsed: string,
    gasUsed: string,
    confirmations: string,
    methodId: string,
    functionName: string
}


export type AccountMineBlocksQuery = {
    address: string,
    page: number,
    offset: number
}

export type AccountMineBlocksResponse = {
    blockNumber: string,
    timeStamp: string,
    blockReward: string
}

type TokenTransferEventQuery = {
    contractaddress?: string,
    address?: string,
}

export type AccountERC20TokenTransferEventQuery = TokenTransferEventQuery & {
    page: number,
    offset: number,
    startblock?: BlockNumber,
    endblock?: BlockNumber,
    sort?: Sort
}

export type AccountERC20TokenTransferEventResponse = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    from: string,
    contractAddress: string,
    to: string,
    value: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimal: string,
    transactionIndex: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    cumulativeGasUsed: string,
    input: "deprecated",
    confirmations: string
}

export type AccountERC721TokenTransferEventQuery = TokenTransferEventQuery & {
    page: number,
    offset: number,
    startblock?: BlockNumber,
    endblock?: BlockNumber,
    sort?: Sort
}

export type AccountERC721TokenTransferEventResponse = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    from: string,
    contractAddress: string,
    to: string,
    tokenID: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimal: "0",
    transactionIndex: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    cumulativeGasUsed: string,
    input: string,
    confirmations: string
}

export type AccountERC1155TokenTransferEventQuery = TokenTransferEventQuery & {
    page: number,
    offset: number,
    startblock?: BlockNumber,
    endblock?: BlockNumber,
    sort?: Sort
}

export type AccountERC1155TokenTransferEventResponse = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    transactionIndex: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    cumulativeGasUsed: string,
    input: "deprecated",
    contractAddress: string,
    from: string,
    to: string,
    tokenID: string,
    tokenValue: string,
    tokenName: string,
    tokenSymbol: string,
    confirmations: string
}

export type AccountHistoryBalanceOfEthQuery = {
    address: string,
    blockno: BlockNumber
}

export type AccountHistoryBalanceOfEthResponse = string

/**************************************** Block ******************************************/

export type BlockRewardQuery = {
    blockno: BlockNumber
}

export type BlockRewardResponse = {
    blockNumber: string,
    timeStamp: string,
    blockMiner: string,
    blockReward: string,
    uncles: {
        miner: string,
        unclePosition: string,
        blockreward: string
    }[],
    uncleInclusionReward: string
}

export type BlockCountdownQuery = {
    blockno: BlockNumber
}

export type BlockCountdownResponse = {
    CurrentBlock: string,
    CountdownBlock: string,
    RemainingBlock: string,
    EstimateTimeInSec: string
}

export type BlockNoByTimestampQuery = {
    timestamp: number,
    closest: 'before' | 'after'
}

export type BlockNoByTimestampResponse = string

/**************************************** Logs ******************************************/

export type GetLogsQuery = {
    address?: string,
    startblock?: BlockNumber,
    endblock?: BlockNumber,
    topic0?: string,
    topic1?: string,
    topic2?: string,
    topic3?: string,
    topic0_1_opr?: 'and' | 'or',
    topic0_2_opr?: 'and' | 'or',
    topic0_3_opr?: 'and' | 'or',
    topic1_2_opr?: 'and' | 'or',
    topic1_3_opr?: 'and' | 'or',
    topic2_3_opr?: 'and' | 'or',
    page: number,
    offset: number,
} & GetEtherCompatQuery

export type GetLogsResponse = {
    address: string,
    topics: string[],
    data: string,
    blockNumber: string,
    timeStamp: string,
    gasPrice: string,
    gasUsed: string,
    logIndex: string,
    transactionHash: string,
    transactionIndex: string
}


export type GetLogsResponseFormat = Omit<GetLogsResponse, 'transactionHash'> & {
    hash: string
}

/**************************************** Logs ******************************************/

export type TransactionStatusQuery = string
export type TransactionStatusResponse = string

/**************************************** Contracts ******************************************/

export type GetContractABIQuery = { address: string }
export type GetContractABIResponse = string
export type GetContractSourceCodeQuery = { address: string }
export type GetContractSourceCodeResponse = {
    SourceCode: string,
    ABI: string,
    ContractName: string,
    CompilerVersion: string,
    OptimizationUsed: string,
    Runs: string,
    ConstructorArguments: string,
    EVMVersion: string,
    Library: string,
    LicenseType: string,
    Proxy: "0" | "1",
    Implementation: string,
    SwarmSource: string
}

export type GetContractSourceCodeFormatResponse = {
    address: string,
    sourcecode: Record<string, string>,
    mergedAbi: JsonFragment[],
    abi: JsonFragment[],
    bytecode: string,
    implementation: GetContractSourceCodeFormatResponse | null,
    contractName: string,
    constructorArguments: string,
    compilerVersion: string,
    optimizationUsed: string,
    runs: string,
    evmVersion: string,
    library: string,
    licenseType: string,
    proxy: string,
    swarmSource: string
}

export type GetContractCreationQuery = GetContractSourceCodeQuery
export type GetContractCreationResponse = {
    contractAddress: string,
    contractCreator: string,
    txHash: string
}


export type GetTransactionStatusQuery = {
    txhash: string
}
export type GetTransactionStatusResponse = {
    isError: '0' | '1',
    errDecription: string
}

export type GetTransactionReceiptStatusQuery = GetTransactionStatusQuery
export type GetTransactionReceiptStatusResponse = {
    status: '0' | '1'
}


export type GetTokenBalanceQuery = {
    contractAddress: string,
    address: string,
    tag: BlockNumber
}
export type GetTokenBalanceResponse = string

//-------------Geth/Proxy-------------------------------------

export type GetTxReceipt = {
    "blockHash": string,
    "blockNumber": string,
    "contractAddress": string | null,
    "cumulativeGasUsed": string,
    "from": string,
    "gasUsed": string,
    "logs": {
        "address": string,
        "topics": string[],
        "data": string,
        "blockNumber": string,
        "transactionHash": string,
        "transactionIndex": string,
        "blockHash": string,
        "logIndex": string,
        "removed": boolean
    }[],
    "logsBloom": string,
    "status": "0x1" | "0x0",
    "to": string,
    "transactionHash": string,
    "transactionIndex": string,
    "type": string
}