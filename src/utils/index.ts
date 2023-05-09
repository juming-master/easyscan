import axios, { AxiosRequestConfig } from "axios"
import { omit } from "lodash"

export interface FetchCustomConfig {
    debug?: boolean,
    retry?: number | 'forever'
}

export interface CustomFetch {
    (url: string, config?: AxiosRequestConfig<any> & FetchCustomConfig): Promise<any>
}

export const defaultCustomFetch = async function <Data>(url: string, config?: AxiosRequestConfig<any>) {
    const response = await axios.get(url, {
        responseType: 'json',
        ...config
    })
    var data: Data = response.data
    return data
}
