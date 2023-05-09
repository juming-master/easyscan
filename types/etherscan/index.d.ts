import { Data, AccountTxListInternalResponse, AccountBalanceQuery, AccountBalanceResponse, AccountTokenBalanceQuery, AccountTxListInternalQuery, AccountTxListQuery, Sort, AccountMineBlocksQuery, AccountERC20TokenTransferEventQuery, AccountERC721TokenTransferEventQuery, AccountERC1155TokenTransferEventQuery, AccountMineBlocksResponse, AccountERC20TokenTransferEventResponse, AccountERC721TokenTransferEventResponse, AccountERC1155TokenTransferEventResponse, AccountHistoryBalanceOfEthQuery, GetLogsQuery, GetContractABIQuery, GetContractSourceCodeQuery, GetContractSourceCodeResponse, BlockCountdownQuery, BlockCountdownResponse, BlockNoByTimestampQuery, BlockRewardQuery, BlockRewardResponse, AccountTxListResponse, GetContractCreationQuery, GetContractCreationResponse, GetTransactionStatusQuery, GetTransactionStatusResponse, GetTransactionReceiptStatusQuery, GetTransactionReceiptStatusResponse, GetTokenBalanceQuery, GetContractSourceCodeFormatResponse, GetLogsResponseFormat } from './types';
export * from './types';
import { CustomFetch } from '../utils';
import { GetEtherCompatTxListResponse } from '../types';
import { BlockNumber } from './types';
import ethers from 'ethers';
import { FetchCustomConfig } from '../utils';
export declare function etherscanAPI(chainOrBaseURL: string, apiKey: string, customFetch?: CustomFetch, options?: FetchCustomConfig): {
    provider: ethers.ethers.EtherscanProvider;
    account: {
        /**
             * Returns the amount of Tokens a specific account owns.
             */
        tokenBalance: (query: AccountTokenBalanceQuery) => Promise<string>;
        /**
         * Returns the balance of a sepcific account
         */
        balance: <T extends AccountBalanceQuery>({ address, tag }: T) => Promise<AccountBalanceResponse<T>>;
        /**
         * Get a list of transactions for a specfic address
         */
        txList: (query: AccountTxListQuery) => Promise<Data<(AccountTxListResponse | GetEtherCompatTxListResponse)[]>>;
        /**
         * Get a list of internal transactions
         */
        txListInternal: (query: AccountTxListInternalQuery) => Promise<Data<AccountTxListInternalResponse[]>>;
        /**
         * Get a list of blocks that a specific account has mineds
         */
        getMinedBlocks: (query: AccountMineBlocksQuery) => Promise<Data<AccountMineBlocksResponse>>;
        /**
        * Get a list of "ERC20 - Token Transfer Events" by Address
        */
        tokenTx: (query: AccountERC20TokenTransferEventQuery) => Promise<Data<AccountERC20TokenTransferEventResponse[]>>;
        /**
        * Get a list of "ERC721 - Token Transfer Events" by Address
        */
        tokenNftTx: (query: AccountERC721TokenTransferEventQuery) => Promise<Data<AccountERC721TokenTransferEventResponse[]>>;
        /**
        * Get a list of "ERC1155 - Token Transfer Events" by Address
        */
        token1155Tx: (query: AccountERC1155TokenTransferEventQuery) => Promise<Data<AccountERC1155TokenTransferEventResponse[]>>;
        /**
         * Gethistorical ether balance for a single address by blockNo.
         */
        balanceHistory(query: AccountHistoryBalanceOfEthQuery): Promise<string>;
        getTokenBalance: (query: GetTokenBalanceQuery) => Promise<string>;
    };
    logs: {
        /**
           * The Event Log API was designed to provide an alternative to the native eth_getLogs.
           */
        getLogs: (query: GetLogsQuery) => Promise<Data<(GetLogsResponseFormat)[]>>;
    };
    contract: {
        /**
           * Get the ABI
           */
        getABI: (query: GetContractABIQuery) => Promise<string>;
        /**
         * Get the contract source code
         */
        getSourceCode: (query: GetContractSourceCodeQuery) => Promise<GetContractSourceCodeResponse[]>;
        /**
         * Get the contract source code ,if it is a proxy contract, the implementation source code will be fetched automaticly,
         * @param query
         * @returns
         */
        getSourceCodeWithImpl: (query: GetContractSourceCodeQuery) => Promise<GetContractSourceCodeFormatResponse | null>;
        getContractCreation: (query: GetContractCreationQuery) => Promise<GetContractCreationResponse[]>;
    };
    block: {
        /**
         * Find the block reward for a given address and block
         */
        getBlockreward: (query: BlockRewardQuery) => Promise<BlockRewardResponse>;
        /**
         * Find the block countdown for a given address and block
         */
        getBlockCountdown: (query: BlockCountdownQuery) => Promise<BlockCountdownResponse>;
        /**
         * Find the block no for a given timestamp
         */
        getBlockNumberByTime: (query: BlockNoByTimestampQuery) => Promise<string>;
    };
    transaction: {
        getStatus: (query: GetTransactionStatusQuery) => Promise<GetTransactionStatusResponse>;
        getTxReceiptStatus: (query: GetTransactionReceiptStatusQuery) => Promise<GetTransactionReceiptStatusResponse>;
    };
};
export declare function etherscanPageData(chainOrBaseURL: string, apiKey: string, customFetch?: CustomFetch, options?: {
    globalAutoStart?: boolean;
} & FetchCustomConfig): {
    account: {
        txList: (q: AccountTxListQuery, cb: (currentPageData: (GetEtherCompatTxListResponse | AccountTxListResponse)[], currentPageIndex: number, accumulatedData: (GetEtherCompatTxListResponse | AccountTxListResponse)[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
        txListInternal: (q: AccountTxListInternalQuery, cb: (currentPageData: AccountTxListInternalResponse[], currentPageIndex: number, accumulatedData: AccountTxListInternalResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
        tokenTx: (q: AccountERC20TokenTransferEventQuery, cb: (currentPageData: AccountERC20TokenTransferEventResponse[], currentPageIndex: number, accumulatedData: AccountERC20TokenTransferEventResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
        tokenNftTx: (q: AccountERC721TokenTransferEventQuery, cb: (currentPageData: AccountERC721TokenTransferEventResponse[], currentPageIndex: number, accumulatedData: AccountERC721TokenTransferEventResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
        token1155Tx: (q: AccountERC1155TokenTransferEventQuery, cb: (currentPageData: AccountERC1155TokenTransferEventResponse[], currentPageIndex: number, accumulatedData: AccountERC1155TokenTransferEventResponse[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
        /**
             * Returns the amount of Tokens a specific account owns.
             */
        tokenBalance: (query: AccountTokenBalanceQuery) => Promise<string>;
        /**
         * Returns the balance of a sepcific account
         */
        balance: <T extends AccountBalanceQuery>({ address, tag }: T) => Promise<AccountBalanceResponse<T>>;
        /**
         * Get a list of blocks that a specific account has mineds
         */
        getMinedBlocks: (query: AccountMineBlocksQuery) => Promise<Data<AccountMineBlocksResponse>>;
        /**
         * Gethistorical ether balance for a single address by blockNo.
         */
        balanceHistory(query: AccountHistoryBalanceOfEthQuery): Promise<string>;
        getTokenBalance: (query: GetTokenBalanceQuery) => Promise<string>;
    };
    logs: {
        getLogs: (q: GetLogsQuery, cb: (currentPageData: GetLogsResponseFormat[], currentPageIndex: number, accumulatedData: GetLogsResponseFormat[], isFinish: boolean) => void, autoStart?: boolean) => {
            resume: () => void;
            stop: () => {
                page: number;
                offset: number;
                sort: Sort;
                startblock?: BlockNumber | undefined;
                endblock?: BlockNumber | undefined;
            };
        };
    };
    provider: ethers.ethers.EtherscanProvider;
    contract: {
        /**
           * Get the ABI
           */
        getABI: (query: GetContractABIQuery) => Promise<string>;
        /**
         * Get the contract source code
         */
        getSourceCode: (query: GetContractSourceCodeQuery) => Promise<GetContractSourceCodeResponse[]>;
        /**
         * Get the contract source code ,if it is a proxy contract, the implementation source code will be fetched automaticly,
         * @param query
         * @returns
         */
        getSourceCodeWithImpl: (query: GetContractSourceCodeQuery) => Promise<GetContractSourceCodeFormatResponse | null>;
        getContractCreation: (query: GetContractSourceCodeQuery) => Promise<GetContractCreationResponse[]>;
    };
    block: {
        /**
         * Find the block reward for a given address and block
         */
        getBlockreward: (query: BlockRewardQuery) => Promise<BlockRewardResponse>;
        /**
         * Find the block countdown for a given address and block
         */
        getBlockCountdown: (query: BlockCountdownQuery) => Promise<BlockCountdownResponse>;
        /**
         * Find the block no for a given timestamp
         */
        getBlockNumberByTime: (query: BlockNoByTimestampQuery) => Promise<string>;
    };
    transaction: {
        getStatus: (query: GetTransactionStatusQuery) => Promise<GetTransactionStatusResponse>;
        getTxReceiptStatus: (query: GetTransactionStatusQuery) => Promise<GetTransactionReceiptStatusResponse>;
    };
};
export default etherscanAPI;
//# sourceMappingURL=index.d.ts.map