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
exports.tronscanPageData = exports.tronscanAPI = exports.formatToEtherscanLogs = exports.formatToEtherscanTxs = void 0;
const qs_1 = __importDefault(require("qs"));
const whatwg_url_1 = require("whatwg-url");
const types_1 = require("./types");
const types_2 = require("../types");
const utils_1 = require("../utils");
const base_urls_1 = __importDefault(require("./base-urls"));
const omit_1 = __importDefault(require("lodash/omit"));
const lodash_1 = require("lodash");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tron_jsonrpc_provider_1 = __importDefault(require("./tron-jsonrpc-provider"));
const defaultsDeep_1 = __importDefault(require("lodash/defaultsDeep"));
const colors_1 = __importDefault(require("colors"));
const node_emoji_1 = __importDefault(require("node-emoji"));
const retry_1 = __importDefault(require("retry"));
function formatToEtherscanTxs(response) {
    const data = response.data.map(el => {
        const value = el.raw_data.contract[0].parameter.value;
        // @ts-ignore
        const to = value.contract_address || value.to_address || value.receiver_address || value.origin_address;
        return {
            blockNumber: String(el.blockNumber),
            timeStamp: new bignumber_js_1.default(el.block_timestamp).idiv(1000, bignumber_js_1.default.ROUND_DOWN).toFixed(),
            hash: el.txID,
            from: value.owner_address,
            to,
            // @ts-ignore
            value: value.amount || '0',
            fee: el.ret[0].fee + '',
            isError: el.ret[0].contractRet !== 'SUCCESS',
            // @ts-ignore
            input: value.data,
        };
    });
    return Object.assign(Object.assign({}, response), { data });
}
exports.formatToEtherscanTxs = formatToEtherscanTxs;
function formatToEtherscanLogs(response) {
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
        };
    });
    return Object.assign(Object.assign({}, response), { data });
}
exports.formatToEtherscanLogs = formatToEtherscanLogs;
function tronscanAPI(chainOrBaseURL, apiKey, customFetch, options = { dataCompatible: false }) {
    const fetch = customFetch || utils_1.defaultCustomFetch;
    // @ts-ignore: TS7053
    const baseURL = Object.keys(base_urls_1.default).includes(chainOrBaseURL) ? base_urls_1.default[chainOrBaseURL] : chainOrBaseURL;
    const chain = Object.keys(base_urls_1.default).includes(chainOrBaseURL) ? chainOrBaseURL : (0, lodash_1.findKey)(base_urls_1.default, value => chainOrBaseURL.indexOf(value) === 0);
    function get(path, query) {
        return __awaiter(this, void 0, void 0, function* () {
            path = typeof path === 'string' ? path : path.join('/');
            const url = new whatwg_url_1.URL(`/v1/${path}`, baseURL);
            if (query) {
                url.search = qs_1.default.stringify((0, lodash_1.mapKeys)(query, (_, key) => (0, lodash_1.snakeCase)(key)));
            }
            try {
                var data = yield fetch(url.toString(), Object.assign({}, apiKey ? {
                    headers: {
                        'TRON_PRO_API_KEY': apiKey,
                        'Content-Type': 'application/json'
                    }
                } : undefined));
                if (!data.success) {
                    let returnMessage = data.error || 'NOTOK';
                    throw new Error(returnMessage);
                }
                return (0, defaultsDeep_1.default)(data, {
                    meta: {
                        links: {
                            current: url.toString()
                        }
                    }
                });
            }
            catch (e) {
                // @ts-ignore
                e.url = url.toString();
                throw e;
            }
        });
    }
    function handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield response.then(r => r.data);
        });
    }
    return {
        [types_2.Module.Provider]: new tron_jsonrpc_provider_1.default(new whatwg_url_1.URL(`/jsonrpc`, baseURL).toString()),
        [types_2.Module.Account]: {
            accountInfo: function (query) {
                return handleResponse(get(['accounts', query.address], (0, omit_1.default)(query, ['address'])));
            },
            txList: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['accounts', query.address, 'transactions'], (0, omit_1.default)(query, ['address']));
                    return result;
                });
            },
            tokenTransfer: function (query) {
                return get(['accounts', query.address, 'transactions', 'trc20'], (0, omit_1.default)(query, ['address']));
            }
        },
        [types_2.Module.Contract]: {
            txList: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['contracts', query.address, 'transactions'], (0, omit_1.default)(query, ['address']));
                    return result;
                });
            },
            tokenBalance: function (query) {
                return get(['contracts', query.address, 'tokens'], (0, omit_1.default)(query, 'address'));
            }
        },
        [types_2.Module.Logs]: {
            txLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['transactions', query.txId, 'events'], (0, omit_1.default)(query, 'txId'));
                    return result;
                });
            },
            contractLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['contracts', query.address, 'events'], (0, omit_1.default)(query, 'address'));
                    return result;
                });
            },
            blockLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['blocks', query.blockNumber + '', 'events'], (0, omit_1.default)(query, 'blockNumber'));
                    return result;
                });
            }
        }
    };
}
exports.tronscanAPI = tronscanAPI;
function tronscanPageData(chainOrBaseURL, apiKey, customFetch, options = { globalAutoStart: true }) {
    const fetch = customFetch || utils_1.defaultCustomFetch;
    const tronscan = tronscanAPI(chainOrBaseURL, apiKey, customFetch, options);
    const retries = typeof options.retry === 'string' ? options.retry : (typeof options.retry === 'number' ? options.retry : 3);
    const operation = retry_1.default.operation(Object.assign({
        minTimeout: 10000,
        maxTimeout: 30000,
        randomize: false
    }, typeof retries === 'string' ? {
        forever: true
    } : {
        retries: retries,
    }));
    function fetchPageData(getData, matchFields) {
        return function (query, cb, autoStart) {
            const data = [];
            let nextLink = '';
            let currentLink = '';
            let isStopped = false;
            let index = 0;
            let nextQuery = query;
            const request = function () {
                var _a, _b, _c, _d;
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let data;
                        if (!nextLink) {
                            data = yield getData(Object.assign({}, nextQuery));
                            currentLink = ((_a = data.meta.links) === null || _a === void 0 ? void 0 : _a.current) || '';
                        }
                        else {
                            data = yield fetch(nextLink, options);
                            currentLink = nextLink || '';
                        }
                        index++;
                        nextLink = ((_b = data.meta.links) === null || _b === void 0 ? void 0 : _b.next) || '';
                        return data;
                    }
                    catch (e) {
                        debugger;
                        //@ts-ignore
                        if (((_d = (_c = e === null || e === void 0 ? void 0 : e.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.statusCode) === 400 && matchFields) {
                            const { blockTimestamp } = matchFields((0, lodash_1.last)(data));
                            const maxTimestamp = (query.orderBy === types_1.BlockTimestampSort.DESC || !query.orderBy) ? Number(blockTimestamp) : query.maxTimestamp;
                            const minTimestamp = query.orderBy === types_1.BlockTimestampSort.ASC ? Number(blockTimestamp) : query.minTimestamp;
                            if (maxTimestamp !== undefined) {
                                nextQuery.maxTimestamp = maxTimestamp;
                            }
                            if (minTimestamp !== undefined) {
                                nextQuery.minTimestamp = minTimestamp;
                            }
                            nextLink = '';
                            currentLink = '';
                            let response = yield request();
                            const last2000Data = data.slice(-2000);
                            const uniqResponseData = ((response === null || response === void 0 ? void 0 : response.data) || []).filter(el => {
                                const { blockTimestamp, blockNumber, hash, logIndex } = matchFields(el);
                                return !last2000Data.find(dataItem => {
                                    const item = matchFields(dataItem);
                                    return item.blockNumber === blockNumber && item.blockTimestamp === blockTimestamp && item.hash === hash && item.logIndex === logIndex;
                                });
                            });
                            return Object.assign({}, response, {
                                data: uniqResponseData
                            });
                        }
                        throw e;
                    }
                });
            };
            const get = function () {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (retries === 0) {
                        const data = yield request();
                        if (options.debug) {
                            console.log(`${colors_1.default.green(`${(_a = node_emoji_1.default.find('✅')) === null || _a === void 0 ? void 0 : _a.emoji}`)} ${currentLink}`);
                        }
                        return data;
                    }
                    return new Promise((resolve, reject) => {
                        operation.attempt(function (attempt) {
                            request().then((data) => {
                                var _a;
                                if (options === null || options === void 0 ? void 0 : options.debug) {
                                    console.log(`${colors_1.default.green(`${(_a = node_emoji_1.default.find('✅')) === null || _a === void 0 ? void 0 : _a.emoji}`)} ${currentLink}`);
                                }
                                resolve(data);
                            }).catch(e => {
                                var _a, _b, _c;
                                if (operation.retry(e)) {
                                    if (options === null || options === void 0 ? void 0 : options.debug) {
                                        const message = ((_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || e.message;
                                        console.log(`${colors_1.default.yellow(`${(_c = node_emoji_1.default.find('❗️')) === null || _c === void 0 ? void 0 : _c.emoji}Retry ${attempt} times due to [${message}]: `)} ${nextLink}`);
                                    }
                                    return;
                                }
                                reject(operation.mainError());
                            });
                        });
                    });
                });
            };
            function loop() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!isStopped) {
                        let response = yield get();
                        while (response && response.success && response.data.length > 0) {
                            data.push(...response.data);
                            cb(response.data, index, data, false);
                            if (nextLink) {
                                if (isStopped) {
                                    if (options.debug) {
                                        console.log(`${colors_1.default.red('Stop')}`);
                                    }
                                    return;
                                }
                                response = yield get();
                            }
                            else {
                                response = null;
                            }
                        }
                        cb([], index, data, true);
                    }
                });
            }
            function resume() {
                if (!isStopped) {
                    return;
                }
                if (options.debug) {
                    console.log(`${colors_1.default.green('Resume')}`);
                }
                isStopped = false;
                loop();
            }
            function stop() {
                isStopped = true;
                return nextLink || currentLink;
            }
            if (typeof autoStart === 'boolean' ? autoStart : typeof options.globalAutoStart === 'boolean' ? options.globalAutoStart : true) {
                loop();
            }
            return { resume, stop };
        };
    }
    return {
        [types_2.Module.Provider]: tronscan.provider,
        [types_2.Module.Account]: {
            accountInfo: tronscan.account.accountInfo,
            txList: fetchPageData(tronscan.account.txList, (item) => {
                return {
                    blockTimestamp: item.block_timestamp,
                    blockNumber: item.blockNumber,
                    hash: item.txID
                };
            }),
            tokenTransfer: fetchPageData(tronscan.account.tokenTransfer, (item) => {
                return {
                    blockTimestamp: item.block_timestamp,
                    hash: item.transaction_id
                };
            })
        },
        [types_2.Module.Contract]: {
            tokenBalance: fetchPageData(tronscan.contract.tokenBalance),
            txList: fetchPageData(tronscan.contract.txList, (item) => {
                return {
                    blockTimestamp: item.block_timestamp,
                    blockNumber: item.blockNumber,
                    hash: item.txID
                };
            })
        },
        [types_2.Module.Logs]: {
            // @ts-ignore
            txLogs: fetchPageData(tronscan.logs.txLogs),
            contractLogs: fetchPageData(tronscan.logs.contractLogs, (item) => {
                return {
                    blockTimestamp: item.block_timestamp,
                    blockNumber: item.block_number,
                    hash: item.transaction_id,
                    logIndex: item.event_index
                };
            }),
            blockLogs: fetchPageData(tronscan.logs.blockLogs, (item) => {
                return {
                    blockTimestamp: item.block_timestamp,
                    blockNumber: item.block_number,
                    hash: item.transaction_id,
                    logIndex: item.event_index
                };
            }),
        }
    };
}
exports.tronscanPageData = tronscanPageData;
exports.default = tronscanAPI;
//# sourceMappingURL=index.js.map