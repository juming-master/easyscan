import { CustomFetch } from "../types";
import etherscanBaseURLs from '../etherscan/base-urls';
import tronNodes from '../tronscan/base-urls';
import { GetAccountBalanceQuery, GetAccountBalanceResponse } from "./types";
export declare function multiscan(chain: (keyof (typeof etherscanBaseURLs & typeof tronNodes)), apiKey?: string, customFetch?: CustomFetch): {
    account: {
        balance: ({ address }: GetAccountBalanceQuery) => Promise<GetAccountBalanceResponse[]>;
    };
} | undefined;
export default multiscan;
//# sourceMappingURL=index.d.ts.map