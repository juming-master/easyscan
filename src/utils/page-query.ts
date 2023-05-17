import colors from 'colors'
import BigNumber from "bignumber.js"
import { Data, Options, Query, Sort } from '../types'

export function fetchOffsetPageData<Args, Item>({ getData, formatArgs, parseArgs, checkBlock, isEqualItem, options }: { getData: (qs: Args) => Promise<Data<Item[]>>, formatArgs: (query: Query) => Args, parseArgs: (args: Args) => Query, checkBlock: (item: Item) => number, isEqualItem: (a: Item, b: Item) => boolean, options?: Options & { maxSize: number } }) {
    return function (args: Args, cb: (currentPageData: Item[], currentPageIndex: number, accumulatedData: Item[], isFinish: boolean) => void, autoStart?: boolean) {
        const query = parseArgs(args)
        const data: Item[] = []
        let isStopped = false
        let page = query.page || 1
        let limit = query.limit || 200
        let index = 0
        let accItemLength = 0
        let nextQuery = query
        let sort = query.sort || Sort.ASC
        let _autoStart = typeof autoStart === 'boolean' ? autoStart : typeof options?.autoStart === 'boolean' ? options.autoStart : true
        let maxSize = options?.maxSize || 10000
        let debug = options?.debug

        if (page * limit > maxSize) {
            throw new Error(`page * offset should be less than ${maxSize}`)
        }

        async function loop() {
            let response: Data<Item[]>
            let isEnd: boolean
            do {
                if (accItemLength + limit > maxSize) {
                    const lastItem = data[data.length - 1]!
                    const block = checkBlock(lastItem)
                    const start = sort === Sort.ASC ? block : query.start
                    const end = sort === Sort.DESC ? block : query.end
                    page = 1
                    nextQuery = {
                        ...nextQuery,
                        sort,
                        page,
                        limit
                    }
                    if (start !== undefined) {
                        nextQuery.start = start
                    }
                    if (end !== undefined) {
                        nextQuery.end = end
                    }
                    accItemLength = 0
                } else {
                    nextQuery = {
                        ...nextQuery,
                        sort,
                        page,
                        limit
                    }
                }
                if (isStopped) {
                    if (debug) {
                        console.log(`${colors.red('Stop')}`)
                    }
                    return
                }
                response = await getData(formatArgs(nextQuery))
                if (response.result.length > limit) {
                    throw new Error(`Response result count is greater than limit?`)
                }
                isEnd = response.result.length < limit
                if (page === 1) {
                    const prevPageData = data.slice(-limit)
                    response = {
                        ...response,
                        result: response.result.filter(el => {
                            return !prevPageData.find(item => isEqualItem(el, item))
                        })
                    }
                }
                const result = response.result
                accItemLength += result.length
                data.push(...result)
                page++
                const newIndex = new BigNumber(data.length).idiv(limit).toNumber()
                if (newIndex > index) {
                    const currentPageData = data.slice(index * limit, newIndex * limit)
                    index = newIndex
                    cb(currentPageData, index, data, false)
                }
            } while (!isEnd)
            cb([], index, data, true)
        }

        function resume() {
            if (!isStopped) {
                return
            }
            if (debug) {
                console.log(`${colors.green('Resume')}`)
            }
            isStopped = false
            loop()
        }

        function stop() {
            isStopped = true
            return nextQuery
        }

        if (_autoStart) {
            loop()
        }

        return { resume, stop }
    }
}

// function fetchPageData<Query extends PageQuery, ResponseItem>(getData: (query: Query) => Promise<TronData<ResponseItem[]>>, matchFields?: (item: ResponseItem) => { blockTimestamp: number, blockNumber?: number, hash: string, logIndex?: number }) {
//     return function (query: Query, cb: (currentPageData: ResponseItem[], currentPageIndex: number, accumulatedData: ResponseItem[], isFinish: boolean) => void, autoStart?: boolean) {
//         const data: ResponseItem[] = []
//         let nextLink = ''
//         let currentLink = ''
//         let isStopped = false
//         let index = 0
//         let nextQuery = query

//         const request = async function (): Promise<TronData<ResponseItem[]>> {
//             try {
//                 let data: TronData<ResponseItem[]>
//                 if (!nextLink) {
//                     data = await getData({ ...nextQuery })
//                     currentLink = data.meta.links?.current || ''
//                 } else {
//                     data = await fetch(nextLink, options)
//                     currentLink = nextLink || ''
//                 }
//                 index++
//                 nextLink = data.meta.links?.next || ''
//                 return data
//             } catch (e) {
//                 debugger
//                 //@ts-ignore
//                 if (e?.response?.data?.statusCode === 400 && matchFields) {
//                     const { blockTimestamp } = matchFields(last(data)!)
//                     const maxTimestamp = (query.orderBy === BlockTimestampSort.DESC || !query.orderBy) ? Number(blockTimestamp) : query.maxTimestamp
//                     const minTimestamp = query.orderBy === BlockTimestampSort.ASC ? Number(blockTimestamp) : query.minTimestamp
//                     if (maxTimestamp !== undefined) {
//                         nextQuery.maxTimestamp = maxTimestamp
//                     }
//                     if (minTimestamp !== undefined) {
//                         nextQuery.minTimestamp = minTimestamp
//                     }
//                     nextLink = ''
//                     currentLink = ''
//                     let response = await request()
//                     const last2000Data = data.slice(-2000)
//                     const uniqResponseData = (response?.data || []).filter(el => {
//                         const { blockTimestamp, blockNumber, hash, logIndex } = matchFields(el)
//                         return !last2000Data.find(dataItem => {
//                             const item = matchFields(dataItem)
//                             return item.blockNumber === blockNumber && item.blockTimestamp === blockTimestamp && item.hash === hash && item.logIndex === logIndex
//                         })
//                     })
//                     return Object.assign({}, response, {
//                         data: uniqResponseData
//                     })
//                 }
//                 throw e
//             }
//         }

//         const get = async function () {
//             if (retries === 0) {
//                 const data = await request()
//                 if (options.debug) {
//                     console.log(`${colors.green(`${nodeEmoji.find('✅')?.emoji}`)} ${currentLink}`)
//                 }
//                 return data
//             }
//             return new Promise<TronData<ResponseItem[]>>((resolve, reject) => {
//                 operation.attempt(function (attempt) {
//                     request().then((data) => {
//                         if (options?.debug) {
//                             console.log(`${colors.green(`${nodeEmoji.find('✅')?.emoji}`)} ${currentLink}`)
//                         }
//                         resolve(data)
//                     }).catch(e => {
//                         if (operation.retry(e)) {
//                             if (options?.debug) {
//                                 const message = e?.response?.data?.error || e.message
//                                 console.log(`${colors.yellow(`${nodeEmoji.find('❗️')?.emoji}Retry ${attempt} times due to [${message}]: `)} ${nextLink}`)
//                             }
//                             return;
//                         }
//                         reject(operation.mainError())
//                     })
//                 })
//             })
//         }

//         async function loop() {
//             if (!isStopped) {
//                 let response: TronData<ResponseItem[]> | null = await get()
//                 while (response && response.success && response.data.length > 0) {
//                     data.push(...response.data)
//                     cb(response.data, index, data, false)
//                     if (nextLink) {
//                         if (isStopped) {
//                             if (options.debug) {
//                                 console.log(`${colors.red('Stop')}`)
//                             }
//                             return;
//                         }
//                         response = await get()
//                     } else {
//                         response = null
//                     }
//                 }
//                 cb([], index, data, true)
//             }
//         }

//         function resume() {
//             if (!isStopped) {
//                 return
//             }
//             if (options.debug) {
//                 console.log(`${colors.green('Resume')}`)
//             }
//             isStopped = false
//             loop()
//         }

//         function stop() {
//             isStopped = true
//             return nextLink || currentLink
//         }

//         if (typeof autoStart === 'boolean' ? autoStart : typeof options.globalAutoStart === 'boolean' ? options.globalAutoStart : true) {
//             loop()
//         }

//         return { resume, stop }
//     }
// }