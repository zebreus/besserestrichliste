-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "initiatorId" INTEGER,
    "recipientId" INTEGER,
    CONSTRAINT "Transaction_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);