import { Module } from "../types";
import { CustomFetch } from '../utils'
import etherscanBaseURLs from '../etherscan/base-urls'
import tronNodes from '../tronscan/base-urls'
import etherscanAPI from '../etherscan'
import tronscanAPI from "../tronscan";
import { GetAccountBalanceQuery, GetAccountBalanceResponse } from "./types";

export function multiscan(chain: (keyof (typeof etherscanBaseURLs & typeof tronNodes)), apiKey?: string, customFetch?: CustomFetch) {
    const evmChainIds = Object.keys(etherscanBaseURLs)
    const tronNodeKeys = Object.keys(tronNodes)
    if (evmChainIds.includes(chain)) {
        if (!apiKey) {
            throw new Error(`Chain ${chain} should supply the apiKey.`)
        }
        const etherscan = etherscanAPI(chain as (keyof typeof etherscanBaseURLs), apiKey, customFetch)
        return {
            [Module.Account]: {
                balance: function ({ address }: GetAccountBalanceQuery): Promise<GetAccountBalanceResponse[]> {
                    return etherscan.account.balance({ address })
                }
            }
        }
    } else if (tronNodeKeys.includes(chain)) {
        const tronscan = tronscanAPI(chain as (keyof typeof tronNodes), apiKey, customFetch)
        return {
            [Module.Account]: {
                balance: async function ({ address }: GetAccountBalanceQuery): Promise<GetAccountBalanceResponse[]> {
                    let addr: string[] = []
                    if (typeof address === 'string') {
                        addr = [address]
                    } else {
                        addr = address
                    }
                    const accountBalances: { account: string, balance: string }[] = []
                    for (let account of addr) {
                        accountBalances.push({
                            account,
                            balance: await tronscan.account.accountInfo({ address: addr[0] }).then(el => `${el.balance}`)
                        })
                    }
                    return accountBalances
                },
            }
        }
    }
}

export default multiscan