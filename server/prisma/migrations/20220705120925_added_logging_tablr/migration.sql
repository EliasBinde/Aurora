-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" SERIAL NOT NULL,
    "aktenzeichen" INTEGER NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "denialReason" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);
