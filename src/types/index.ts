import axios, { AxiosRequestConfig } from "axios"
import { omit } from "lodash"

export interface CustomFetch {
    (url: string, config?: AxiosRequestConfig<any> & { debug?: boolean }): Promise<any>
}

export const defaultCustomFetch = async function <Data>(url: string, config?: AxiosRequestConfig<any> & { debug?: boolean }) {
    if (config && config.debug) {
        console.log(url)
    }
    const response = await axios.get(url, {
        responseType: 'json',
        ...omit(config, 'debug')
    })
    var data: Data = response.data
    return data
}

export enum Module {
    Provider = 'provider',
    Account = 'account',
    Contract = 'contract',
    Block = 'block',
    Transaction = 'transaction',
    Logs = 'logs',
    Proxy = 'proxy'
}

export interface GetEtherCompatQuery { compatable?: false }

export interface GetEtherCompatTxListResponse {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    fee: string;
    isError: boolean;
    input: string;
}
