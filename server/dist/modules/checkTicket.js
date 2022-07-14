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
exports.checkTicket = void 0;
const string_similarity_1 = __importDefault(require("string-similarity"));
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient();
const prepForLog = (inp) => {
    if (!inp)
        return {};
    const text = inp.text;
    const lines = text === null || text === void 0 ? void 0 : text.split("\n");
    return { text: lines };
};
const compare = (a, b) => {
    const similarity = string_similarity_1.default.findBestMatch(a, b);
    return similarity;
};
const getCity = (ticket, text) => {
    var _a;
    const textlines = (_a = text === null || text === void 0 ? void 0 : text.text) === null || _a === void 0 ? void 0 : _a.split("\n");
    if (!textlines)
        throw new Error("Address not found");
    const words = [];
    textlines.map((line) => {
        const wordsInLine = line.split(" ");
        words.push(...wordsInLine);
    });
    const cityOnly = ticket.city;
    const cityZipLast = ticket.city + " " + ticket.postalCode;
    const cityZipFirst = ticket.postalCode + " " + ticket.city;
    const matches = [
        Object.assign({ type: "cityOnly" }, compare(cityOnly, words)),
        Object.assign({ type: "cityZipLast" }, compare(cityZipLast, words)),
        Object.assign({ type: "cityZipFirst" }, compare(cityZipFirst, words)),
        Object.assign({ type: "cityOnly" }, compare(cityOnly, textlines)),
        Object.assign({ type: "cityZipLast" }, compare(cityZipLast, textlines)),
        Object.assign({ type: "cityZipFirst" }, compare(cityZipFirst, textlines)),
    ];
    //get the best match
    const max = matches.reduce((a, b) => a.bestMatchIndex < b.bestMatchIndex ? a : b);
    const res = {
        city: max.bestMatch.target,
        confidence: max.bestMatch.rating,
        type: max.type,
    };
    (0, logger_1.log)({
        type: "info",
        evnt: "Stadt abgeglichen, Resultat: " + res.city,
        aktenzeichen: ticket.aktenzeichen,
        meta: JSON.stringify(matches),
    });
    return res;
};
const getAddress = (ticket, text) => {
    var _a;
    const textlines = (_a = text === null || text === void 0 ? void 0 : text.text) === null || _a === void 0 ? void 0 : _a.split("\n");
    if (!textlines)
        throw new Error("Address not found");
    const words = [];
    textlines.map((line) => {
        const wordsInLine = line.split(" ");
        words.push(...wordsInLine);
    });
    const matches = [
        Object.assign({ type: "streetOnly" }, compare(ticket.address, words)),
        Object.assign({ type: "full" }, compare(ticket.address, textlines)),
    ];
    const max = matches.reduce((a, b) => a.bestMatchIndex < b.bestMatchIndex ? a : b);
    const res = {
        street: max.bestMatch.target,
        confidence: max.bestMatch.rating,
        type: max.type,
    };
    (0, logger_1.log)({
        type: "info",
        evnt: "Adresse abgeglichen, Resultat: " + res.street,
        aktenzeichen: ticket.aktenzeichen,
        meta: JSON.stringify(matches),
    });
    return res;
};
const getTime = (ticket, text) => {
    var _a;
    const textlines = (_a = text === null || text === void 0 ? void 0 : text.text) === null || _a === void 0 ? void 0 : _a.split("\n");
    if (!textlines)
        throw new Error("Address not found");
    const words = [];
    textlines.map((line) => {
        const wordsInLine = line.split(" ");
        words.push(...wordsInLine);
    });
    let matches = [];
    words.forEach((word) => {
        const timeres = word.search(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm);
        if (timeres !== -1) {
            matches.push(word);
        }
        const partialTimeres = word.search(/(?:[01]\d|2[0123]):(?:[012345]\d)/gm);
        if (partialTimeres !== -1) {
            matches.push(word + ":00");
        }
    });
    return matches;
};
const getDate = (ticket, text) => {
    var _a;
    const textlines = (_a = text === null || text === void 0 ? void 0 : text.text) === null || _a === void 0 ? void 0 : _a.split("\n");
    if (!textlines)
        throw new Error("Address not found");
    const words = [];
    textlines.map((line) => {
        const wordsInLine = line.split(" ");
        words.push(...wordsInLine);
    });
    let matches = [];
    words.forEach((word) => {
        const dateres = word.search(/^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/gm);
        if (dateres !== -1) {
            matches.push(word);
        }
        const partialDateres = word.search(/^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(\d{2})\s*$/gm);
        if (partialDateres !== -1) {
            const parts = word.split(".");
            const year = parts[2];
            const month = parts[1];
            const day = parts[0];
            const date = `${day}:${month}:20${year}`;
            matches.push(date);
        }
    });
    return matches;
};
const findCorrectTime = (ticket, dates, times) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketDate = ticket.time;
    const location = yield prisma.location.findFirst({
        where: {
            city: ticket.city,
            postalCode: ticket.postalCode,
            address: ticket.address,
        },
    });
    const pTime = ((location === null || location === void 0 ? void 0 : location.maxParkingMin) || 0) * 60 * 1000;
    function dateIsValid(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    let valid = false;
    dates.forEach((d) => {
        times.forEach((t) => {
            const [hours, minutes, seconds] = t.split(":").map(Number);
            const [day, month, year] = d.split(".").map(Number);
            const date = new Date(Date.parse(`${year}/${month}/${day} ${hours}:${minutes}:${seconds}`));
            if (dateIsValid(date) && date.getTime() - ticketDate.getTime() < pTime) {
                valid = true;
            }
        });
    });
    const logDateTime = dates.concat(times);
    (0, logger_1.log)({
        type: "info",
        evnt: "Zeit und Datum abgeglichen, Resultat: (" + ticketDate + ")",
        aktenzeichen: ticket.aktenzeichen,
        meta: JSON.stringify(logDateTime),
    });
    return valid;
});
const checkTicket = (read, aktenzeichen) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.log)({
        type: "info",
        aktenzeichen: aktenzeichen,
        evnt: "Ticket wird überprüft",
        meta: JSON.stringify(prepForLog(read.fullTextAnnotation)),
    });
    const ticket = yield prisma.ticket.findFirst({
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
    const tatbestand = yield prisma.tatbestand.findFirst({
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
    const address = getAddress(ticket, read.fullTextAnnotation);
    const city = getCity(ticket, read.fullTextAnnotation);
    const times = getTime(ticket, read.fullTextAnnotation);
    const dates = getDate(ticket, read.fullTextAnnotation);
    const timeValid = yield findCorrectTime(ticket, dates, times);
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
    return res;
});
exports.checkTicket = checkTicket;
