-- Add check constraint to ensure amount is always positive
-- First, drop the existing Transaction table and recreate it with the constraint
PRAGMA foreign_keys=OFF;

-- Create new table with check constraint
CREATE TABLE "Transaction_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL CHECK(amount > 0),
    "fromId" INTEGER,
    "toId" INTEGER,
    "reversesId" INTEGER,
    CONSTRAINT "Transaction_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old table
INSERT INTO "Transaction_new" SELECT * FROM "Transaction";

-- Drop old table
DROP TABLE "Transaction";

-- Rename new table
ALTER TABLE "Transaction_new" RENAME TO "Transaction";

-- Recreate indexes
CREATE UNIQUE INDEX "Transaction_reversesId_key" ON "Transaction"("reversesId");

PRAGMA foreign_keys=ON;