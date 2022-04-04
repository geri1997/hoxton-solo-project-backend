//import express
import express from 'express';

//import axios
import axios from 'axios';

//import cors
import cors from 'cors';

//import dotenv
import dotenv, { config } from 'dotenv';
//import bettersqlite
import sqlite from 'better-sqlite3';

//import bcrypt
import bcrypt from 'bcrypt';
//import jsonwebtoken
import jwt from 'jsonwebtoken';
import {
    countQuestionAnswers,
    countQuestions,
    countQuestionsByTag,
    createComment,
    createCommentLike,
    createUser,
    getCommentById,
    getCommentLike,
    getPopularTags,
    getQuestionById,
    getQuestionComments,
    getQuestions,
    getQuestionsByTag,
    getTags,
    getUserByX,
    increaseCommentUpvote,
} from './db/dbutils';

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
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
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
    if (!req.headers.authorization)
        return res.send({ error: 'Missing token.' });

    try {
        // @ts-ignore
        const decodedData = jwt.verify(
            req.headers.authorization,
            // @ts-ignore
            process.env.JWT_SECRET
        );

        const user = getUserByX('id', decodedData.id);

        if (!user) return res.send({ error: `Please log in again.` });
        res.send(user);
    } catch (error) {
        res.status(400).send({ error: 'Invalid token.' });
    }
});

app.get('/discord-questions/:channelId', async (req, res) => {
    const id = req.params.channelId;
    const allThreads = await axios.get(
        `https://discord.com/api/v9/channels/${id}/messages?limit=50`,
        {
            headers: {
                Authorization:
                    'ODk2ODM3NTQ5MTg2NzU2NjM5.YWM7Qw.yFJ7TFqncdvnKZcrD57-uW3tkeA',
            },
        }
    );

    // const messages = response.data;

    const filteredThreads = allThreads.data.filter((message: any) => {
        return message.thread;
    });

    // for (const thread of filteredThreads) {
    //     axios
    //         .get(
    //             `https://discord.com/api/v9/channels/${thread.thread.id}/messages?limit=50`,
    //             {
    //                 headers: {
    //                     Authorization:
    //                         'ODk2ODM3NTQ5MTg2NzU2NjM5.YWM7Qw.yFJ7TFqncdvnKZcrD57-uW3tkeA',
    //                 },
    //             }
    //         )
    //         .then((response: any) => {
    //             thread.messages = response.data;
    //             console.log(thread);
    //         });
    // }

    // setTimeout(() => {
    res.send(filteredThreads);
    // }, 5000);
});

//get questions
app.get('/questions', (req, res) => {
    let page = req.query.page;
    const questions = getQuestions(page);
    for (const question of questions) {
        question.nrOfAnswers = countQuestionAnswers(question.id);
    }

    res.send({ questions, count: countQuestions() });
});

//get tags
app.get('/tags', (req, res) => {
    res.send(getTags());
});

//get single question
app.get('/question/:id', (req, res) => {
    const id = +req.params.id;
    const question = getQuestionById(id);
    const comments = getQuestionComments(id);
    question.comments = comments;
    res.send(question);
});

//create comment
app.post('/comment', (req, res) => {
    const { userId, questionId, content, createdAt } = req.body;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedData.id !== userId) throw Error;
        const result = createComment(userId, questionId, content, createdAt);

        res.send(getCommentById(result.lastInsertRowid));
    } catch (error) {
        res.status(400).send({ error });
    }
});

//upvote comment
app.patch('/comment/:id/upvote', (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByX('id', decodedData.id);
        if (getCommentLike(user.id, +id))
            return res
                .status(400)
                .send({ error: 'You already upvoted this comment' });
        createCommentLike(user.id, +id);
        increaseCommentUpvote(+id);
        res.send(getCommentById(id));
    } catch (error) {
        res.status(400).send({ error });
    }
});

//check if a comment is upvoted
app.post('/commentLiked', (req, res) => {
    const { commentId } = req.body;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const commentLike = getCommentLike(decodedData.id, commentId);
        commentLike
            ? res.send(commentLike)
            : res
                  .status(400)
                  .send({ error: 'You have not upvoted this comment' });
    } catch (error) {
        res.status(400).send({ error });
    }
});

//get popular tags
app.get('/popularTags', (req, res) => {
    res.send(getPopularTags());
});


//get questions by tag
app.get('/tag/:tag', (req, res) => {
    const tag = req.params.tag;
    const questions = getQuestionsByTag(+tag);
    for (const question of questions) {
        question.nrOfAnswers = countQuestionAnswers(question.id);
    }
    res.send({ questions, count: countQuestionsByTag(+tag) });
});