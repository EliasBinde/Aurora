"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepForLog = void 0;
const prepForLog = (inp) => {
    if (!inp)
        return {};
    const text = inp.text;
    const lines = text === null || text === void 0 ? void 0 : text.split("\n");
    return { text: lines };
};
exports.prepForLog = prepForLog;
