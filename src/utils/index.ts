import axios, { AxiosRequestConfig } from "axios"

export const defaultCustomFetch = async function <Data>(url: string, config?: AxiosRequestConfig<any>) {
    const response = await axios.get(url, {
        responseType: 'json',
        ...config
    })
    var data: Data = response.data
    return data
}
