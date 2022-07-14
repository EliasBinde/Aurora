import prisma from "./prisma";
type logInput = {
  evnt: string;
  type: string;
  meta?: string;
  aktenzeichen?: any;
};
export const log = async ({ aktenzeichen, evnt, meta, type }: logInput) => {
  const az = Number.isInteger(aktenzeichen) ? aktenzeichen : null;

  await prisma.log.create({
    data: {
      aktenzeichen: az,
      event: evnt,
      meta: meta || null,
      type: type,
    },
  });

  prisma.$disconnect();
};
