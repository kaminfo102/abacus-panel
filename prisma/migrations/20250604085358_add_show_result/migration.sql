-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "digitCount" INTEGER NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "itemsPerRow" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "operators" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showResult" BOOLEAN NOT NULL DEFAULT false,
    "addSubQuestions" JSONB,
    "mulDivQuestions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_exams" ("addSubQuestions", "createdAt", "digitCount", "id", "isActive", "itemsPerRow", "mulDivQuestions", "operators", "rowCount", "term", "timeLimit", "title", "updatedAt") SELECT "addSubQuestions", "createdAt", "digitCount", "id", "isActive", "itemsPerRow", "mulDivQuestions", "operators", "rowCount", "term", "timeLimit", "title", "updatedAt" FROM "exams";
DROP TABLE "exams";
ALTER TABLE "new_exams" RENAME TO "exams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
