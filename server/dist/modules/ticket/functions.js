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
exports.getDate = exports.getCity = exports.getAddress = exports.findCorrectTime = exports.getTime = void 0;
const string_similarity_1 = __importDefault(require("string-similarity"));
const logger_1 = require("../util/logger");
const prisma_1 = __importDefault(require("../util/prisma"));
const compare = (a, b) => {
    const similarity = string_similarity_1.default.findBestMatch(a, b);
    return similarity;
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
        const tReg = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm;
        const timeres = word.search(tReg);
        const ftmps = tReg.exec(word);
        const time = ftmps === null || ftmps === void 0 ? void 0 : ftmps[0];
        if (timeres !== -1 && time) {
            matches.push(time);
        }
        const ptReg = /(?:[01]\d|2[0123]):(?:[012345]\d)/gm;
        const partialTimeres = word.search(ptReg);
        const ptmps = ptReg.exec(word);
        const partialTime = ptmps === null || ptmps === void 0 ? void 0 : ptmps[0];
        if (partialTimeres !== -1 && partialTime) {
            matches.push(partialTime + ":00");
        }
    });
    return matches;
};
exports.getTime = getTime;
const findCorrectTime = (ticket, dates, times) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketDate = ticket.time;
    const location = yield prisma_1.default.location.findFirst({
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
            let [hours, minutes, seconds] = t.split(":").map(Number);
            let [day, month, year] = d.split(".").map(Number);
            if (year.toString().length === 2) {
                year = 2000 + year;
            }
            const date = new Date(Date.parse(`${year}/${month}/${day} ${hours}:${minutes}:${seconds}`));
            console.log(year, month, day, hours, minutes, seconds);
            console.log(date);
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
exports.findCorrectTime = findCorrectTime;
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
exports.getAddress = getAddress;
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
exports.getCity = getCity;
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
    const dateReg = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(((?:19|20)\d{2})|(\d{2}))\s*/gm;
    const pDateReg = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(\d{2})\s*/gm;
    words.forEach((word) => {
        const dateres = word.search(dateReg);
        const dates = dateReg.exec(word);
        const date = dates === null || dates === void 0 ? void 0 : dates[0];
        if (dateres !== -1 && date) {
            matches.push(date);
        }
        const partialDateres = word.search(pDateReg);
        const pDates = dateReg.exec(word);
        const pDate = pDates === null || pDates === void 0 ? void 0 : pDates[0];
        if (partialDateres !== -1 && pDate) {
            const parts = pDate.split(".");
            const year = parts[2];
            const month = parts[1];
            const day = parts[0];
            const dateInd = `${day}:${month}:20${year}`;
            matches.push(dateInd);
        }
    });
    return matches;
};
exports.getDate = getDate;
