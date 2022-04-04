
import Database from 'better-sqlite3';
import { questions } from './db/seedData';
// import { createTransaction, createUser } from './dbUtils';
// import { transactions, users } from './seedData';
//import tags
// import { generateComments, generateQuestions, generateUsers, questions, tags } from 'db/seedData';

const db = new Database('./data.db', {
    verbose: console.log,
});

  