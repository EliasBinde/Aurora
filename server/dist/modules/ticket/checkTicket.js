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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTicket = void 0;
const logger_1 = require("../util/logger");
const prepImgForLog_1 = require("../util/prepImgForLog");
const recieptMethod_1 = require("./recieptMethod");
const checkTicket = (read, aktenzeichen) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.log)({
        type: "info",
        aktenzeichen: aktenzeichen,
        evnt: "Ticket wird überprüft",
        meta: JSON.stringify((0, prepImgForLog_1.prepForLog)(read.fullTextAnnotation)),
    });
    const res = yield (0, recieptMethod_1.recieptMethod)(read, aktenzeichen);
    return res;
});
exports.checkTicket = checkTicket;
