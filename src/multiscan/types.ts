import { BlockNumber } from "../types"


export interface GetAccountBalanceQuery {
    address: string | string[]
}

export interface GetAccountBalanceResponse {
    account: string,
    balance: string,
}

export type GetContractLogsQuery = {
    address?: string,
    fromBlock: BlockNumber,
    toBlock: BlockNumber,
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
}