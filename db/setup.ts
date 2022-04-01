import Database from 'better-sqlite3';
// import { createTransaction, createUser } from './dbUtils';
// import { transactions, users } from './seedData';

const db = new Database('./data.db', {
    verbose: console.log,
});

db.exec(`
DROP TABLE IF EXISTS 'question';
DROP TABLE IF EXISTS 'user';
DROP TABLE IF EXISTS 'watchedTags';
DROP TABLE IF EXISTS 'questionTags';

DROP TABLE IF EXISTS 'friends';


CREATE TABLE IF NOT EXISTS "user" (
    "id" INTEGER PRIMARY KEY,
    "username" text UNIQUE NOT NULL,
    "email" text UNIQUE NOT NULL,
    "password" text NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "question" (
    "id" INTEGER PRIMARY KEY,
    "title" text,
    "userId" INTEGER UNIQUE NOT NULL,
    "content" text NOT NULL,
    "upvotes" INTEGER NOT NULL,
    "downvotes" INTEGER NOT NULL,
    "createdAt" datetime
  );
  
  CREATE TABLE IF NOT EXISTS "watchedTags" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGEREGER,
    "tagId" INTEGEREGER,
    FOREIGN KEY ("tagId") REFERENCES "tags" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );
  
  CREATE TABLE IF NOT EXISTS "tags" (
    "id" INTEGER PRIMARY KEY,
    "name" text UNIQUE NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "questionTags" (
    "id" INTEGER PRIMARY KEY,
    "questionId" INTEGEREGER,
    "tagId" INTEGEREGER,
    FOREIGN KEY ("tagId") REFERENCES "tags" ("id"),
    FOREIGN KEY ("questionId") REFERENCES "question" ("id")
  );
  
  CREATE TABLE IF NOT EXISTS "friends" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGEREGER,
    "friendId" INTEGEREGER,
    FOREIGN KEY ("friendId") REFERENCES "user" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );
  
  

  
  

`);

// for (const user of users) {
//     createUser(user.fullName, user.email, user.password, user.amountInAccount);
// }
// for (const transaction of transactions) {
//     createTransaction(
//         transaction.userId,
//         transaction.amount,
//         transaction.receiverOrSender,
//         transaction.completedAt,
//         transaction.isPositive
//     );
// }
