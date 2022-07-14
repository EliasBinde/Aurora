import { log } from "../util/logger";
import prisma from "../util/prisma";
import { google } from "@google-cloud/vision/build/protos/protos";

import {
  findCorrectTime,
  getAddress,
  getCity,
  getDate,
  getTime,
} from "./functions";

export const recieptMethod = async (
  read: google.cloud.vision.v1.IAnnotateImageResponse,
  aktenzeichen: number
) => {
  const prepForLog = (
    inp: google.cloud.vision.v1.ITextAnnotation | null | undefined
  ) => {
    if (!inp) return {};

    const text = inp.text;

    const lines = text?.split("\n");

    return { text: lines };
  };

  const ticket = await prisma.ticket.findFirst({
    where: { aktenzeichen: aktenzeichen },
  });

  if (!ticket) {
    log({
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

  const tatbestand = await prisma.tatbestand.findFirst({
    where: { id: ticket.tatbestand },
  });

  if (tatbestand?.stornoErlaubt !== true) {
    log({
      type: "info",
      aktenzeichen: aktenzeichen,
      evnt:
        "Storno abgelehnt da: " +
        `Storno für ${tatbestand?.description} nicht erlaubt`,
      meta: JSON.stringify(prepForLog(read.fullTextAnnotation)),
    });
    return {
      success: false,
      denialReason: `Storno für ${tatbestand?.description} nicht erlaubt`,
    };
  }

  const address = getAddress(ticket, read.fullTextAnnotation);
  const city = getCity(ticket, read.fullTextAnnotation);
  const times = getTime(ticket, read.fullTextAnnotation);
  const dates = getDate(ticket, read.fullTextAnnotation);

  const timeValid = await findCorrectTime(ticket, dates, times);

  const success =
    timeValid && address.confidence > 0.65 && city.confidence > 0.65;

  let denialReason = "none";

  if (!timeValid && !(address.confidence > 0.65) && !(city.confidence > 0.65)) {
    denialReason = "Zeit und Ort stimmen nicht überein";
  } else if (!timeValid) {
    denialReason = "Zeit stimmt nicht überein";
  } else if (!(address.confidence > 0.65 && city.confidence > 0.65)) {
    denialReason = "Ort stimmt nicht überein";
  }

  const res = {
    success: success,
    denialReason: denialReason,
    city: city,
    address: address,
    timeValid: timeValid,
  };
  log({
    type: "info",
    aktenzeichen: aktenzeichen,
    evnt: res.success ? "Storno zugelassen" : "Ticket storno abgelehnt",
    meta: JSON.stringify(res),
  });
  return res;
};
