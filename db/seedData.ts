//import faker
import faker from '@faker-js/faker';

export const tags = [
    {
        name: 'javascript',
        description:
            'Javascript is a programming language that allows you to write code that interacts with the browser.',
    },
    {
        name: 'react',
        description:
            'React is a JavaScript library for building user interfaces.',
    },
    {
        name: 'node',
        description:
            'Node.js is an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side.',
    },
    {
        name: 'express',
        description:
            'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
    },
    {
        name: 'mongodb',
        description:
            'MongoDB is a cross-platform document-oriented database program. It was created by MongoDB, Inc. and licensed under the Server Side Public License.',
    },
    {
        name: 'typescript',
        description:
            'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
    },
    {
        name: 'html',
        description:
            'HTML is the standard markup language for creating web pages and web applications.',
    },
    {
        name: 'css',
        description:
            'CSS is the language used to describe the look and formatting of a document written in HTML.',
    },
];

export const questions = [
    {
        title: 'How do I use TypeScript with React?',
        content:
            'I am trying to use TypeScript with React, but I get an error. I am using TypeScript 2.8.1 and React 16.8.4. I have tried the following:',
        upvotes: 41,
        downvotes: 30,
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        title: "is there any method through which we can measure time a user took for filing a text field in react?How to do a 'for' loop in TypeScript?",
        content:
            'Can we measure the time a user takes for filling a text field in REACT forms? I mean how to monitor the time it takes a user to enter data into the input text field',
        upvotes: 40,
        downvotes: 12,
        createdAt: new Date().toISOString(),
        userId: 1,
    },
];


//generate an array with random users
export const generateUsers = (numUsers: number) => {
    const users = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        });
    }
    return users;
};

//generate an array with programming questions
export const generateQuestions = () => {
    const questions = [];
    for (let i = 0; i < 100; i++) {
        const question = {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            upvotes: Math.floor(Math.random() * 100),
            downvotes:  Math.floor(Math.random() * 100),
            createdAt: new Date().toISOString(),
            userId: Math.ceil(Math.random() * 10),
        };
        questions.push(question);
    }
    return questions;
};

//generate question comments
export const generateComments = () => {
    const comments = [];
    for (let i = 0; i < 200; i++) {
        const comment = {
            content: faker.lorem.paragraph(),
            upvotes: Math.floor(Math.random() * 100),
            downvotes: Math.floor(Math.random() * 100),
            createdAt: new Date().toISOString(),
            userId: Math.ceil(Math.random() * 10),
            questionId: Math.ceil(Math.random() * 100),
        };
        comments.push(comment);
    }
    return comments;
}