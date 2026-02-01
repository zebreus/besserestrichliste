/*
  Warnings:

  - You are about to drop the column `initiatorId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `Transaction` table. All the data in the column will be lost.

*/
-- Drop old triggers first
DROP TRIGGER IF EXISTS UpdateBalanceOfUserOnInsertedTransaction;
DROP TRIGGER IF EXISTS UpdateBalanceOfUserOnDeletedTransaction;
DROP TRIGGER IF EXISTS UpdateBalanceOfUserOnModifiedTransactions;
DROP TRIGGER IF EXISTS UpdateLastActiveOfUserOnBalanceChange;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "fromId" INTEGER,
    "toId" INTEGER,
    "reversesId" INTEGER,
    CONSTRAINT "Transaction_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Migrate data: transform negative amounts by swapping from/to
-- Positive amount: from=initiator, to=recipient
-- Negative amount: from=recipient, to=initiator, amount=ABS(amount)
INSERT INTO "new_Transaction" ("id", "title", "type", "processedAt", "amount", "fromId", "toId", "reversesId")
SELECT 
    "id", 
    "title", 
    "type", 
    "processedAt",
    ABS("amount") as "amount",
    CASE WHEN "amount" >= 0 THEN "initiatorId" ELSE "recipientId" END as "fromId",
    CASE WHEN "amount" >= 0 THEN "recipientId" ELSE "initiatorId" END as "toId",
    "reversesId"
FROM "Transaction";

DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_reversesId_key" ON "Transaction"("reversesId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Create new triggers for from/to model
CREATE TRIGGER UpdateBalanceOfUserOnInsertedTransaction AFTER INSERT ON "Transaction" BEGIN 
    UPDATE User SET balance = balance + new.amount WHERE new.toId = id;
    UPDATE User SET balance = balance - new.amount WHERE new.fromId = id;
END;

CREATE TRIGGER UpdateBalanceOfUserOnDeletedTransaction AFTER DELETE ON "Transaction" BEGIN 
    UPDATE User SET balance = balance - old.amount WHERE old.toId = id;
    UPDATE User SET balance = balance + old.amount WHERE old.fromId = id;
END;

CREATE TRIGGER UpdateBalanceOfUserOnModifiedTransactions AFTER UPDATE ON "Transaction" BEGIN 
    UPDATE User SET balance = balance - old.amount WHERE old.toId = id;
    UPDATE User SET balance = balance + old.amount WHERE old.fromId = id;
    UPDATE User SET balance = balance + new.amount WHERE new.toId = id;
    UPDATE User SET balance = balance - new.amount WHERE new.fromId = id;
END;

-- Keep the lastActive trigger (unchanged)
CREATE TRIGGER UpdateLastActiveOfUserOnBalanceChange AFTER UPDATE OF balance ON "User" BEGIN 
    UPDATE User SET lastActive = CURRENT_TIMESTAMP WHERE new.id = id;
END;
