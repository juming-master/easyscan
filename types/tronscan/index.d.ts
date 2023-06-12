import { TronData, GetEtherCompatLogsResponse, GetTronAccountInfoQuery, GetTronTokenBalanceQuery, GetTronTokenBalanceResponse, GetTronAccountInfoResponseOrigin, GetTronAccountTokenTransferQuery, GetTronAccountTokenTransferResponse, GetTronAccountTxListQuery, GetTronAccountTxListResponse, GetTronTransactionLogsQuery, GetTronLogsResponse, GetTronContractLogsQuery, GetTronBlockLogsQuery, TronPageQuery } from './types';
import { GetEtherCompatTxListResponse } from '../types';
import { CustomFetch, FetchCustomConfig } from '../types';
import TronProvider from './tron-jsonrpc-provider';
export declare function formatToEtherscanTxs(data: GetTronAccountTxListResponse[]): GetEtherCompatTxListResponse[];
export declare function formatToEtherscanLogs(data: GetTronLogsResponse[]): GetEtherCompatLogsResponse[];
export declare function tronscanAPI(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options?: {
    dataCompatible?: boolean;
} & FetchCustomConfig): {
    provider: TronProvider;
    account: {
        accountInfo: (query: GetTronAccountInfoQuery) => Promise<GetTronAccountInfoResponseOrigin>;
        txList: (query: GetTronAccountTxListQuery) => Promise<TronData<GetTronAccountTxListResponse[]>>;
        tokenTransfer: (query: GetTronAccountTokenTransferQuery) => Promise<TronData<GetTronAccountTokenTransferResponse[]>>;
    };
    contract: {
        txList: (query: GetTronAccountTxListQuery) => Promise<TronData<GetTronAccountTxListResponse[]>>;
        tokenBalance: (query: GetTronTokenBalanceQuery) => Promise<TronData<GetTronTokenBalanceResponse[]>>;
    };
    logs: {
        txLogs: (query: GetTronTransactionLogsQuery) => Promise<TronData<GetTronLogsResponse[]>>;
        contractLogs: (query: GetTronContractLogsQuery) => Promise<TronData<GetTronLogsResponse[]>>;
        blockLogs: (query: GetTronBlockLogsQuery) => Promise<TronData<GetTronLogsResponse[]>>;
    };
};
export declare function tronscanPageData(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options?: {
    dataCompatible?: boolean;
    globalAutoStart?: boolean;
} & FetchCustomConfig): {
    provider: TronProvider;
    account: {
        accountInfo: (query: GetTronAccountInfoQuery) => Promise<GetTronAccountInfoResponseOrigin>;
        txList: (query: GetTronAccountTxListQuery, cb: (currentPageData: GetTronAccountTxListResponse[], currentPageIndex: number, accumulatedData: GetTronAccountTxListResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
        tokenTransfer: (query: GetTronAccountTokenTransferQuery, cb: (currentPageData: GetTronAccountTokenTransferResponse[], currentPageIndex: number, accumulatedData: GetTronAccountTokenTransferResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
    };
    contract: {
        tokenBalance: (query: GetTronTokenBalanceQuery, cb: (currentPageData: GetTronTokenBalanceResponse[], currentPageIndex: number, accumulatedData: GetTronTokenBalanceResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
        txList: (query: GetTronAccountTxListQuery, cb: (currentPageData: GetTronAccountTxListResponse[], currentPageIndex: number, accumulatedData: GetTronAccountTxListResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
    };
    logs: {
        txLogs: (query: TronPageQuery, cb: (currentPageData: GetTronLogsResponse[], currentPageIndex: number, accumulatedData: GetTronLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
        contractLogs: (query: GetTronContractLogsQuery, cb: (currentPageData: GetTronLogsResponse[], currentPageIndex: number, accumulatedData: GetTronLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
        blockLogs: (query: GetTronBlockLogsQuery, cb: (currentPageData: GetTronLogsResponse[], currentPageIndex: number, accumulatedData: GetTronLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string;
        };
    };
};
export default tronscanAPI;
//# sourceMappingURL=index.d.ts.map