import vison from "@google-cloud/vision";

export const imageHandler = async (img: string) => {
  const client = new vison.ImageAnnotatorClient({
    keyFilename: "./src/config/key.json",
  });

  let base64Image = img.split(";base64,");

  const image = base64Image[1];

  const results = await client.annotateImage({
    image: {
      content: image,
    },
    features: [{ type: "TEXT_DETECTION" }, { type: "SAFE_SEARCH_DETECTION" }],
  });
  return results;
};
