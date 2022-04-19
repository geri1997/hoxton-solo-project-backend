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
    createQuestion,
    createQuestionTag,
    createUser,
    getCommentById,
    getCommentLike,
    getPopularTags,
    getQuestionById,
    getQuestionComments,
    getQuestions,
    getQuestionsByTag,
    getTagByName,
    getCommentDislike,
    getTags,
    getUserByX,
    increaseCommentUpvote,
    createCommentDislike,
    increaseCommentDownvote,
    deleteCommentLike,
    deleteCommentDislike,
    decreaseNumberOfCommentDownvotes,
    decreaseNumberOfCommentUpvotes,
    getQuestionLike,
    getQuestionDislike,
    deleteQuestionDislike,
    decreaseNumberOfQuestionDownvotes,
    createQuestionLike,
    increaseQuestionUpvote,
    createQuestionDislike,
    increaseQuestionDownvote,
    decreaseNumberOfQuestionUpvotes,
    deleteQuestionLike,
    getQuestionsThatIncludeTitle,
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
                Authorization: process.env.DISCORD_TOKEN!,
            },
        }
    );

    // const messages = response.data;

    const filteredThreads = allThreads.data.filter((message: any) => {
        return message.thread;
    });

    // for (const thread of filteredThreads) {
    //    await axios
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
app.get('/single-discord-q/:channelId', async (req, res) => {
    const id = req.params.channelId;
    const allThreads = await axios.get(
        `https://discord.com/api/v9/channels/${id}/messages?limit=50`,
        {
            headers: {
                Authorization: process.env.DISCORD_TOKEN!,
            },
        }
    );
    console.log(allThreads);
    res.send(allThreads.data);
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
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByX('id', decodedData.id);

        const question = getQuestionById(id);
        const comments = getQuestionComments(id);
        question.isLiked = Boolean(getQuestionLike(user.id, id));
        question.isDisliked = Boolean(getQuestionDislike(user.id, id));
        if (user) {
            for (const comment of comments) {
                comment.isLiked = Boolean(getCommentLike(user.id, comment.id));
                comment.isDisliked = Boolean(
                    getCommentDislike(user.id, comment.id)
                );
            }
        }
        question.comments = comments;
        res.send(question);
    } catch (error) {
        const question = getQuestionById(id);
        const comments = getQuestionComments(id);
        question.comments = comments;
        res.send(question);
    }
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
        if (!user) throw Error;
        if (getCommentLike(user.id, +id))
            return res
                .status(400)
                .send({ error: 'You already upvoted this comment' });
        if (getCommentDislike(user.id, +id)) {
            deleteCommentDislike(user.id, +id);
            decreaseNumberOfCommentDownvotes(+id);
        }
        createCommentLike(user.id, +id);
        increaseCommentUpvote(+id);

        const comment = getCommentById(id);
        comment.isLiked = true;
        comment.isDisliked = false;
        res.send(comment);
    } catch (error) {
        res.status(400).send({ error });
    }
});

//downvote comment
app.patch('/comment/:id/downvote', (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByX('id', decodedData.id);
        if (!user) throw Error;
        if (getCommentDislike(user.id, +id))
            return res
                .status(400)
                .send({ error: 'You already downvoted this comment' });
        createCommentDislike(user.id, +id);
        increaseCommentDownvote(+id);
        if (getCommentLike(user.id, +id)) {
            decreaseNumberOfCommentUpvotes(+id);
            deleteCommentLike(user.id, +id);
        }

        const comment = getCommentById(id);
        comment.isDisliked = true;
        comment.isLiked = false;
        res.send(comment);
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

//create question
app.post('/question', (req, res) => {
    const { userId, title, content, createdAt, tag } = req.body;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedData.id !== userId) throw Error;
        const result = createQuestion(userId, title, content, createdAt);
        const foundTag = getTagByName(tag);
        // if (!foundTag)return
        createQuestionTag(result.lastInsertRowid, foundTag.id);
        const questions = getQuestions(0);
        for (const question of questions) {
            question.nrOfAnswers = countQuestionAnswers(question.id);
        }

        res.send({ questions, count: countQuestions() });
        res.send();
    } catch (error) {
        res.status(400).send({ error });
    }
});

//search
app.get('/search', (req, res) => {
    const questions = getQuestionsThatIncludeTitle(req.query.search as string);
    for (const question of questions) {
        question.nrOfAnswers = countQuestionAnswers(question.id);
    }

    res.send({ questions, count: countQuestions() });
    // res.send(questions)
});

//upvote question
app.patch('/question/:id/upvote', (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByX('id', decodedData.id);
        if (!user) throw Error;
        if (getQuestionLike(user.id, +id))
            return res
                .status(400)
                .send({ error: 'You already upvoted this question' });
        if (getQuestionDislike(user.id, +id)) {
            deleteQuestionDislike(user.id, +id);
            decreaseNumberOfQuestionDownvotes(+id);
        }
        createQuestionLike(user.id, +id);
        increaseQuestionUpvote(+id);

        const question = getQuestionById(+id);
        question.isLiked = true;
        question.isDisliked = false;
        res.send(question);
    } catch (error) {
        res.status(400).send({ error });
    }
});

//downvote question
app.patch('/question/:id/downvote', (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization || '';
    try {
        //@ts-ignore
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByX('id', decodedData.id);
        if (!user) throw Error;
        if (getQuestionDislike(user.id, +id))
            return res
                .status(400)
                .send({ error: 'You already downvoted this question' });
        createQuestionDislike(user.id, +id);
        increaseQuestionDownvote(+id);
        if (getQuestionLike(user.id, +id)) {
            decreaseNumberOfQuestionUpvotes(+id);
            deleteQuestionLike(user.id, +id);
        }

        const question = getQuestionById(+id);
        question.isDisliked = true;
        question.isLiked = false;
        res.send(question);
    } catch (error) {
        res.status(400).send({ error });
    }
});

//video stuff
// const { v4: uuidV4 } = require('uuid');
// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// // const io = require('socket.io')(server);
// const { ExpressPeerServer } = require('peer');
// const peerServer = ExpressPeerServer(server, {
// debug: true,
// });
// app.use('/peerjs', peerServer);
// app.get('/', (req, res) => {
//     res.redirect(`/${uuidV4()}`);
// });

// app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room });
// });

// io.on('connection', (socket: any) => {
//     socket.on('join-room', (roomId: any, userId: any) => {
//         socket.join(roomId);
//         socket.to(roomId).broadcast.emit('user-connected', userId);
//     });
// });

// import http from 'http';
// const server = http.createServer(app);
// import { Server } from 'socket.io';
// const io = new Server(server);

// app.get('/ama', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', (socket: any) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         io.emit('disconnecta', `1 of the suers has disconnected`);
//         console.log('user disconnected');
//     });

//     socket.on('resize', (msg: any) => {
//         console.log('resized');
//         io.emit('resize', 'wndow resized');
//     });

//     socket.on('keypress', (msg: any) => {
//         console.log('key pressed');
//         //kur ndodh eventi me emrin keypress, bahet console log ne terminal key pressed edhe i bahet broadcast ose emit to all users qe e jan listening per ikyt event(listening mduket asht kur kan (socket.on('keypress', (msg) => {
//         // console.log(msg);
//         // });)). msg itu asht njaj second argument qe kam nis kur bahet ky eventi. nkyt rast asht e.key. edhe baj broadcast msg + ' key has been pressed'.
//         io.emit('keypress', msg + ' key has been pressed');
//     });

//     socket.on('chataa message', (msg: any) => {
//         io.emit('chataa message', msg);
//         console.log('message: ' + msg);
//     });
// });

// const path = require('path');
// const http = require('http');
// const socketio = require('socket.io');
// const formatMessage = require('./utils/messages');
// const {
//     userJoin,
//     getCurrentUser,
//     userLeave,
//     getRoomUsers,
// } = require('./utils/users');

// const server = http.createServer(app);
// const io = socketio(server);

// // Set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// const botName = 'ChatCord Bot';

// // Run when client connects
// io.on('connection', (socket: any) => {

//     io.emit('message', 'Welcome to ChatCord');
//     socket.emit('message', 'Welcome to ChatCord');

//     socket.on(
//         'joinRoom',
//         ({ username, room }: { username: any; room: any }) => {
//             const user = userJoin(socket.id, username, room);

//             socket.join(user.room);

//             // Welcome current user
//             socket.emit(
//                 'message',
//                 formatMessage(botName, 'Welcome to ChatCord!')
//             );

//             // Broadcast when a user connects
//             socket.broadcast
//                 .to(user.room)
//                 .emit(
//                     'message',
//                     formatMessage(
//                         botName,
//                         `${user.username} has joined the chat`
//                     )
//                 );

//             // Send users and room info
//             io.to(user.room).emit('roomUsers', {
//                 room: user.room,
//                 users: getRoomUsers(user.room),
//             });
//         }
//     );

//     // Listen for chatMessage
//     socket.on('chatMessage', (msg: any) => {
//         const user = getCurrentUser(socket.id);

//         io.to(user.room).emit('message', formatMessage(user.username, msg));
//     });

//     // Runs when client disconnects
//     socket.on('disconnect', () => {
//         const user = userLeave(socket.id);

//         if (user) {
//             io.to(user.room).emit(
//                 'message',
//                 formatMessage(botName, `${user.username} has left the chat`)
//             );

//             // Send users and room info
//             io.to(user.room).emit('roomUsers', {
//                 room: user.room,
//                 users: getRoomUsers(user.room),
//             });
//         }
//     });
// });

// const uuidv4 = require('uuid').v4;

// const messages = new Set();
// const users = new Map();

// const defaultUser = {
//     id: 'anon',
//     name: 'Anonymous',
// };

// const messageExpirationTimeMS = 5 * 60 * 1000;

// class Connection {
//     constructor(io:any, socket:any) {
//         //@ts-ignore
//         this.socket = socket;//@ts-ignore
//         this.io = io;

//         socket.on('getMessages', () => this.getMessages());//@ts-ignore
//         socket.on('message', (value) => {
//             this.handleMessage(value);
//             console.log(value);
//         });
//         socket.on('disconnect', () => this.disconnect());//@ts-ignore
//         socket.on('connect_error', (err) => {
//             console.log(`connect_error due to ${err.message}`);
//         });
//     }
// //@ts-ignore
//     sendMessage(message) {//@ts-ignore
//         this.io.sockets.emit('message', message);
//     }

//     getMessages() {
//         messages.forEach((message) => this.sendMessage(message));
//     }
// //@ts-ignore
//     handleMessage(value) {
//         const message = {
//             id: uuidv4(),//@ts-ignore
//             user: users.get(this.socket) || defaultUser,
//             value,
//             time: Date.now(),
//         };

//         messages.add(message);
//         this.sendMessage(message);

//         setTimeout(() => {
//             messages.delete(message);//@ts-ignore
//             this.io.sockets.emit('deleteMessage', message.id);//@ts-ignore
//         }, messageExpirationTimeMS);
//     }

//     disconnect() {//@ts-ignore
//         users.delete(this.socket);
//     }
// }
// //@ts-ignore
// function chat(io) {//@ts-ignore
//     io.on('connection', (socket) => {
//         console.log('hello');
//         new Connection(io, socket);
//     });
// }

// var socketio = require('socket.io');
// var http = require('http');

// var server = http.createServer(app);
// var io = socketio(server,{
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });
// chat(io);
import fetch from 'node-fetch';
import jquery from 'jquery';
import cheerio from 'cheerio';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

app.get('/filma24-new', async (req, res) => {
    const resq = await fetch('https://www.filma24.so/feed', {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        },
    });
    const text = await resq.text();
    // const html = cheerio.load(text)
    // const html = jquery.parseHTML(text)
    // console.log(text);

    const parser = new XMLParser();
    let jObj = parser.parse(text);
    console.log(jObj.rss.channel.item);
    //@ts-ignore
    // res.send(html);
    res.send('ok');
});

import { parse } from 'node-html-parser';
import { genres, movies } from './movies';
import https from 'https'; // or 'https' for https:// URLs
import fs from 'fs';

app.get('/single-movie', async (req, res) => {
    const resq = await fetch('https://www.filma24.so/post-sitemap9.xml');
    const htmlText = await resq.text();
    const parser = new XMLParser();
    let jObj = parser.parse(htmlText);
    const entries = jObj.urlset.url; //array of each entry that contains loc,image
    const movies = [];
    for (const entry of entries) {
        console.log(entry);
        const singleMovie = await fetch(entry.loc);
        const singleMovieText = await singleMovie.text();
        const singleMovieHtml = parse(singleMovieText);
        const movieLink = singleMovieHtml.querySelector(
            'div.player div.movie-player p iframe'
        )?.attributes.src;
        const movieTitle = singleMovieHtml.querySelector(
            '.movie-info .main-info .title h2'
        )?.innerText;
        const trailerLink = singleMovieHtml.querySelector(
            '.trailer-player iframe'
        )?.attributes.src;
        const genreLis = singleMovieHtml.querySelectorAll(
            '.secondary-info .info-left .genre li'
        );
        const genres: any = [];
        genreLis.forEach((li) => genres.push(li.innerText));
        const movieLength = singleMovieHtml.querySelector(
            '.info-right span.movie-len'
        )?.innerText;
        const releaseYear = singleMovieHtml.querySelector(
            '.info-right span.quality'
        )?.innerText;
        const imdbRating = singleMovieHtml.querySelector(
            '.info-right span:last-child a'
        )?.innerText;
        const synopsis = singleMovieHtml.querySelector(
            '.synopsis .syn-wrapper p'
        )?.innerText;
        
        const file = fs.createWriteStream(
            `images/${entry['image:image']['image:loc'].split('/').pop()}`
        );
        const request = https.get(
            entry['image:image']['image:loc'].replace('http', 'https'),
            function (response) {
                response.pipe(file);
            }
        );
        const thumbnail = entry['image:image']['image:loc'];
        movies.push({
            title: movieTitle,
            videoSrc: movieLink,
            genres,
            trailerSrc: trailerLink,
            duration: movieLength,
            releaseYear,
            ratingImdb: imdbRating,
            description: synopsis,
            photoSrc: thumbnail,
        });
    }

    // console.log({movieLink,movieTitle,trailerLink,genres,movieLength,releaseYear,imdbRating,synopsis})
    res.send(movies);
});

// app.get('/asd', (req, res) => {
//     //@ts-ignore
//     // movies.forEach(movie=>delete movie.genres)
//     movies.forEach((movie) => (movie.ratingImdb = Number(movie.ratingImdb)));
//     //@ts-ignore
//     movies.forEach((movie) => (movie.releaseYear = Number(movie.releaseYear)));
//     movies.forEach((movie) => {
//         const genresa = [];
//         for (let genre of movie.genres) {
//             const genreId = genres.find((genre1) => genre1.name === genre);
//             const id = genres.findIndex(
//                 (genre) => genre.name === genreId?.name
//             );
//             //@ts-ignore
//             genresa.push(id + 1);
//         }
//         //@ts-ignore
//         movie.genres = genresa;
//     });
//     res.send(movies);
// });
