"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.etherscanPageData = exports.etherscanAPI = void 0;
const qs_1 = __importDefault(require("qs"));
const types_1 = require("./types");
__exportStar(require("./types"), exports);
const whatwg_url_1 = require("whatwg-url");
const base_urls_1 = __importDefault(require("./base-urls"));
const types_2 = require("../types");
const lodash_1 = require("lodash");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = __importStar(require("ethers"));
const MAX_SIZE = 10000;
ethers_1.EtherscanProvider;
function handleTxList(response) {
    const result = response.result.map(el => {
        return {
            blockNumber: el.blockNumber,
            timeStamp: el.timeStamp,
            hash: el.hash,
            from: el.from,
            to: el.to,
            value: el.value,
            fee: new bignumber_js_1.default(el.gasPrice).times(el.gasUsed).toFixed(),
            isError: el.isError === '0',
            input: el.input,
        };
    });
    return Object.assign(Object.assign({}, response), { result });
}
function handleLogs(response) {
    return response;
}
function etherscanAPI(chainOrBaseURL, apiKey, customFetch) {
    const fetch = customFetch || types_2.defaultCustomFetch;
    //@ts-ignore: TS7053
    const baseURL = Object.keys(base_urls_1.default).includes(chainOrBaseURL) ? base_urls_1.default[chainOrBaseURL] : chainOrBaseURL;
    const chain = Object.keys(base_urls_1.default).includes(chainOrBaseURL) ? chainOrBaseURL : (0, lodash_1.findKey)(base_urls_1.default, value => chainOrBaseURL.indexOf(value) === 0);
    const network = new ethers_1.Network(chain || 'unknown', Number(chain || 1));
    network.attachPlugin(new ethers_1.EtherscanPlugin(baseURL));
    const etherscanProvider = new ethers_1.EtherscanProvider(network, apiKey);
    function get(module, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new whatwg_url_1.URL(`/api?${qs_1.default.stringify(Object.assign({ apiKey: apiKey, module }, query))}`, baseURL);
            var data = yield fetch(url.toString());
            if (data.status && data.status !== types_1.Status.SUCCESS) {
                let returnMessage = data.message || 'NOTOK';
                if (returnMessage === 'No transactions found' || returnMessage === 'No records found') {
                    return data;
                }
                if (data.result && typeof data.result === 'string') {
                    returnMessage = data.result;
                }
                else if (data.message && typeof data.message === 'string') {
                    returnMessage = data.message;
                }
                throw new Error(returnMessage);
            }
            if (data.error) {
                let message = data.error;
                if (typeof data.error === 'object' && data.error.message) {
                    message = data.error.message;
                }
                throw message;
            }
            return data;
        });
    }
    function getSourceCode(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return get(types_2.Module.Contract, Object.assign({
                action: 'getsourcecode',
            }, query)).then(r => r.result);
        });
    }
    function parseContract(address, code, mergedAbi) {
        return __awaiter(this, void 0, void 0, function* () {
            let abi = [];
            if (code.ABI && ((code.ABI.startsWith('[') && code.ABI.endsWith(']')) || (code.ABI.startsWith('{') && code.ABI.endsWith('}')))) {
                try {
                    abi = JSON.parse(code.ABI);
                }
                catch (e) {
                    console.error(e, address);
                }
            }
            let toMerged = [...abi];
            // for proxy contract, reserve the constructor. for implementation, remove it.
            if (mergedAbi.length > 0) {
                const index = toMerged.findIndex(el => el.type === 'constructor');
                if (index > -1) {
                    toMerged.splice(index, 1);
                }
            }
            mergedAbi.push(...toMerged);
            let sourcecode = {};
            let temp = code.SourceCode.trim();
            if (temp.startsWith('{{') && temp.endsWith('}}')) {
                temp = temp.slice(1, -1);
                try {
                    sourcecode = JSON.parse(temp);
                }
                catch (e) {
                    console.log(e, address);
                }
            }
            else {
                sourcecode = {
                    [code.ContractName]: temp
                };
            }
            let implementation = null;
            // avoid implemention === address cycle
            if (code.Implementation && ethers_1.default.isAddress(code.Implementation) && ethers_1.default.getAddress(code.Implementation).toLowerCase() !== ethers_1.default.getAddress(address).toLowerCase()) {
                implementation = yield getContract(code.Implementation, mergedAbi);
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
            };
        });
    }
    function getContract(addr, mergedAbi) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = ethers_1.default.getAddress(addr).toLowerCase();
            const bytecode = yield etherscanProvider.getCode(address, 'latest');
            if (bytecode === '0x') {
                return null;
            }
            const info = yield getSourceCode({ address });
            if (info.length !== 1) {
                throw new Error(`${address} has no source code`);
            }
            const code = Object.assign(Object.assign({}, info[0]), { Bytecode: bytecode });
            let implementation = code.Implementation;
            if (!implementation) {
                const slot = yield etherscanProvider.getStorage(address, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', 'latest');
                const implementionSlot = ethers_1.default.stripZerosLeft(slot);
                if (implementionSlot !== '0x') {
                    code.Implementation = implementionSlot;
                }
            }
            return yield parseContract(address, code, mergedAbi);
        });
    }
    function handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield response.then(r => r.result);
        });
    }
    return {
        [types_2.Module.Provider]: etherscanProvider,
        [types_2.Module.Account]: {
            /**
                 * Returns the amount of Tokens a specific account owns.
                 */
            tokenBalance: function (query) {
                return handleResponse(get(types_2.Module.Account, Object.assign({
                    action: 'tokenbalance',
                    tag: 'latest',
                }, query)));
            },
            /**
             * Returns the balance of a sepcific account
             */
            balance: function ({ address, tag }) {
                let action = 'balance';
                if (typeof address !== 'string' && address && address.length) {
                    address = address.join(',');
                    action = 'balancemulti';
                }
                return handleResponse(get(types_2.Module.Account, Object.assign({
                    action,
                    address,
                    tag: 'latest'
                }, { tag })));
            },
            /**
             * Get a list of transactions for a specfic address
             */
            txList: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(types_2.Module.Account, Object.assign({
                        action: 'txlist',
                        startblock: 0,
                        endblock: 'latest',
                        sort: types_1.Sort.ASC
                    }, (0, lodash_1.omit)(query, 'compatable')));
                    if (query.compatable) {
                        return handleTxList(result);
                    }
                    return result;
                });
            },
            /**
             * Get a list of internal transactions
             */
            txListInternal: function (query) {
                return get(types_2.Module.Account, Object.assign({
                    action: 'txlistinternal',
                    startblock: 0,
                    endblock: 'latest',
                    sort: types_1.Sort.ASC
                }, query));
            },
            /**
             * Get a list of blocks that a specific account has mineds
             */
            getMinedBlocks: function (query) {
                return get(types_2.Module.Account, Object.assign({
                    action: 'getminedblocks',
                    blocktype: 'blocks',
                }, query));
            },
            /**
            * Get a list of "ERC20 - Token Transfer Events" by Address
            */
            tokenTx: function (query) {
                return get(types_2.Module.Account, Object.assign({
                    action: 'tokentx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: types_1.Sort.ASC
                }, query));
            },
            /**
            * Get a list of "ERC721 - Token Transfer Events" by Address
            */
            tokenNftTx: function (query) {
                return get(types_2.Module.Account, Object.assign({
                    action: 'tokennfttx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: types_1.Sort.ASC
                }, query));
            },
            /**
            * Get a list of "ERC1155 - Token Transfer Events" by Address
            */
            token1155Tx: function (query) {
                return get(types_2.Module.Account, Object.assign({
                    action: 'token1155tx',
                    startblock: 0,
                    endblock: 'latest',
                    sort: types_1.Sort.ASC
                }, query));
            },
            /**
             * Gethistorical ether balance for a single address by blockNo.
             */
            balanceHistory(query) {
                return handleResponse(get(types_2.Module.Account, Object.assign({
                    action: 'balancehistory'
                }, query)));
            },
            getTokenBalance: function (query) {
                return handleResponse(get(types_2.Module.Account, Object.assign({
                    action: 'tokenbalance',
                    contractaddress: query.contractAddress
                }, query)));
            }
        },
        [types_2.Module.Logs]: {
            /**
               * The Event Log API was designed to provide an alternative to the native eth_getLogs.
               */
            getLogs: function (query) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield get(types_2.Module.Logs, Object.assign({
                        action: 'getLogs',
                        fromBlock: typeof query.startblock === 'undefined' ? 0 : query.startblock,
                        toBlock: typeof query.endblock === 'undefined' ? 'latest' : query.endblock,
                    }, (0, lodash_1.omit)(query, 'compatable'))).then(response => (Object.assign(Object.assign({}, response), { result: response.result.map(el => (Object.assign(Object.assign({}, (0, lodash_1.omit)(el, 'transactionHash')), { hash: el.transactionHash }))) })));
                    return result;
                });
            }
        },
        [types_2.Module.Contract]: {
            /**
               * Get the ABI
               */
            getABI: function (query) {
                return handleResponse(get(types_2.Module.Contract, Object.assign({
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
            getSourceCodeWithImpl: function (query) {
                return getContract(query.address, []);
            },
            getContractCreation: function (query) {
                return handleResponse(get(types_2.Module.Contract, Object.assign({
                    action: 'getcontractcreation',
                }, query)));
            }
        },
        [types_2.Module.Block]: {
            /**
             * Find the block reward for a given address and block
             */
            getBlockreward: function (query) {
                return handleResponse(get(types_2.Module.Block, Object.assign({
                    action: 'getblockreward',
                }, query)));
            },
            /**
             * Find the block countdown for a given address and block
             */
            getBlockCountdown: function (query) {
                return handleResponse(get(types_2.Module.Block, Object.assign({
                    action: 'getblockcountdown',
                }, query)));
            },
            /**
             * Find the block no for a given timestamp
             */
            getBlockNumberByTime: function (query) {
                return handleResponse(get(types_2.Module.Block, Object.assign({
                    action: 'getblocknobytime',
                }, query)));
            }
        },
        [types_2.Module.Transaction]: {
            getStatus: function (query) {
                return handleResponse(get(types_2.Module.Transaction, Object.assign({
                    action: 'getstatus',
                }, query)));
            },
            getTxReceiptStatus: function (query) {
                return handleResponse(get(types_2.Module.Transaction, Object.assign({
                    action: 'gettxreceiptstatus',
                }, query)));
            }
        }
    };
}
exports.etherscanAPI = etherscanAPI;
function etherscanPageData(chainOrBaseURL, apiKey, customFetch, globalAutoStart = true) {
    const etherscan = etherscanAPI(chainOrBaseURL, apiKey, customFetch);
    function fetchPageData(getData) {
        return function (q, cb, autoStart) {
            const query = q;
            if (query.offset * query.page > MAX_SIZE) {
                throw new Error(`page * offset should be less than ${MAX_SIZE}`);
            }
            const data = [];
            let isStopped = false;
            let index = 0;
            let page = query.page;
            const offset = query.offset || 10000;
            let accItemLength = 0;
            let nextQuery = query;
            function fetchData(query) {
                return __awaiter(this, void 0, void 0, function* () {
                    let data = yield getData(query);
                    index++;
                    return data;
                });
            }
            function loop() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!isStopped) {
                        let response = yield fetchData(Object.assign({}, query, { offset }));
                        accItemLength = accItemLength + response.result.length;
                        while (response && response.status === '1' && response.result.length === offset) {
                            data.push(...response.result);
                            cb(response.result, index, data, false);
                            if (accItemLength >= MAX_SIZE) {
                                const startblock = (query.sort === types_1.Sort.ASC || !query.sort) ? Number(data[data.length - 1].blockNumber) : query.startblock;
                                const endblock = query.sort === types_1.Sort.DESC ? Number(data[data.length - 1].blockNumber) : query.endblock;
                                page = 1;
                                nextQuery = Object.assign(Object.assign({}, nextQuery), { page,
                                    offset });
                                if (startblock !== undefined) {
                                    nextQuery.startblock = startblock;
                                }
                                if (endblock !== undefined) {
                                    nextQuery.endblock = endblock;
                                }
                                if (isStopped) {
                                    break;
                                }
                                const res = yield fetchData(nextQuery);
                                const last2000Data = data.slice(-2000);
                                response = Object.assign(Object.assign({}, res), { result: res.result.filter(el => {
                                        return !last2000Data.find(item => item.blockNumber === el.blockNumber && item.hash === el.hash && item.logIndex === el.logIndex);
                                    }) });
                                accItemLength = res.result.length;
                                if (res.result.length < offset) {
                                    break;
                                }
                            }
                            else {
                                page++;
                                nextQuery = Object.assign(Object.assign({}, nextQuery), { page,
                                    offset });
                                if (isStopped) {
                                    break;
                                }
                                response = yield fetchData(nextQuery);
                                accItemLength = accItemLength + response.result.length;
                                if (response.result.length < offset) {
                                    break;
                                }
                            }
                        }
                        cb([], index, data, true);
                    }
                });
            }
            function resume() {
                isStopped = false;
                loop();
            }
            function stop() {
                isStopped = true;
                return nextQuery;
            }
            if (typeof autoStart === 'boolean' ? autoStart : globalAutoStart) {
                resume();
            }
            return { resume, stop };
        };
    }
    return Object.assign(Object.assign({}, etherscan), { [types_2.Module.Account]: Object.assign(Object.assign({}, etherscan.account), { txList: fetchPageData(etherscan.account.txList), txListInternal: fetchPageData(etherscan.account.txListInternal), tokenTx: fetchPageData(etherscan.account.tokenTx), tokenNftTx: fetchPageData(etherscan.account.tokenNftTx), token1155Tx: fetchPageData(etherscan.account.token1155Tx) }), [types_2.Module.Logs]: {
            getLogs: fetchPageData(etherscan.logs.getLogs)
        } });
}
exports.etherscanPageData = etherscanPageData;
exports.default = etherscanAPI;
//# sourceMappingURL=index.js.map