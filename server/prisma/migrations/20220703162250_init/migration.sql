-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "maxParkingMin" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tatbestand" (
    "id" SERIAL NOT NULL,
    "stornoErlaubt" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Tatbestand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "aktenzeichen" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "tatbestand" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "locationId" INTEGER,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
