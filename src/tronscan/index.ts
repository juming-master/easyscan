import qs from 'qs'
import { URL } from 'whatwg-url'
import { TronData, GetEtherCompatLogsResponse, GetTronAccountInfoQuery, GetTronTokenBalanceQuery, GetTronTokenBalanceResponse, GetTronAccountInfoResponseOrigin, GetTronAccountTokenTransferQuery, GetTronAccountTokenTransferResponse, GetTronAccountTxListQuery, GetTronAccountTxListResponse, GetTronTransactionLogsQuery, GetTronLogsResponse, GetTronContractLogsQuery, GetTronBlockLogsQuery } from './types'
import { CustomFetch, GetEtherCompatTxListResponse, Module, defaultCustomFetch } from '../types'
import baseURLs from './base-urls'
import omit from 'lodash/omit'
import { findKey, mapKeys, snakeCase } from 'lodash'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from 'ethers'
import TronProvider from './tron-jsonrpc-provider'

function handleTxList(response: TronData<GetTronAccountTxListResponse[]>): TronData<GetEtherCompatTxListResponse[]> {
    const data = response.data.map(el => {
        const value = el.raw_data.contract[0].parameter.value
        // @ts-ignore
        const to = value.contract_address || value.to_address || value.receiver_address || value.origin_address
        return {
            blockNumber: String(el.blockNumber),
            timeStamp: new BigNumber(el.block_timestamp).idiv(1000, BigNumber.ROUND_DOWN).toFixed(),
            hash: el.txID,
            from: value.owner_address,
            to,
            // @ts-ignore
            value: value.amount || '0',
            fee: el.ret[0].fee + '',
            isError: el.ret[0].contractRet !== 'SUCCESS',
            // @ts-ignore
            input: value.data,
        }
    })
    return {
        ...response,
        data
    }
}

function handleLogs(response: TronData<GetTronLogsResponse[]>): TronData<GetEtherCompatLogsResponse[]> {
    const data = response.data.map(el => {
        return {
            address: el.contract_address,
            result: el.result,
            resultType: el.result_type,
            blockNumber: Number(el.block_number) + '',
            timeStamp: el.block_timestamp + '',
            logIndex: el.event_index + '',
            hash: el.transaction_id,
            event: el.event,
            eventName: el.event_name,
        }
    })
    return {
        ...response,
        data
    }
}

export function tronscanAPI(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options: { dataCompatible?: boolean } = { dataCompatible: false }) {
    const fetch = customFetch || defaultCustomFetch
    // @ts-ignore: TS7053
    const baseURL: string = Object.keys(baseURLs).includes(chainOrBaseURL) ? baseURLs[chainOrBaseURL] : chainOrBaseURL
    const chain = Object.keys(baseURLs).includes(chainOrBaseURL) ? chainOrBaseURL : findKey(baseURLs, value => chainOrBaseURL.indexOf(value) === 0)

    async function get<T>(path: string | string[], query?: Record<string, any>) {
        path = typeof path === 'string' ? path : path.join('/')
        const url = new URL(`/v1/${path}`, baseURL)
        if (query) {
            url.search = qs.stringify(mapKeys(query, (_, key) => snakeCase(key)))
        }
        try {
            var data: TronData<T> = await fetch(url.toString(), apiKey ? {
                headers: {
                    TRON_PRO_API_KEY: apiKey,
                    'Content-Type': 'application/json'
                }
            } : undefined)
            if (!data.success) {
                let returnMessage: string = data.error || 'NOTOK';
                throw new Error(returnMessage)
            }
            return data
        } catch (e) {
            debugger
            throw e
        }
    }

    async function handleResponse<T>(response: Promise<TronData<T>>) {
        return await response.then(r => r.data)
    }

    return {
        [Module.Provider]: new TronProvider(new URL(`/jsonrpc`, baseURL).toString()),
        [Module.Account]: {
            accountInfo: function (query: GetTronAccountInfoQuery) {
                return handleResponse(get<GetTronAccountInfoResponseOrigin>(['accounts', query.address], omit(query, ['address'])))
            },
            txList: async function (query: GetTronAccountTxListQuery): Promise<TronData<(GetTronAccountTxListResponse | GetEtherCompatTxListResponse)[]>> {
                const result = await get<GetTronAccountTxListResponse[]>(['accounts', query.address, 'transactions'], omit(query, ['address']))
                if (options.dataCompatible) {
                    return handleTxList(result)
                }
                return result
            },
            tokenTransfer: function (query: GetTronAccountTokenTransferQuery) {
                return get<GetTronAccountTokenTransferResponse[]>(['accounts', query.address, 'transactions', 'trc20'], omit(query, ['address']))
            }
        },
        [Module.Contract]: {
            txList: async function (query: GetTronAccountTxListQuery): Promise<TronData<(GetTronAccountTxListResponse | GetEtherCompatTxListResponse)[]>> {
                const result = await get<GetTronAccountTxListResponse[]>(['contracts', query.address, 'transactions'], omit(query, ['address']))
                if (options.dataCompatible) {
                    return handleTxList(result)
                }
                return result
            },
            tokenBalance: function (query: GetTronTokenBalanceQuery) {
                return get<GetTronTokenBalanceResponse[]>(['contracts', query.address, 'tokens'], omit(query, 'address'))
            }
        },
        [Module.Logs]: {
            txLogs: async function (query: GetTronTransactionLogsQuery): Promise<TronData<(GetEtherCompatLogsResponse)[]>> {
                const result = await get<GetTronLogsResponse[]>(['transactions', query.txId], omit(query, 'txId'))
                return handleLogs(result)
            },
            contractLogs: async function (query: GetTronContractLogsQuery): Promise<TronData<(GetEtherCompatLogsResponse)[]>> {
                const result = await get<GetTronLogsResponse[]>(['contracts', query.address], omit(query, 'address'))
                return handleLogs(result)
            },
            blockLogs: async function (query: GetTronBlockLogsQuery): Promise<TronData<(GetEtherCompatLogsResponse)[]>> {
                const result = await get<GetTronLogsResponse[]>(['blocks', query.blockNumber + ''], omit(query, 'blockNumber'))
                return handleLogs(result)
            }
        }
    }
}

export function tronscanPageData(chainOrBaseURL: string, apiKey?: string, customFetch?: CustomFetch, options: { dataCompatible?: boolean, globalAutoStart?: boolean } = { dataCompatible: false, globalAutoStart: true }) {
    const fetch = customFetch || defaultCustomFetch
    const tronscan = tronscanAPI(chainOrBaseURL, apiKey, customFetch, options)

    function fetchPageData<Query, ResponseItem>(getData: (query: Query) => Promise<TronData<ResponseItem[]>>) {
        return function (query: Query, cb: (currentPageData: ResponseItem[], currentPageIndex: number, accumulatedData: ResponseItem[], isFinish: boolean) => void, autoStart?: boolean) {
            const data: ResponseItem[] = []
            let nextLink = ''
            let isStopped = false
            let index = 0

            async function fetchData(query: Query) {
                let data: TronData<ResponseItem[]>
                if (!nextLink) {
                    data = await getData({ ...query })
                } else {
                    data = await fetch(nextLink)
                }
                index++
                return data
            }

            async function loop() {
                if (!isStopped) {
                    let response: TronData<ResponseItem[]> | null = await fetchData(query)
                    while (response && response.success && response.data.length > 0) {
                        data.push(...response.data)
                        cb(response.data, index, data, false)
                        if (response.meta.links?.next) {
                            nextLink = response.meta.links.next
                            if (isStopped) {
                                break;
                            }
                            response = await fetchData(query)
                        } else {
                            response = null
                        }
                    }
                    cb([], index, data, true)
                }
            }

            function resume() {
                isStopped = false
                loop()
            }

            function stop() {
                isStopped = true
                return nextLink || query
            }
            if (typeof autoStart === 'boolean' ? autoStart : options.globalAutoStart) {
                resume()
            }

            return { resume, stop }
        }
    }

    return {
        [Module.Provider]: tronscan.provider,
        [Module.Account]: {
            accountInfo: tronscan.account.accountInfo,
            txList: fetchPageData(tronscan.account.txList),
            tokenTransfer: fetchPageData(tronscan.account.tokenTransfer)
        },
        [Module.Contract]: {
            tokenBalance: fetchPageData(tronscan.contract.tokenBalance),
            txList: fetchPageData(tronscan.contract.txList)
        },
        [Module.Logs]: {
            txLogs: fetchPageData(tronscan.logs.txLogs),
            contractLogs: fetchPageData(tronscan.logs.contractLogs),
            blockLogs: fetchPageData(tronscan.logs.blockLogs),
        }
    }
}
export default tronscanAPI
