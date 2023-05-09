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
exports.tronscanPageData = exports.tronscanAPI = void 0;
const qs_1 = __importDefault(require("qs"));
const whatwg_url_1 = require("whatwg-url");
const types_1 = require("../types");
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
function handleTxList(response) {
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
function handleLogs(response) {
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
                        TRON_PRO_API_KEY: apiKey,
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
        [types_1.Module.Provider]: new tron_jsonrpc_provider_1.default(new whatwg_url_1.URL(`/jsonrpc`, baseURL).toString()),
        [types_1.Module.Account]: {
            accountInfo: function (query) {
                return handleResponse(get(['accounts', query.address], (0, omit_1.default)(query, ['address'])));
            },
            txList: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['accounts', query.address, 'transactions'], (0, omit_1.default)(query, ['address']));
                    if (options.dataCompatible) {
                        return handleTxList(result);
                    }
                    return result;
                });
            },
            tokenTransfer: function (query) {
                return get(['accounts', query.address, 'transactions', 'trc20'], (0, omit_1.default)(query, ['address']));
            }
        },
        [types_1.Module.Contract]: {
            txList: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['contracts', query.address, 'transactions'], (0, omit_1.default)(query, ['address']));
                    if (options.dataCompatible) {
                        return handleTxList(result);
                    }
                    return result;
                });
            },
            tokenBalance: function (query) {
                return get(['contracts', query.address, 'tokens'], (0, omit_1.default)(query, 'address'));
            }
        },
        [types_1.Module.Logs]: {
            txLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['transactions', query.txId, 'events'], (0, omit_1.default)(query, 'txId'));
                    return handleLogs(result);
                });
            },
            contractLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['contracts', query.address, 'events'], (0, omit_1.default)(query, 'address'));
                    return handleLogs(result);
                });
            },
            blockLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(['blocks', query.blockNumber + '', 'events'], (0, omit_1.default)(query, 'blockNumber'));
                    return handleLogs(result);
                });
            }
        }
    };
}
exports.tronscanAPI = tronscanAPI;
function tronscanPageData(chainOrBaseURL, apiKey, customFetch, options = { globalAutoStart: true }) {
    const fetch = customFetch || utils_1.defaultCustomFetch;
    const tronscan = tronscanAPI(chainOrBaseURL, apiKey, customFetch, options);
    const retries = typeof options.retry === 'string' ? options.retry : (options.retry || 3);
    const operation = retry_1.default.operation(Object.assign({
        minTimeout: 10000,
        maxTimeout: 30000,
        randomize: false
    }, typeof retries === 'string' ? {
        forever: true
    } : {
        retries: retries,
    }));
    function fetchPageData(getData) {
        return function (query, cb, autoStart) {
            const data = [];
            let nextLink = '';
            let currentLink = '';
            let isStopped = false;
            let index = 0;
            const request = function (query) {
                var _a, _b;
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let data;
                        if (!nextLink) {
                            data = yield getData(Object.assign({}, query));
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
                        // @ts-ignore
                        throw e;
                    }
                });
            };
            const get = function (query) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (retries === 0) {
                        const data = yield request(query);
                        if (options.debug) {
                            console.log(`${colors_1.default.green(`${(_a = node_emoji_1.default.find('✅')) === null || _a === void 0 ? void 0 : _a.emoji}`)} ${currentLink}`);
                        }
                        return data;
                    }
                    return new Promise((resolve, reject) => {
                        operation.attempt(function (attempt) {
                            request(query).then((data) => {
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
                        let response = yield get(query);
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
                                response = yield get(query);
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
        [types_1.Module.Provider]: tronscan.provider,
        [types_1.Module.Account]: {
            accountInfo: tronscan.account.accountInfo,
            txList: fetchPageData(tronscan.account.txList),
            tokenTransfer: fetchPageData(tronscan.account.tokenTransfer)
        },
        [types_1.Module.Contract]: {
            tokenBalance: fetchPageData(tronscan.contract.tokenBalance),
            txList: fetchPageData(tronscan.contract.txList)
        },
        [types_1.Module.Logs]: {
            txLogs: fetchPageData(tronscan.logs.txLogs),
            contractLogs: fetchPageData(tronscan.logs.contractLogs),
            blockLogs: fetchPageData(tronscan.logs.blockLogs),
        }
    };
}
exports.tronscanPageData = tronscanPageData;
exports.default = tronscanAPI;
//# sourceMappingURL=index.js.map