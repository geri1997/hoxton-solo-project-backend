//import express
import express from 'express';

//import cors
import cors from 'cors';

//import dotenv
import dotenv from 'dotenv';
//import bettersqlite
import sqlite from 'better-sqlite3';

//import bcrypt
import bcrypt from 'bcrypt';
//import jsonwebtoken
import jwt from 'jsonwebtoken';

//create express app
const app = express();
//cors
app.use(cors());
//bodyparser
app.use(express.json());
//dotenv
dotenv.config();
//sqlite
const db = new sqlite('./db.sqlite');

//listen on port 3009
app.listen(3009, () => {
    console.log('listening on port 3009');
});

//empty get route
app.get('/', (req, res) => {
    res.send('Hello World');
});