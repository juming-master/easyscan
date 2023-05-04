import qs from 'qs'
import {
    Data,
    Status,
    AccountTxListInternalResponse,
    AccountBalanceQuery,
    AccountBalanceResponse,
    AccountTokenBalanceQuery,
    AccountTokenBalanceResponse,
    AccountTxListInternalQuery,
    AccountTxListQuery,
    Sort,
    AccountMineBlocksQuery,
    AccountERC20TokenTransferEventQuery,
    AccountERC721TokenTransferEventQuery,
    AccountERC1155TokenTransferEventQuery,
    AccountMineBlocksResponse,
    AccountERC20TokenTransferEventResponse,
    AccountERC721TokenTransferEventResponse,
    AccountERC1155TokenTransferEventResponse,
    AccountHistoryBalanceOfEthQuery,
    AccountHistoryBalanceOfEthResponse,
    GetLogsQuery,
    GetLogsResponse,
    GetContractABIQuery,
    GetContractABIResponse,
    GetContractSourceCodeQuery,
    GetContractSourceCodeResponse,
    BlockCountdownQuery,
    BlockCountdownResponse,
    BlockNoByTimestampQuery,
    BlockNoByTimestampResponse,
    BlockRewardQuery,
    BlockRewardResponse,
    AccountTxListResponse,
    GetContractCreationQuery,
    GetContractCreationResponse,
    GetTransactionStatusQuery,
    GetTransactionStatusResponse,
    GetTransactionReceiptStatusQuery,
    GetTransactionReceiptStatusResponse,
    GetTokenBalanceQuery,
    GetTokenBalanceResponse,
    GetContractSourceCodeFormatResponse,
    GetLogsResponseFormat
} from './types'
export * from './types'
import { URL } from 'whatwg-url'
import baseURLs from './base-urls'
import { CustomFetch, GetEtherCompatLogsResponse, GetEtherCompatTxListResponse, Module, defaultCustomFetch } from '../types'
import { omit, findKey } from 'lodash'
import { BlockNumber } from './types'
import BigNumber from 'bignumber.js'
import ethers, { JsonFragment } from 'ethers'


const MAX_SIZE = 10000


function handleTxList(response: Data<AccountTxListResponse[]>): Data<GetEtherCompatTxListResponse[]> {
    const result = response.result.map(el => {
        return {
            blockNumber: el.blockNumber,
            timeStamp: el.timeStamp,
            hash: el.hash,
            from: el.from,
            to: el.to,
            value: el.value,
            fee: new BigNumber(el.gasPrice).times(el.gasUsed).toFixed(),
            isError: el.isError === '0',
            input: el.input,
        }
    })
    return {
        ...response,
        result
    }
}

function handleLogs(response: Data<GetLogsResponseFormat[]>): Data<GetEtherCompatLogsResponse[]> {
    const result = response.result.map(el => {
        return {
            address: el.address,
            topics: el.topics,
            data: el.data,
            blockNumber: el.blockNumber,
            timeStamp: el.timeStamp,
            logIndex: el.logIndex,
            hash: el.hash,
        }
    })
    return {
        ...response,
        result
    }
}

export function etherscanAPI(chainOrBaseURL: string, apiKey: string, customFetch?: CustomFetch) {
    const fetch = customFetch || defaultCustomFetch
    //@ts-ignore: TS7053
    const baseURL = Object.keys(baseURLs).includes(chainOrBaseURL) ? baseURLs[chainOrBaseURL] : chainOrBaseURL
    const chain = Object.keys(baseURLs).includes(chainOrBaseURL) ? chainOrBaseURL : findKey(baseURLs, value => chainOrBaseURL.indexOf(value) === 0)
    const etherscanProvider = new ethers.EtherscanProvider(chain, apiKey)

    async function get<T>(module: string, query: Record<string, any>) {
        const url = new URL(`/api?${qs.stringify(Object.assign({ apiKey: apiKey, module }, query))}`, baseURL)
        var data: Data<T> = await fetch(url.toString())
        if (data.status && data.status !== Status.SUCCESS) {
            let returnMessage: string = data.message || 'NOTOK';
            if (returnMessage === 'No transactions found' || returnMessage === 'No records found') {
                return data
            }
            if (data.result && typeof data.result === 'string') {
                returnMessage = data.result;
            } else if (data.message && typeof data.message === 'string') {
                returnMessage = data.message;
            }
            throw new Error(returnMessage)
        }
        if (data.error) {
            let message = data.error;
            if (typeof data.error === 'object' && data.error.message) {
                message = data.error.message;
            }
            throw message
        }
        return data
    }

    async function getSourceCode(query: GetContractSourceCodeQuery) {
        return get<GetContractSourceCodeResponse[]>(Module.Contract, Object.assign({
            action: 'getsourcecode',
        }, query)).then(r => r.result);
    }

    async function parseContract(address: string, code: GetContractSourceCodeResponse & { Bytecode: string }, mergedAbi: JsonFragment[]): Promise<GetContractSourceCodeFormatResponse | null> {
        let abi: JsonFragment[] = []
        if (code.ABI && ((code.ABI.startsWith('[') && code.ABI.endsWith(']')) || (code.ABI.startsWith('{') && code.ABI.endsWith('}')))) {
            try {
                abi = JSON.parse(code.ABI)
            } catch (e) {
                console.error(e, address)
            }
        }
        let toMerged = [...abi]
        // for proxy contract, reserve the constructor. for implementation, remove it.
        if (mergedAbi.length > 0) {
            const index = toMerged.findIndex(el => el.type === 'constructor')
            if (index > -1) {
                toMerged.splice(index, 1)
            }
        }
        mergedAbi.push(...toMerged)
        let sourcecode: Record<string, string> = {}
        let temp = code.SourceCode.trim()
        if (temp.startsWith('{{') && temp.endsWith('}}')) {
            temp = temp.slice(1, -1)
            try {
                sourcecode = JSON.parse(temp);
            } catch (e) {
                console.log(e, address)
            }
        } else {
            sourcecode = {
                [code.ContractName]: temp
            }
        }
        let implementation: GetContractSourceCodeFormatResponse | null = null
        // avoid implemention === address cycle
        if (code.Implementation && ethers.isAddress(code.Implementation) && ethers.getAddress(code.Implementation).toLowerCase() !== ethers.getAddress(address).toLowerCase()) {
            implementation = await getContract(code.Implementation, mergedAbi)
        }
        return {
            address,
            mergedAbi,
            abi,
            sourcecode,
            bytecode: code.Bytecode,
            implementation,
            contractName: code.ContractName,
            constructorArguments: code.ConstructorArguments,
            compilerVersion: code.CompilerVersion,
            optimizationUsed: code.OptimizationUsed,
            runs: code.Runs,
            evmVersion: code.EVMVersion,
            library: code.Library,
            licenseType: code.LicenseType,
            proxy: code.Proxy,
            swarmSource: code.SwarmSource
        }
    }

    async function getContract(addr: string, mergedAbi: ethers.JsonFragment[]): Promise<GetContractSourceCodeFormatResponse | null> {
        const address = ethers.getAddress(addr).toLowerCase()
        const bytecode = await etherscanProvider.getCode(address, 'latest')
        if (bytecode === '0x') {
            return null
        }
        const info = await getSourceCode({ address })
        if (info.length !== 1) {
            throw new Error(`${address} has no source code`)
        }
        const code = { ...info[0], Bytecode: bytecode }
        let implementation = code.Implementation
        if (!implementation) {
            const slot = await etherscanProvider.getStorage(address, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', 'latest')
            const implementionSlot = ethers.stripZerosLeft(slot)
            if (implementionSlot !== '0x') {
                code.Implementation = implementionSlot
            }
        }
        return await parseContract(address, code, mergedAbi)
    }

    async function handleResponse<T>(response: Promise<Data<T>>) {
        return await response.then(r => r.result)
    }

    return {
        [Module.Provider]: etherscanProvider,
        [Module.Account]: {
            /**
                 * Returns the amount of Tokens a specific account owns.
                 */
            tokenBalance: function (query: AccountTokenBalanceQuery) {
                return handleResponse(get<AccountTokenBalanceResponse>(Module.Account, Object.assign({
                    action: 'tokenbalance',
                    tag: 'latest',
                }, query)));
            },
            /**
             * Returns the balance of a sepcific account
             */
            balance: function <T extends AccountBalanceQuery>({ address, tag }: T) {
                let action = 'balance';
                if (typeof address !== 'string' && address && address.length) {
                    address = address.join(',');
                    action = 'balancemulti';
                }

                return handleResponse(get<AccountBalanceResponse<T>>(Module.Account, Object.assign({
                    action,
                    address,
                    tag: 'latest'
                }, { tag })));
            },
            /**
             * Get a list of transactions for a specfic address
             */
            txList: async function (query: AccountTxListQuery): Promise<Data<(AccountTxListResponse | GetEtherCompatTxListResponse)[]>> {
                const result = await get<AccountTxListResponse[]>(Module.Account, Object.assign({
                    action: 'txlist',
                    startblock: 0,
                    endblock: 'latest',
                    sort: Sort.ASC
                }, omit(query, 'compatable')));
                if (query.compatable) {
                    return handleTxList(result)
                }
                return result
            },
            /**
             * Get a list of internal transactions
             */
            txListInternal: function (query: AccountTxListInternalQuery) {
                return get<AccountTxListInternalResponse[]>(Module.Account, Object.assign({
                    action: 'txlistinternal',
                    startblock: 0,
                    endblock: 'latest',
                    sort: Sort.ASC
                }, query));
            },
            /**
             * Get a list of blocks that a specific account has mineds
             */
            getMinedBlocks: function (query: AccountMineBlocksQuery) {
                return get<AccountMineBlocksResponse>(Module.Account, Object.assign({
                    action: 'getminedblocks',
                    blocktype: 'blocks',
                }, query));
            },
            /**
            * Get a list of "ERC20 - Token Transfer Events" by Address
            */
            tokenTx: function (query: AccountERC20TokenTransferEventQuery) {
                return get<AccountERC20TokenTransferEventResponse[]>(Module.Account, Object.assign({
                    action: 'tokentx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: Sort.ASC
                }, query));
            },

            /**
            * Get a list of "ERC721 - Token Transfer Events" by Address
            */
            tokenNftTx: function (query: AccountERC721TokenTransferEventQuery) {
                return get<AccountERC721TokenTransferEventResponse[]>(Module.Account, Object.assign({
                    action: 'tokennfttx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: Sort.ASC
                }, query));
            },
            /**
            * Get a list of "ERC1155 - Token Transfer Events" by Address
            */
            token1155Tx: function (query: AccountERC1155TokenTransferEventQuery) {
                return get<AccountERC1155TokenTransferEventResponse[]>(Module.Account, Object.assign({
                    action: 'token1155tx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: Sort.ASC
                }, query));
            },
            /**
             * Gethistorical ether balance for a single address by blockNo.
             */
            balanceHistory(query: AccountHistoryBalanceOfEthQuery) {
                return handleResponse(get<AccountHistoryBalanceOfEthResponse>(Module.Account, Object.assign({
                    action: 'balancehistory'
                }, query)));
            },
            getTokenBalance: function (query: GetTokenBalanceQuery) {
                return handleResponse(get<GetTokenBalanceResponse>(Module.Account, Object.assign({
                    action: 'tokenbalance',
                    contractaddress: query.contractAddress
                }, query)));
            }
        },
        [Module.Logs]: {
            /**
               * The Event Log API was designed to provide an alternative to the native eth_getLogs.
               */
            getLogs: async function (query: GetLogsQuery): Promise<Data<(GetEtherCompatLogsResponse | GetLogsResponseFormat)[]>> {
                const result = await get<GetLogsResponse[]>(Module.Logs, Object.assign({
                    action: 'getLogs',
                    fromBlock: typeof query.startblock === 'undefined' ? 0 : query.startblock,
                    toBlock: typeof query.endblock === 'undefined' ? 'latest' : query.endblock,
                }, omit(query, 'compatable'))).then(response => ({
                    ...response,
                    result: response.result.map(el => ({ ...omit(el, 'transactionHash'), hash: el.transactionHash }))
                }));
                if (query.compatable) {
                    return handleLogs(result)
                }
                return result
            }
        },
        [Module.Contract]: {
            /**
               * Get the ABI 
               */
            getABI: function (query: GetContractABIQuery) {
                return handleResponse(get<GetContractABIResponse>(Module.Contract, Object.assign({
                    action: 'getabi',
                }, query)));
            },
            /**
             * Get the contract source code 
             */
            getSourceCode,
            /**
             * Get the contract source code ,if it is a proxy contract, the implementation source code will be fetched automaticly,
             * @param query 
             * @returns 
             */
            getSourceCodeWithImpl: function (query: GetContractSourceCodeQuery): Promise<GetContractSourceCodeFormatResponse | null> {
                return getContract(query.address, [])
            },
            getContractCreation: function (query: GetContractCreationQuery) {
                return handleResponse(get<GetContractCreationResponse[]>(Module.Contract, Object.assign({
                    action: 'getcontractcreation',
                }, query)));
            }
        },
        [Module.Block]: {
            /**
             * Find the block reward for a given address and block
             */
            getBlockreward: function (query: BlockRewardQuery) {
                return handleResponse(get<BlockRewardResponse>(Module.Block, Object.assign({
                    action: 'getblockreward',
                }, query)));
            },
            /**
             * Find the block countdown for a given address and block
             */
            getBlockCountdown: function (query: BlockCountdownQuery) {
                return handleResponse(get<BlockCountdownResponse>(Module.Block, Object.assign({
                    action: 'getblockcountdown',
                }, query)));
            },
            /**
             * Find the block no for a given timestamp
             */
            getBlockNumberByTime: function (query: BlockNoByTimestampQuery) {
                return handleResponse(get<BlockNoByTimestampResponse>(Module.Block, Object.assign({
                    action: 'getblocknobytime',
                }, query)));
            }
        },
        [Module.Transaction]: {
            getStatus: function (query: GetTransactionStatusQuery) {
                return handleResponse(get<GetTransactionStatusResponse>(Module.Transaction, Object.assign({
                    action: 'getstatus',
                }, query)));
            },
            getTxReceiptStatus: function (query: GetTransactionReceiptStatusQuery) {
                return handleResponse(get<GetTransactionReceiptStatusResponse>(Module.Transaction, Object.assign({
                    action: 'gettxreceiptstatus',
                }, query)));
            }
        }
    }
}

export function etherscanPageData(chainOrBaseURL: string, apiKey: string, customFetch?: CustomFetch, globalAutoStart: boolean = true) {
    const etherscan = etherscanAPI(chainOrBaseURL, apiKey, customFetch)
    function fetchPageData<Query, ResponseItem extends { blockNumber: string, logIndex?: string, hash: string }>(getData: (query: Query) => Promise<Data<ResponseItem[]>>) {
        return function (q: Query, cb: (currentPageData: ResponseItem[], currentPageIndex: number, accumulatedData: ResponseItem[]) => void, autoStart?: boolean) {
            const query = q as { page: number, offset: number, sort: Sort, startblock?: BlockNumber, endblock?: BlockNumber }
            if (query.offset * query.page > MAX_SIZE) {
                throw new Error(`page * offset should be less than ${MAX_SIZE}`)
            }
            const data: ResponseItem[] = []
            let isStopped = false
            let index = 0
            let page = query.page
            let accItemLength = 0
            let nextQuery = query

            async function fetchData(query: any) {
                let data: Data<ResponseItem[]> = await getData(query)
                index++
                return data
            }

            async function loop() {
                if (!isStopped) {
                    let response: Data<ResponseItem[]> | null = await fetchData(query)
                    accItemLength = accItemLength + response.result.length
                    while (response && response.status === '1' && response.result.length > 0) {
                        data.push(...response.result)
                        cb(response.result, index, data)
                        if (accItemLength >= MAX_SIZE) {
                            const startblock = (query.sort === Sort.ASC || !query.sort) ? Number(data[data.length - 1].blockNumber) : query.startblock
                            const endblock = query.sort === Sort.DESC ? Number(data[data.length - 1].blockNumber) : query.endblock
                            page = 1
                            nextQuery = {
                                ...nextQuery,
                                startblock: startblock,
                                endblock: endblock,
                                page
                            }
                            if (isStopped) {
                                break;
                            }
                            const res = await fetchData(nextQuery)
                            const last2000Data = data.slice(-2000)
                            response = {
                                ...res,
                                result: res.result.filter(el => {
                                    return !last2000Data.find(item => item.blockNumber === el.blockNumber && item.hash === el.hash && item.logIndex === el.logIndex)
                                })
                            }
                            accItemLength = res.result.length
                        } else {
                            page++
                            nextQuery = {
                                ...nextQuery,
                                page
                            }
                            if (isStopped) {
                                break;
                            }
                            response = await fetchData(nextQuery)
                            accItemLength = accItemLength + response.result.length
                        }
                    }
                }
            }

            function resume() {
                isStopped = false
                loop()
            }

            function stop() {
                isStopped = true
                return nextQuery
            }
            if (typeof autoStart === 'boolean' ? autoStart : globalAutoStart) {
                resume()
            }

            return { resume, stop }
        }
    }

    return {
        ...etherscan,
        [Module.Account]: {
            ...etherscan.account,
            txList: fetchPageData(etherscan.account.txList),
            txListInternal: fetchPageData(etherscan.account.txListInternal),
            tokenTx: fetchPageData(etherscan.account.tokenTx),
            tokenNftTx: fetchPageData(etherscan.account.tokenNftTx),
            token1155Tx: fetchPageData(etherscan.account.token1155Tx)
        },
        [Module.Logs]: {
            getLogs: fetchPageData(etherscan.logs.getLogs)
        }
    }
}

export default etherscanAPI