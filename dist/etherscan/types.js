"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = exports.Sort = exports.Status = void 0;
var Status;
(function (Status) {
    Status["SUCCESS"] = "1";
    Status["ERROR"] = "0";
})(Status = exports.Status || (exports.Status = {}));
var Sort;
(function (Sort) {
    Sort["ASC"] = "asc";
    Sort["DESC"] = "desc";
})(Sort = exports.Sort || (exports.Sort = {}));
var TokenType;
(function (TokenType) {
    TokenType["ERC20"] = "ERC20";
    TokenType["ERC721"] = "ERC721";
    TokenType["ERC1155"] = "ERC1155";
    TokenType["NONE"] = "NONE";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//# sourceMappingURL=types.js.map