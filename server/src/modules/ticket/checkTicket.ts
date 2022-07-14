import { google } from "@google-cloud/vision/build/protos/protos";
import { log } from "../util/logger";
import { prepForLog } from "../util/prepImgForLog";
import { recieptMethod } from "./recieptMethod";

export const checkTicket = async (
  read: google.cloud.vision.v1.IAnnotateImageResponse,
  aktenzeichen: number
) => {
  log({
    type: "info",
    aktenzeichen: aktenzeichen,
    evnt: "Ticket wird überprüft",
    meta: JSON.stringify(prepForLog(read.fullTextAnnotation)),
  });

  const res = await recieptMethod(read, aktenzeichen);

  return res;
};
