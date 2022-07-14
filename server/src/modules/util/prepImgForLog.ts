import { google } from "@google-cloud/vision/build/protos/protos";

export const prepForLog = (
  inp: google.cloud.vision.v1.ITextAnnotation | null | undefined
) => {
  if (!inp) return {};

  const text = inp.text;

  const lines = text?.split("\n");

  return { text: lines };
};
