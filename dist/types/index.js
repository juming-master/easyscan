"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.defaultCustomFetch = void 0;
const axios_1 = __importDefault(require("axios"));
function defaultCustomFetch(url, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(url)
        const response = yield axios_1.default.get(url, Object.assign({ responseType: 'json' }, config));
        var data = response.data;
        return data;
    });
}
exports.defaultCustomFetch = defaultCustomFetch;
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