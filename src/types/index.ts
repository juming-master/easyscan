import axios, { AxiosRequestConfig } from "axios"

export interface CustomFetch {
    (url: string, config?: AxiosRequestConfig<any>): Promise<any>
}

export async function defaultCustomFetch<Data>(url: string, config?: AxiosRequestConfig<any>) {
    const response = await axios.get(url, {
        responseType: 'json',
        ...config
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
