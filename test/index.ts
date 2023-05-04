import { tronscanPageData } from '../src'
import { etherscanPageData } from '../src'

async function etherscanAPIDemo() {
    const etherscan = etherscanPageData('1', 'API_KEY')
    // page = 1 will scan from page1 to page end.
    const { resume, stop } = etherscan.logs.getLogs({ address: '0xdac17f958d2ee523a2206206994597c13d831ec7', page: 1, offset: 5000, startblock: 1, endblock: 'latest', topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' }, (pageData, pageIndex, accData) => {
        // pageData : current page data
        // pageIndex : current page index (index from 0)
        // accData : accumulated data ,it is [...page1,...page2,...page3,...]
    })
    setTimeout(() => {
        // stop paging request
        stop()
        setTimeout(() => {
            // resume paging request
            resume()
        }, 10000)
    }, 10000)
    // It provides a jsonrpc provider.
    const tx = await etherscan.provider.getTransaction('0xb84d6525eedce0e0dab1f94830db53e2b078d2e6c510affffe700113a7c68578')
}

async function tronscanAPIDemo() {
    const tronscan = tronscanPageData('TronGrid')
    // page = 1 will scan from page1 to page end.
    const { resume, stop } = tronscan.account.txList({ address: 'TDqMwZVTSPLTCZQC55Db3J69eXY7HLCmfs' }, (pageData, pageIndex, accData) => {
        console.log(pageIndex, accData.length)
    })
    // It provides a jsonrpc provider.
    const tx = await tronscan.provider.getTransaction('5e28141b3a2f94551ea3fecd363aadd85db3515b2a35388f0aefac7518bf3898')
}



async function main() {
    const t = tronscanPageData('TronGrid')
    // const { start, stop } = t.account.txList({ address: 'TDqMwZVTSPLTCZQC55Db3J69eXY7HLCmfs' }, (pageData, pageIndex, accData) => {
    //     console.log(pageIndex, accData.length)
    // })
    // const accounts = await t.provider.getAccounts()
    // const blockNumber = await t.provider.getBlockNumber()
    // const blockHash = await t.provider.getBlockHash()
    // const block = await t.provider.getBlock('latest')
    // const txCount = await t.provider.getBlockTransactionCount('latest')
    // const code = await t.provider.getCode('TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq')
    // const tx = await t.provider.getTransaction('5e28141b3a2f94551ea3fecd363aadd85db3515b2a35388f0aefac7518bf3898')
    const r = await t.provider.getTransactionReceipt('5e28141b3a2f94551ea3fecd363aadd85db3515b2a35388f0aefac7518bf3898')
    console.log(JSON.stringify(r, undefined, 4))
    // {
    //     "blockHash": "00000000030573da9eb9d46a70e3475ceb1be96f2afa52fcc51cdfb76dcbd8e2",
    //     "blockNumber": 50688986,
    //     "contractAddress": null,
    //     "cumulativeGasUsed": "0x1ea97c",
    //     "effectiveGasPrice": "0x1a4",
    //     "from": "TAN4JXnGSYwZwmShVy5yaVAedn8YTeARVd",
    //     "gasUsed": 14309,
    //     "logs": [
    //         {
    //             "address": "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq",
    //             "blockHash": "00000000030573da9eb9d46a70e3475ceb1be96f2afa52fcc51cdfb76dcbd8e2",
    //             "blockNumber": 50688986,
    //             "data": "0x00000000000000000000000000000000000000000000000000d639f91e7a5ee8",
    //             "logIndex": 57,
    //             "removed": false,
    //             "topics": [
    //                 "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    //                 "0x00000000000000000000000004524e46fa766a1dd3a2c7d88b123d102f905588",
    //                 "0x0000000000000000000000008a4a39b0e62a091608e9631ffd19427d2d338dbd"
    //             ],
    //             "transactionHash": "5e28141b3a2f94551ea3fecd363aadd85db3515b2a35388f0aefac7518bf3898",
    //             "transactionIndex": 229
    //         }
    //     ],
    //     "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    //     "status": 1,
    //     "to": "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq",
    //     "transactionHash": "0x5e28141b3a2f94551ea3fecd363aadd85db3515b2a35388f0aefac7518bf3898",
    //     "transactionIndex": 229,
    //     "type": 0
    // }
    debugger
}

// const e = etherscanFullData('1', 'API_KEY')
// // e.logs.getLogs({ page: 1, offset: 5000, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }, (pageData, pageIndex, accData) => {
// //     // debugger
// //     console.log(pageIndex, accData.length)
// // })
// e.account.txList({page:1,offset:10001,address:'0xdac17f958d2ee523a2206206994597c13d831ec7'}, (pageData, pageIndex, accData) => {
//     // debugger
//     console.log(pageIndex, accData.length)
// })
// e.provider.getCode('')

main()