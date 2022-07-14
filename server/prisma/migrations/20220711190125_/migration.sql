/*
  Warnings:

  - You are about to drop the column `paid` on the `Ticket` table. All the data in the column will be lost.
  - Made the column `status` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "paid",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open';
