/*
  Warnings:

  - You are about to drop the column `answers` on the `exam_results` table. All the data in the column will be lost.
  - You are about to drop the column `questionsJson` on the `exams` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exam_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "addSubAnswers" JSONB,
    "mulDivAnswers" JSONB,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "timeSpent" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "exam_results_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_exam_results" ("createdAt", "endTime", "examId", "id", "score", "startTime", "studentId", "timeSpent", "updatedAt") SELECT "createdAt", "endTime", "examId", "id", "score", "startTime", "studentId", "timeSpent", "updatedAt" FROM "exam_results";
DROP TABLE "exam_results";
ALTER TABLE "new_exam_results" RENAME TO "exam_results";
CREATE UNIQUE INDEX "exam_results_examId_studentId_key" ON "exam_results"("examId", "studentId");
CREATE TABLE "new_exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "digitCount" INTEGER NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "itemsPerRow" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "operators" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "addSubQuestions" JSONB,
    "mulDivQuestions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_exams" ("createdAt", "digitCount", "id", "itemsPerRow", "operators", "rowCount", "term", "timeLimit", "title", "updatedAt") SELECT "createdAt", "digitCount", "id", "itemsPerRow", "operators", "rowCount", "term", "timeLimit", "title", "updatedAt" FROM "exams";
DROP TABLE "exams";
ALTER TABLE "new_exams" RENAME TO "exams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
