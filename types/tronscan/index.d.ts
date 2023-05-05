import { TronData, GetEtherCompatLogsResponse, GetTronAccountInfoQuery, GetTronTokenBalanceQuery, GetTronTokenBalanceResponse, GetTronAccountInfoResponseOrigin, GetTronAccountTokenTransferQuery, GetTronAccountTokenTransferResponse, GetTronAccountTxListQuery, GetTronAccountTxListResponse, GetTronTransactionLogsQuery, GetTronContractLogsQuery, GetTronBlockLogsQuery } from './types';
import { CustomFetch, GetEtherCompatTxListResponse } from '../types';
import TronProvider from './tron-jsonrpc-provider';
export declare function tronscanAPI(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options?: {
    dataCompatible?: boolean;
}): {
    provider: TronProvider;
    account: {
        accountInfo: (query: GetTronAccountInfoQuery) => Promise<GetTronAccountInfoResponseOrigin>;
        txList: (query: GetTronAccountTxListQuery) => Promise<TronData<(GetTronAccountTxListResponse | GetEtherCompatTxListResponse)[]>>;
        tokenTransfer: (query: GetTronAccountTokenTransferQuery) => Promise<TronData<GetTronAccountTokenTransferResponse[]>>;
    };
    contract: {
        txList: (query: GetTronAccountTxListQuery) => Promise<TronData<(GetTronAccountTxListResponse | GetEtherCompatTxListResponse)[]>>;
        tokenBalance: (query: GetTronTokenBalanceQuery) => Promise<TronData<GetTronTokenBalanceResponse[]>>;
    };
    logs: {
        txLogs: (query: GetTronTransactionLogsQuery) => Promise<TronData<(GetEtherCompatLogsResponse)[]>>;
        contractLogs: (query: GetTronContractLogsQuery) => Promise<TronData<(GetEtherCompatLogsResponse)[]>>;
        blockLogs: (query: GetTronBlockLogsQuery) => Promise<TronData<(GetEtherCompatLogsResponse)[]>>;
    };
};
export declare function tronscanPageData(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options?: {
    dataCompatible?: boolean;
    globalAutoStart?: boolean;
}): {
    provider: TronProvider;
    account: {
        accountInfo: (query: GetTronAccountInfoQuery) => Promise<GetTronAccountInfoResponseOrigin>;
        txList: (query: GetTronAccountTxListQuery, cb: (currentPageData: (GetEtherCompatTxListResponse | GetTronAccountTxListResponse)[], currentPageIndex: number, accumulatedData: (GetEtherCompatTxListResponse | GetTronAccountTxListResponse)[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronAccountTxListQuery;
        };
        tokenTransfer: (query: GetTronAccountTokenTransferQuery, cb: (currentPageData: GetTronAccountTokenTransferResponse[], currentPageIndex: number, accumulatedData: GetTronAccountTokenTransferResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronAccountTokenTransferQuery;
        };
    };
    contract: {
        tokenBalance: (query: GetTronTokenBalanceQuery, cb: (currentPageData: GetTronTokenBalanceResponse[], currentPageIndex: number, accumulatedData: GetTronTokenBalanceResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronTokenBalanceQuery;
        };
        txList: (query: GetTronAccountTxListQuery, cb: (currentPageData: (GetEtherCompatTxListResponse | GetTronAccountTxListResponse)[], currentPageIndex: number, accumulatedData: (GetEtherCompatTxListResponse | GetTronAccountTxListResponse)[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronAccountTxListQuery;
        };
    };
    logs: {
        txLogs: (query: GetTronTransactionLogsQuery, cb: (currentPageData: GetEtherCompatLogsResponse[], currentPageIndex: number, accumulatedData: GetEtherCompatLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronTransactionLogsQuery;
        };
        contractLogs: (query: GetTronContractLogsQuery, cb: (currentPageData: GetEtherCompatLogsResponse[], currentPageIndex: number, accumulatedData: GetEtherCompatLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronContractLogsQuery;
        };
        blockLogs: (query: GetTronBlockLogsQuery, cb: (currentPageData: GetEtherCompatLogsResponse[], currentPageIndex: number, accumulatedData: GetEtherCompatLogsResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => string | GetTronBlockLogsQuery;
        };
    };
};
export default tronscanAPI;
//# sourceMappingURL=index.d.ts.map