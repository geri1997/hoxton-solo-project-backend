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
import { createUser, getUserByX } from './db/dbutils';

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

app.get('/', (req, res) => {
    res.send('Hello World');
});

//register
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const result = createUser(username, email, hashedPassword);
        const user = getUserByX('id', result.lastInsertRowid);
        //@ts-ignore
        const token = jwt.sign({ id:user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error });
    }
});

//login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const user = getUserByX('email', email);
        const isPassMatch = bcrypt.compareSync(password, user.password);
        //@ts-ignore
        const token = jwt.sign({ id: user.id }, `${process.env.JWT_SECRET}`, {
            expiresIn: '5h',
        });
        isPassMatch
            ? res.send({ data: user, token })
            : res.status(404).send({ error: `Wrong email/assword` });
    } catch (error) {
        res.status(400).send({ error: `Wrong email/assword` });
    }
});

app.get('/validate', (req, res) => {
    if (!req.headers.authorization) return res.send({ error: 'Missing token.' });

    // @ts-ignore
    const decodedData = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    const user = getUserByX('id', decodedData.id);

    if (!user) return res.send(`Please log in again.`);
    res.send(user);
});