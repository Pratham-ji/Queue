-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROVIDER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('CHECKUP', 'EMERGENCY', 'REPORT', 'FOLLOWUP');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'SERVING', 'COMPLETED', 'MISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PROVIDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "token" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "type" "VisitType" NOT NULL DEFAULT 'CHECKUP',
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "arrivalTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "servedTime" TIMESTAMP(3),
    "completedTime" TIMESTAMP(3),
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_ownerId_key" ON "Clinic"("ownerId");

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
