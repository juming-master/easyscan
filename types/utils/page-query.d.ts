import { Data, Options, Query } from '../types';
export declare function fetchOffsetPageData<Args, Item>({ getData, formatArgs, parseArgs, checkBlock, isEqualItem, options }: {
    getData: (qs: Args) => Promise<Data<Item[]>>;
    formatArgs: (query: Query) => Args;
    parseArgs: (args: Args) => Query;
    checkBlock: (item: Item) => number;
    isEqualItem: (a: Item, b: Item) => boolean;
    options?: Options & {
        maxSize: number;
    };
}): (args: Args, cb: (currentPageData: Item[], currentPageIndex: number, accumulatedData: Item[], isFinish: boolean) => void, autoStart?: boolean) => {
    resume: () => void;
    stop: () => Query;
};
//# sourceMappingURL=page-query.d.ts.map