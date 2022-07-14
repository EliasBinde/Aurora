-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT NOT NULL,
    "aktenzeichen" INTEGER NOT NULL,
    "meta" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "aktenzeichen" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount_capturable" INTEGER,
    "amount_received" INTEGER,
    "canceled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "capture_method" TEXT,
    "currency" TEXT,
    "customer" TEXT,
    "description" TEXT,
    "status" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
