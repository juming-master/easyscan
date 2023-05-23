"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.Status = exports.Sort = void 0;
var Sort;
(function (Sort) {
    Sort["ASC"] = "asc";
    Sort["DESC"] = "desc";
})(Sort = exports.Sort || (exports.Sort = {}));
var Status;
(function (Status) {
    Status["SUCCESS"] = "1";
    Status["ERROR"] = "0";
})(Status = exports.Status || (exports.Status = {}));
var Module;
(function (Module) {
    Module["Provider"] = "provider";
    Module["Account"] = "account";
    Module["Contract"] = "contract";
    Module["Block"] = "block";
    Module["Transaction"] = "transaction";
    Module["Logs"] = "logs";
    Module["Proxy"] = "proxy";
})(Module = exports.Module || (exports.Module = {}));
//# sourceMappingURL=index.js.map