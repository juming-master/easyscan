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
exports.multiscan = void 0;
const types_1 = require("../types");
const base_urls_1 = __importDefault(require("../etherscan/base-urls"));
const base_urls_2 = __importDefault(require("../tronscan/base-urls"));
const etherscan_1 = __importDefault(require("../etherscan"));
const tronscan_1 = __importDefault(require("../tronscan"));
function multiscan(chain, apiKey, customFetch) {
    const evmChainIds = Object.keys(base_urls_1.default);
    const tronNodeKeys = Object.keys(base_urls_2.default);
    if (evmChainIds.includes(chain)) {
        if (!apiKey) {
            throw new Error(`Chain ${chain} should supply the apiKey.`);
        }
        const etherscan = (0, etherscan_1.default)(chain, apiKey, customFetch);
        return {
            [types_1.Module.Account]: {
                balance: function ({ address }) {
                    return etherscan.account.balance({ address });
                }
            }
        };
    }
    else if (tronNodeKeys.includes(chain)) {
        const tronscan = (0, tronscan_1.default)(chain, apiKey, customFetch);
        return {
            [types_1.Module.Account]: {
                balance: function ({ address }) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let addr = [];
                        if (typeof address === 'string') {
                            addr = [address];
                        }
                        else {
                            addr = address;
                        }
                        const accountBalances = [];
                        for (let account of addr) {
                            accountBalances.push({
                                account,
                                balance: yield tronscan.account.accountInfo({ address: addr[0] }).then(el => `${el.balance}`)
                            });
                        }
                        return accountBalances;
                    });
                },
            }
        };
    }
}
exports.multiscan = multiscan;
exports.default = multiscan;
//# sourceMappingURL=index.js.map