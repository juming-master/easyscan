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
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const tron_format_address_1 = require("tron-format-address");
const ethers_2 = require("ethers");
class TronProvider extends ethers_1.JsonRpcProvider {
    constructor(url) {
        super(url, 'any');
    }
    formatAddress(addr) {
        if (addr.startsWith('0x')) {
            return (0, tron_format_address_1.fromHex)(addr);
        }
        return addr;
    }
    parseAddress(addr) {
        if (addr.startsWith('T')) {
            return `${(0, tron_format_address_1.toHex)(addr)}`;
        }
        return `0x${addr}`;
    }
    parseHexNumber(num) {
        return `0x${num.toString(16)}`;
    }
    formatNumber(num) {
        return num ? Number(num.toString()) : num;
    }
    formatHash(hash) {
        return hash ? hash.startsWith('0x') ? hash.slice(2) : hash : hash;
        // return hash
    }
    request(method, params) {
        const _super = Object.create(null, {
            send: { get: () => super.send }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield _super.send.call(this, `eth_${method}`, params || []);
            return result;
        });
    }
    handleBlockTag(blockTag, blockHashHandle, blockNumberHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof blockTag === 'string' && blockTag.startsWith('0x')) {
                return yield blockHashHandle(blockTag);
            }
            return yield blockNumberHandle(typeof blockTag === 'number' ? this.parseHexNumber(blockTag) : blockTag);
        });
    }
    formatTransaction(transaction) {
        let tx = Object.assign(Object.assign({}, transaction), { v: transaction.v ? Number(transaction.v.toString()) : transaction.v, from: this.formatAddress(transaction.from), to: transaction.to && this.formatAddress(transaction.to), blockNumber: Number(transaction.blockNumber), blockHash: transaction.blockHash && this.formatHash(transaction.blockHash), transactionHash: transaction.transactionHash && this.formatHash(transaction.transactionHash), value: this.formatNumber(transaction.value), gas: this.formatNumber(transaction.gas), gasPrice: this.formatNumber(transaction.gasPrice), gasUsed: this.formatNumber(transaction.gasUsed), cumulativeGasUsed: this.formatNumber(transaction.cumulativeGasUsed), effectiveGasPrice: this.formatNumber(transaction.effectiveGasPrice), transactionIndex: this.formatNumber(transaction.transactionIndex), status: this.formatNumber(transaction.status), type: this.formatNumber(transaction.type) });
        if (transaction.logs) {
            tx = Object.assign({}, tx, {
                logs: transaction.logs.map(el => {
                    return Object.assign(Object.assign({}, el), { address: this.formatAddress(el.address), blockNumber: this.formatNumber(el.blockNumber), blockHash: this.formatHash(el.blockHash), transactionHash: this.formatHash(el.transactionHash), transactionIndex: this.formatNumber(el.transactionIndex), logIndex: this.formatNumber(el.logIndex) });
                })
            });
        }
        if (transaction.logs) {
            return Object.assign({}, tx);
        }
        if (transaction.transactionHash) {
            return Object.assign(Object.assign({}, tx), { transactionHash: this.formatHash(transaction.transactionHash) });
        }
        else {
            return Object.assign(Object.assign({}, tx), { hash: this.formatHash(transaction.hash) });
        }
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this.request('accounts');
            return accounts.map(this.formatAddress);
        });
    }
    getBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNo = yield this.request('blockNumber');
            return Number(blockNo);
        });
    }
    call(tx) {
        return this.request('call', [Object.assign(Object.assign({}, tx), { from: this.parseAddress(tx.from), to: this.parseAddress(tx.to), gas: this.parseHexNumber(0), gasPrice: this.parseHexNumber(0) })]);
    }
    getChainId() {
        return this.request('chainId');
    }
    getCoinbase() {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield this.request('coinbase', []);
            return this.formatAddress(address);
        });
    }
    estimateGas(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const gas = yield this.request('estimateGas', [Object.assign(Object.assign({}, tx), { from: this.parseAddress(tx.from), to: this.parseAddress(tx.to), gas: this.parseHexNumber(0), gasPrice: this.parseHexNumber(0) })]);
            return (0, ethers_2.toBigInt)(gas);
        });
    }
    getGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const gasPrice = yield this.request('gasPrice');
            return (0, ethers_2.toBigInt)(gasPrice);
        });
    }
    getBalance(address) {
        return super.getBalance(this.parseAddress(address), 'latest');
    }
    getBlock(blockNumber) {
        const _super = Object.create(null, {
            getBlock: { get: () => super.getBlock }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield _super.getBlock.call(this, blockNumber);
            return block;
        });
    }
    getBlockTransactionCount(blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionNumber = yield this.handleBlockTag(blockTag, (blockTag) => this.request('getBlockTransactionCountByHash', [blockTag]), (blockTag) => this.request('getBlockTransactionCountByNumber', [blockTag]));
            return Number(transactionNumber);
        });
    }
    getCode(address) {
        return this.request('getCode', [this.parseAddress(address), 'latest']);
    }
    getStorage(address, position) {
        return super.getStorage(this.parseAddress(address), position);
    }
    getTransactionByBlock(blockTag, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.handleBlockTag(blockTag, (blockTag) => this.request('getTransactionByBlockHashAndIndex', [blockTag]), (blockTag) => this.request('getTransactionByBlockNumberAndIndex', [blockTag]));
            return this.formatTransaction(transaction);
        });
    }
    // @ts-ignore
    getTransaction(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.request('getTransactionByHash', [hash]);
            return transaction ? this.formatTransaction(transaction) : null;
        });
    }
    // @ts-ignore
    getTransactionReceipt(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.request('getTransactionReceipt', [hash]);
            return transaction ? this.formatTransaction(transaction) : null;
        });
    }
    getBlockHash() {
        return __awaiter(this, void 0, void 0, function* () {
            const [hash] = yield this.request('getWork');
            return this.formatHash(hash);
        });
    }
    getSyncing() {
        return __awaiter(this, void 0, void 0, function* () {
            const [start, current, targetLast] = yield this.request('syncing');
            return [start, current, targetLast].map(Number);
        });
    }
}
exports.default = TronProvider;
//# sourceMappingURL=tron-jsonrpc-provider.js.map