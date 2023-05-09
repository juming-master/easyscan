import { AxiosRequestConfig } from "axios";
export interface FetchCustomConfig {
    debug?: boolean;
    retry?: number | 'forever';
}
export interface CustomFetch {
    (url: string, config?: AxiosRequestConfig<any> & FetchCustomConfig): Promise<any>;
}
export declare const defaultCustomFetch: <Data>(url: string, config?: AxiosRequestConfig<any>) => Promise<Data>;
//# sourceMappingURL=index.d.ts.map