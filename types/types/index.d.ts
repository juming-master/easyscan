import { AxiosRequestConfig } from 'axios';
export interface FetchCustomConfig {
    debug?: boolean;
    retry?: number | 'forever';
}
export interface CustomFetch {
    (url: string, config?: AxiosRequestConfig<any> & FetchCustomConfig): Promise<any>;
}
export type BlockNumber = number | 'latest';
export declare enum Sort {
    ASC = "asc",
    DESC = "desc"
}
export declare enum Status {
    SUCCESS = "1",
    ERROR = "0"
}
export interface Query {
    page?: number;
    limit?: number;
    sort?: Sort;
    start?: BlockNumber;
    end?: BlockNumber;
}
export type Options = FetchCustomConfig & {
    autoStart?: boolean;
};
export interface Data<T> {
    status: Status;
    message: "OK" | "NOTOK";
    result: T;
    error?: Error | string;
}
export declare enum Module {
    Provider = "provider",
    Account = "account",
    Contract = "contract",
    Block = "block",
    Transaction = "transaction",
    Logs = "logs",
    Proxy = "proxy"
}
export interface GetEtherCompatQuery {
    compatable?: false;
}
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
//# sourceMappingURL=index.d.ts.map