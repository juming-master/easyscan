"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOffsetPageData = void 0;
const colors_1 = __importDefault(require("colors"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("../types");
function fetchOffsetPageData({ getData, formatArgs, parseArgs, checkBlock, isEqualItem, options }) {
    return function (args, cb, autoStart) {
        const query = parseArgs(args);
        const data = [];
        let isStopped = false;
        let page = query.page || 1;
        let limit = query.limit || 10000;
        let index = 0;
        let accItemLength = 0;
        let nextQuery = query;
        let sort = query.sort || types_1.Sort.ASC;
        let _autoStart = typeof autoStart === 'boolean' ? autoStart : typeof (options === null || options === void 0 ? void 0 : options.autoStart) === 'boolean' ? options.autoStart : true;
        let maxSize = (options === null || options === void 0 ? void 0 : options.maxSize) || 10000;
        let debug = options === null || options === void 0 ? void 0 : options.debug;
        if (page * limit > maxSize) {
            throw new Error(`page * offset should be less than ${maxSize}`);
        }
        function loop() {
            return __awaiter(this, void 0, void 0, function* () {
                let response;
                let isEnd;
                do {
                    if (accItemLength + limit > maxSize) {
                        const lastItem = data[data.length - 1];
                        const block = checkBlock(lastItem);
                        const start = sort === types_1.Sort.ASC ? block : query.start;
                        const end = sort === types_1.Sort.DESC ? block : query.end;
                        page = 1;
                        nextQuery = Object.assign(Object.assign({}, nextQuery), { sort,
                            page,
                            limit });
                        if (start !== undefined) {
                            nextQuery.start = start;
                        }
                        if (end !== undefined) {
                            nextQuery.end = end;
                        }
                        accItemLength = 0;
                    }
                    else {
                        nextQuery = Object.assign(Object.assign({}, nextQuery), { sort,
                            page,
                            limit });
                    }
                    if (isStopped) {
                        if (debug) {
                            console.log(`${colors_1.default.red('Stop')}`);
                        }
                        return;
                    }
                    response = yield getData(formatArgs(nextQuery));
                    if (response.result.length > limit) {
                        throw new Error(`Response result count is greater than limit?`);
                    }
                    isEnd = response.result.length < limit;
                    if (page === 1) {
                        const prevPageData = data.slice(-limit);
                        response = Object.assign(Object.assign({}, response), { result: response.result.filter(el => {
                                return !prevPageData.find(item => isEqualItem(el, item));
                            }) });
                    }
                    const result = response.result;
                    accItemLength += result.length;
                    data.push(...result);
                    page++;
                    const newIndex = new bignumber_js_1.default(data.length).idiv(limit).toNumber();
                    if (newIndex > index) {
                        const currentPageData = data.slice(index * limit, newIndex * limit);
                        index = newIndex;
                        cb(currentPageData, index, data, false);
                    }
                } while (!isEnd);
                cb([], index, data, true);
            });
        }
        function resume() {
            if (!isStopped) {
                return;
            }
            if (debug) {
                console.log(`${colors_1.default.green('Resume')}`);
            }
            isStopped = false;
            loop();
        }
        function stop() {
            isStopped = true;
            return nextQuery;
        }
        if (_autoStart) {
            loop();
        }
        return { resume, stop };
    };
}
exports.fetchOffsetPageData = fetchOffsetPageData;
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
//# sourceMappingURL=page-query.js.map