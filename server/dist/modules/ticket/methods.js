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
exports.recieptMethod = void 0;
const logger_1 = require("../util/logger");
const prisma_1 = __importDefault(require("../util/prisma"));
const functions_1 = require("./functions");
const recieptMethod = (read, aktenzeichen) => __awaiter(void 0, void 0, void 0, function* () {
    const prepForLog = (inp) => {
        if (!inp)
            return {};
        const text = inp.text;
        const lines = text === null || text === void 0 ? void 0 : text.split("\n");
        return { text: lines };
    };
    const ticket = yield prisma_1.default.ticket.findFirst({
        where: { aktenzeichen: aktenzeichen },
    });
    if (!ticket) {
        (0, logger_1.log)({
            type: "error",
            aktenzeichen: aktenzeichen,
            evnt: "Ticket not found in checkTicket",
            meta: JSON.stringify(prepForLog(read.fullTextAnnotation)),
        });
        return {
            success: false,
            denialReason: "Aktenzeichen nicht gefunden",
        };
    }
    const tatbestand = yield prisma_1.default.tatbestand.findFirst({
        where: { id: ticket.tatbestand },
    });
    if ((tatbestand === null || tatbestand === void 0 ? void 0 : tatbestand.stornoErlaubt) !== true) {
        (0, logger_1.log)({
            type: "info",
            aktenzeichen: aktenzeichen,
            evnt: "Storno abgelehnt da: " +
                `Storno für ${tatbestand === null || tatbestand === void 0 ? void 0 : tatbestand.description} nicht erlaubt`,
            meta: JSON.stringify(prepForLog(read.fullTextAnnotation)),
        });
        return {
            success: false,
            denialReason: `Storno für ${tatbestand === null || tatbestand === void 0 ? void 0 : tatbestand.description} nicht erlaubt`,
        };
    }
    const address = (0, functions_1.getAddress)(ticket, read.fullTextAnnotation);
    const city = (0, functions_1.getCity)(ticket, read.fullTextAnnotation);
    const times = (0, functions_1.getTime)(ticket, read.fullTextAnnotation);
    const dates = (0, functions_1.getDate)(ticket, read.fullTextAnnotation);
    const timeValid = yield (0, functions_1.findCorrectTime)(ticket, dates, times);
    const success = timeValid && address.confidence > 0.65 && city.confidence > 0.65;
    let denialReason = "none";
    if (!timeValid && !(address.confidence > 0.65) && !(city.confidence > 0.65)) {
        denialReason = "Zeit und Ort stimmen nicht überein";
    }
    else if (!timeValid) {
        denialReason = "Zeit stimmt nicht überein";
    }
    else if (!(address.confidence > 0.65 && city.confidence > 0.65)) {
        denialReason = "Ort stimmt nicht überein";
    }
    const res = {
        success: success,
        denialReason: denialReason,
        city: city,
        address: address,
        timeValid: timeValid,
    };
    (0, logger_1.log)({
        type: "info",
        aktenzeichen: aktenzeichen,
        evnt: res.success ? "Storno zugelassen" : "Ticket storno abgelehnt",
        meta: JSON.stringify(res),
    });
});
exports.recieptMethod = recieptMethod;
