/*
  Warnings:

  - You are about to drop the column `description` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `photoSrc` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `ratingImdb` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseYear` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `trailerSrc` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `videoSrc` on the `Movie` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Movie" ("id", "title") SELECT "id", "title" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
