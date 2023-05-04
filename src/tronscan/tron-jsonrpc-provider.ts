import { JsonRpcProvider } from 'ethers'
import { fromHex, toHex } from 'tron-format-address'
import { toBigInt } from 'ethers'
export interface Transaction {
    blockHash: string | null,
    blockNumber: number | null,
    from: string,
    gas?: string,
    gasPrice?: string,
    gasUsed?: string,
    cumulativeGasUsed?: string,
    effectiveGasPrice?: string,
    hash: string,
    transactionHash?: string,
    input?: string,
    nonce: number,
    to: string | null,
    transactionIndex?: string,
    value?: bigint,
    v?: string,
    r?: string,
    s?: string,
    type?: string,
    status?: string,
    logs?: {
        address: string,
        blockHash: string,
        blockNumber: string,
        data: string,
        logIndex: string,
        removed: boolean,
        topics: string[],
        transactionHash: string,
        transactionIndex: string
    }[]
}

export interface TransactionRequest {
    from: string,
    to: string,
    gas?: string,
    gasPrice?: string,
    value: string,//sun amount
    data: string,
}

export type BlockTag = number | string | "earliest" | "latest"

export default class TronProvider extends JsonRpcProvider {

    constructor(url: string) {
        super(url, 'any')
    }

    private formatAddress(addr: string) {
        if (addr.startsWith('0x')) {
            return fromHex(addr)
        }
        return addr
    }

    private parseAddress(addr: string) {
        if (addr.startsWith('T')) {
            return `${toHex(addr)}`
        }
        return `0x${addr}`
    }

    private parseHexNumber(num: number) {
        return `0x${num.toString(16)}`
    }

    private formatNumber(num: any) {
        return num ? Number(num.toString()) : num
    }

    private formatHash(hash: string) {
        return hash ? hash.startsWith('0x') ? hash.slice(2) : hash : hash
        // return hash
    }

    private async request<T>(method: string, params?: any[]): Promise<T> {
        const result: T = await super.send(`eth_${method}`, params || [])
        return result
    }

    private async handleBlockTag<T, S>(blockTag: BlockTag, blockHashHandle: (tag: string) => Promise<T>, blockNumberHandle: (tag: string) => Promise<S>) {
        if (typeof blockTag === 'string' && blockTag.startsWith('0x')) {
            return await blockHashHandle(blockTag)
        }
        return await blockNumberHandle(typeof blockTag === 'number' ? this.parseHexNumber(blockTag) : blockTag)
    }

    private formatTransaction(transaction: Transaction) {
        let tx = {
            ...transaction,
            v: transaction.v ? Number(transaction.v.toString()) : transaction.v,
            from: this.formatAddress(transaction.from),
            to: transaction.to && this.formatAddress(transaction.to),
            blockNumber: Number(transaction.blockNumber),
            blockHash: transaction.blockHash && this.formatHash(transaction.blockHash),
            transactionHash: transaction.transactionHash && this.formatHash(transaction.transactionHash),
            value: this.formatNumber(transaction.value),
            gas: this.formatNumber(transaction.gas),
            gasPrice: this.formatNumber(transaction.gasPrice),
            gasUsed: this.formatNumber(transaction.gasUsed),
            cumulativeGasUsed: this.formatNumber(transaction.cumulativeGasUsed),
            effectiveGasPrice: this.formatNumber(transaction.effectiveGasPrice),
            transactionIndex: this.formatNumber(transaction.transactionIndex),
            status: this.formatNumber(transaction.status),
            type: this.formatNumber(transaction.type)
        }
        if (transaction.logs) {
            tx = Object.assign({}, tx, {
                logs: transaction.logs.map(el => {
                    return {
                        ...el,
                        address: this.formatAddress(el.address),
                        blockNumber: this.formatNumber(el.blockNumber),
                        blockHash: this.formatHash(el.blockHash),
                        transactionHash: this.formatHash(el.transactionHash),
                        transactionIndex: this.formatNumber(el.transactionIndex),
                        logIndex: this.formatNumber(el.logIndex),
                    }
                })
            })
        }
        if (transaction.logs) {
            return {
                ...tx,
            }
        }
        if (transaction.transactionHash) {
            return {
                ...tx,
                transactionHash: this.formatHash(transaction.transactionHash)
            }
        } else {
            return {
                ...tx,
                hash: this.formatHash(transaction.hash),
            }
        }
    }

    async getAccounts() {
        const accounts = await this.request<string[]>('accounts')
        return accounts.map(this.formatAddress)
    }

    async getBlockNumber() {
        const blockNo = await this.request<string>('blockNumber')
        return Number(blockNo)
    }

    call(tx: TransactionRequest) {
        return this.request<string>('call', [{
            ...tx,
            from: this.parseAddress(tx.from),
            to: this.parseAddress(tx.to),
            gas: this.parseHexNumber(0),
            gasPrice: this.parseHexNumber(0)
        }])
    }

    getChainId() {
        return this.request<string>('chainId')
    }

    async getCoinbase() {
        const address = await this.request<string>('coinbase', [])
        return this.formatAddress(address)
    }

    async estimateGas(tx: TransactionRequest) {
        const gas = await this.request<string>('estimateGas', [{
            ...tx,
            from: this.parseAddress(tx.from),
            to: this.parseAddress(tx.to),
            gas: this.parseHexNumber(0),
            gasPrice: this.parseHexNumber(0)
        }])
        return toBigInt(gas)
    }

    async getGasPrice() {
        const gasPrice = await this.request<string>('gasPrice')
        return toBigInt(gasPrice)
    }

    getBalance(address: string) {
        return super.getBalance(this.parseAddress(address), 'latest')
    }

    async getBlock(blockNumber: BlockTag) {
        const block = await super.getBlock(blockNumber)
        return block
    }

    async getBlockTransactionCount(blockTag: BlockTag) {
        const transactionNumber = await this.handleBlockTag(blockTag, (blockTag) => this.request<string>('getBlockTransactionCountByHash', [blockTag]), (blockTag) => this.request<string>('getBlockTransactionCountByNumber', [blockTag]))
        return Number(transactionNumber)
    }

    getCode(address: string) {
        return this.request<string>('getCode', [this.parseAddress(address), 'latest'])
    }

    getStorage(address: string, position: string) {
        return super.getStorage(this.parseAddress(address), position)
    }

    async getTransactionByBlock(blockTag: BlockTag, index: number) {
        const transaction = await this.handleBlockTag(blockTag, (blockTag) => this.request<Transaction>('getTransactionByBlockHashAndIndex', [blockTag]), (blockTag) => this.request<Transaction>('getTransactionByBlockNumberAndIndex', [blockTag]))
        return this.formatTransaction(transaction)
    }

    // @ts-ignore
    async getTransaction(hash: string) {
        const transaction = await this.request<any>('getTransactionByHash', [hash])
        return transaction ? this.formatTransaction(transaction) : null
    }

    // @ts-ignore
    async getTransactionReceipt(hash: string) {
        const transaction = await this.request<any>('getTransactionReceipt', [hash])
        return transaction ? this.formatTransaction(transaction) : null
    }

    async getBlockHash() {
        const [hash] = await this.request<[string]>('getWork')
        return this.formatHash(hash)
    }

    async getSyncing() {
        const [start, current, targetLast] = await this.request<[string, string, string]>('syncing')
        return [start, current, targetLast].map(Number)
    }
}