import { google } from "@google-cloud/vision/build/protos/protos";
import { Ticket } from "@prisma/client";
import stringSimilarity from "string-similarity";
import { log } from "../util/logger";
import prisma from "../util/prisma";

const compare = (a: string, b: string[]) => {
  const similarity = stringSimilarity.findBestMatch(a, b);
  return similarity;
};

export const getTime = (
  ticket: Ticket,
  text: google.cloud.vision.v1.ITextAnnotation | null | undefined
) => {
  const textlines = text?.text?.split("\n");
  if (!textlines) throw new Error("Address not found");
  const words: string[] = [];
  textlines.map((line) => {
    const wordsInLine = line.split(" ");
    words.push(...wordsInLine);
  });
  let matches: string[] = [];

  words.forEach((word) => {
    const tReg = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm;
    const timeres = word.search(tReg);
    const ftmps = tReg.exec(word);
    const time = ftmps?.[0];
    if (timeres !== -1 && time) {
      matches.push(time);
    }
    const ptReg = /(?:[01]\d|2[0123]):(?:[012345]\d)/gm;
    const partialTimeres = word.search(ptReg);
    const ptmps = ptReg.exec(word);
    const partialTime = ptmps?.[0];

    if (partialTimeres !== -1 && partialTime) {
      matches.push(partialTime + ":00");
    }
  });

  return matches;
};

export const findCorrectTime = async (
  ticket: Ticket,
  dates: string[],
  times: string[]
) => {
  const ticketDate: Date = ticket.time;

  const location = await prisma.location.findFirst({
    where: {
      city: ticket.city,
      postalCode: ticket.postalCode,
      address: ticket.address,
    },
  });

  const pTime = (location?.maxParkingMin || 0) * 60 * 1000;

  function dateIsValid(date: Date) {
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

      const date = new Date(
        Date.parse(`${year}/${month}/${day} ${hours}:${minutes}:${seconds}`)
      );

      console.log(year, month, day, hours, minutes, seconds);

      console.log(date);

      if (dateIsValid(date) && date.getTime() - ticketDate.getTime() < pTime) {
        valid = true;
      }
    });
  });
  const logDateTime = dates.concat(times);
  log({
    type: "info",
    evnt: "Zeit und Datum abgeglichen, Resultat: (" + ticketDate + ")",
    aktenzeichen: ticket.aktenzeichen,
    meta: JSON.stringify(logDateTime),
  });

  return valid;
};

export const getAddress = (
  ticket: Ticket,
  text: google.cloud.vision.v1.ITextAnnotation | null | undefined
) => {
  const textlines = text?.text?.split("\n");
  if (!textlines) throw new Error("Address not found");
  const words: string[] = [];
  textlines.map((line) => {
    const wordsInLine = line.split(" ");
    words.push(...wordsInLine);
  });

  const matches = [
    { type: "streetOnly", ...compare(ticket.address, words) },
    { type: "full", ...compare(ticket.address, textlines) },
  ];
  const max = matches.reduce((a, b) =>
    a.bestMatchIndex < b.bestMatchIndex ? a : b
  );
  const res = {
    street: max.bestMatch.target,
    confidence: max.bestMatch.rating,
    type: max.type,
  };
  log({
    type: "info",
    evnt: "Adresse abgeglichen, Resultat: " + res.street,
    aktenzeichen: ticket.aktenzeichen,
    meta: JSON.stringify(matches),
  });
  return res;
};

export const getCity = (
  ticket: Ticket,
  text: google.cloud.vision.v1.ITextAnnotation | null | undefined
) => {
  const textlines = text?.text?.split("\n");
  if (!textlines) throw new Error("Address not found");
  const words: string[] = [];
  textlines.map((line) => {
    const wordsInLine = line.split(" ");
    words.push(...wordsInLine);
  });

  const cityOnly = ticket.city;
  const cityZipLast = ticket.city + " " + ticket.postalCode;
  const cityZipFirst = ticket.postalCode + " " + ticket.city;

  const matches = [
    { type: "cityOnly", ...compare(cityOnly, words) },
    { type: "cityZipLast", ...compare(cityZipLast, words) },
    { type: "cityZipFirst", ...compare(cityZipFirst, words) },
    { type: "cityOnly", ...compare(cityOnly, textlines) },
    { type: "cityZipLast", ...compare(cityZipLast, textlines) },
    { type: "cityZipFirst", ...compare(cityZipFirst, textlines) },
  ];

  //get the best match
  const max = matches.reduce((a, b) =>
    a.bestMatchIndex < b.bestMatchIndex ? a : b
  );

  const res = {
    city: max.bestMatch.target,
    confidence: max.bestMatch.rating,
    type: max.type,
  };
  log({
    type: "info",
    evnt: "Stadt abgeglichen, Resultat: " + res.city,
    aktenzeichen: ticket.aktenzeichen,
    meta: JSON.stringify(matches),
  });

  return res;
};
export const getDate = (
  ticket: Ticket,
  text: google.cloud.vision.v1.ITextAnnotation | null | undefined
) => {
  const textlines = text?.text?.split("\n");
  if (!textlines) throw new Error("Address not found");
  const words: string[] = [];
  textlines.map((line) => {
    const wordsInLine = line.split(" ");
    words.push(...wordsInLine);
  });

  let matches: string[] = [];
  const dateReg =
    /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(((?:19|20)\d{2})|(\d{2}))\s*/gm;
  const pDateReg =
    /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(\d{2})\s*/gm;

  words.forEach((word) => {
    const dateres = word.search(dateReg);
    const dates = dateReg.exec(word);
    const date = dates?.[0];
    if (dateres !== -1 && date) {
      matches.push(date);
    }

    const partialDateres = word.search(pDateReg);
    const pDates = dateReg.exec(word);
    const pDate = pDates?.[0];
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
