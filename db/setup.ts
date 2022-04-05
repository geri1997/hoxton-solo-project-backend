import Database from 'better-sqlite3';
// import { createTransaction, createUser } from './dbUtils';
// import { transactions, users } from './seedData';
//import tags
import { generateComments, generateQuestions, generateUsers, questions, tags } from './seedData';

const db = new Database('./data.db', {
    verbose: console.log,
});


db.exec(`
DROP TABLE IF EXISTS 'watchedTags';
DROP TABLE IF EXISTS 'questionTags';
DROP TABLE IF EXISTS 'commentLikes';
DROP TABLE IF EXISTS 'commentDislikes';
DROP TABLE IF EXISTS 'comments';
DROP TABLE IF EXISTS 'friends';
DROP TABLE IF EXISTS 'question';
DROP TABLE IF EXISTS 'user';

DROP TABLE IF EXISTS 'tags';



CREATE TABLE IF NOT EXISTS "user" (
    "id" INTEGER PRIMARY KEY,
    "username" text UNIQUE NOT NULL,
    "email" text UNIQUE NOT NULL,
    "password" text NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "question" (
    "id" INTEGER PRIMARY KEY,
    "title" text,
    "userId" INTEGER NOT NULL,
    "content" text NOT NULL,
    "upvotes" INTEGER DEFAULT 0,
    "downvotes" INTEGER DEFAULT 0,
    "createdAt" datetime
  );
  
  CREATE TABLE IF NOT EXISTS "watchedTags" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER,
    "tagId" INTEGER,
    FOREIGN KEY ("tagId") REFERENCES "tags" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );
  
  CREATE TABLE IF NOT EXISTS "tags" (
    "id" INTEGER PRIMARY KEY,
    "name" text UNIQUE NOT NULL,
    "description" text NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "questionTags" (
    "id" INTEGER PRIMARY KEY,
    "questionId" INTEGER,
    "tagId" INTEGER,
    FOREIGN KEY ("tagId") REFERENCES "tags" ("id"),
    FOREIGN KEY ("questionId") REFERENCES "question" ("id")
  );
  
  CREATE TABLE IF NOT EXISTS "friends" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER,
    "friendId" INTEGER,
    FOREIGN KEY ("friendId") REFERENCES "user" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );

  CREATE TABLE IF NOT EXISTS "comments" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "content" text NOT NULL,
    "upvotes" INTEGER DEFAULT 0,
    "downvotes" INTEGER DEFAULT 0,
    "createdAt" datetime,
    FOREIGN KEY ("questionId") REFERENCES "question" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );

  CREATE TABLE IF NOT EXISTS "commentLikes" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    FOREIGN KEY ("commentId") REFERENCES "comments" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );

  CREATE TABLE IF NOT EXISTS "commentDislikes" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    FOREIGN KEY ("commentId") REFERENCES "comments" ("id"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
  );

`);



for (const tag of tags) {
    db.prepare(`INSERT INTO tags (name, description) VALUES (?, ?)`).run(
        tag.name,
        tag.description
    );
}

for (const user of generateUsers(10)) {
    db.prepare(
        `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`
    ).run(user.username, user.email, user.password);
}



for (const user of generateQuestions()) {
    db.prepare(
        `INSERT INTO question (title, userId, content, upvotes, downvotes, createdAt) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
        user.title,
        user.userId,
        user.content,
        user.upvotes,
        user.downvotes,
        user.createdAt
    );
}

for (const user of questions) {
  db.prepare(
      `INSERT INTO question (title, userId, content, upvotes, downvotes, createdAt) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
      user.title,
      user.userId,
      user.content,
      user.upvotes,
      user.downvotes,
      user.createdAt
  );
}


for (let index = 1; index < 102; index++) {
  db.prepare(`INSERT INTO questionTags (questionId, tagId) VALUES (?, ?)`).run(

      index,
      Math.floor(Math.random() * 7) + 1
  );
  
}

for (const user of generateComments()) {
  db.prepare(
      `INSERT INTO comments (userId, questionId, upvotes, downvotes, createdAt , content) VALUES (?, ?, ?, ?, ?,?)`
  ).run(
      user.userId,
      user.questionId,
      user.upvotes,
      user.downvotes,
      user.createdAt,
      user.content
  );
}