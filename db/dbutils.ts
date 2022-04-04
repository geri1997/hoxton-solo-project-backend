import Database from 'better-sqlite3';

const db = new Database('./data.db', {
    verbose: console.log,
});

export function createUser(username: string, email: string, password: string) {
    return db
        .prepare(`INSERT INTO user (username,email,password) VALUES (?,?,?)`)
        .run(username, email, password);
}

export function getUserByX(
    column: string,
    value: string | number | bigint
): {
    id: number;
    username: string;
    email: string;
    password: string;
} {
    return db.prepare(`SELECT * FROM user WHERE ${column}=?`).get(value);
}

export function getQuestions(page: any) {
    return db
        .prepare(
            `select question.*,tags.name as tag,tags.id as tagId, user.username 
            from question
            join questionTags on question.id = questionTags.questionId
            join tags on questionTags.tagId = tags.id
			join user on question.userId = user.id
            Order by question.createdAt desc
			LIMIT 10 OFFSET ${page*10}
            `
        )
        .all();
}

export function countQuestions() {
    return db.prepare('SELECT COUNT(*) count FROM question').get();
}
export function countQuestionAnswers(id: number) {
    return db
        .prepare('SELECT COUNT(*) count FROM comments WHERE questionId=?')
        .get(id);
}

export function getTags() {
    return db.prepare('SELECT * FROM tags').all();
}

export function getQuestionById(id: number | bigint) {
    return db
        .prepare(
            `SELECT question.*, user.username, tags.name as tag, tags.id as tagId
    FROM question
     join questionTags on question.id = questionTags.questionId 
     Join user On question.userId=user.id
     Join tags on questionTags.tagId = tags.id
     Where question.id =?
    `
        )
        .get(id);
}

export function countTagQuestions(id: number) {
    return db
        .prepare('SELECT COUNT(*) count FROM questionTags WHERE tagId=?')
        .get(id);
}

export function getQuestionComments(id: number) {
    return db
        .prepare(
            `SELECT comments.*, user.username FROM comments JOIN user ON comments.userId = user.id WHERE questionId=?`
        )
        .all(id);
}

export function createComment(
    userId: number,
    questionId: number,
    content: string,
    createdAt: string
) {
    return db
        .prepare(
            `INSERT INTO comments (userId, questionId, content,createdAt) VALUES (?, ?, ?,?)`
        )
        .run(userId, questionId, content, createdAt);
}

export function getCommentById(id: any) {
    return db
        .prepare(
            `SELECT comments.*, user.username FROM comments JOIN user ON comments.userId = user.id WHERE comments.id=?`
        )
        .get(id);
}

export function getCommentLike(userId: number, commentId: number) {
    return db
        .prepare(`SELECT * FROM commentLikes WHERE userId=? AND commentId=?`)
        .get(userId, commentId);
}

export function createCommentLike(userId: number, commentId: number) {
    return db
        .prepare(`INSERT INTO commentLikes (userId, commentId) VALUES (?, ?)`)
        .run(userId, commentId);
}

export function increaseCommentUpvote(id: number) {
    return db
        .prepare(`UPDATE comments SET upvotes = upvotes + 1 WHERE id=?`)
        .run(id);
}

export function getPopularTags() {
    return db
        .prepare(
            ` SELECT tags.*, COUNT(questionId) AS question_count
    FROM tags LEFT JOIN questionTags
    ON tags.id = questionTags.tagId
    GROUP BY tags.id
    ORDER BY  question_count DESC`
        )
        .all();
}

//get questions with specific tag
export function getQuestionsByTag(tagId: number) {
    return db
        .prepare(
            `SELECT question.*, user.username, tags.name as tag,tags.id as tagId, tags.id as tagId
    FROM question
     join questionTags on question.id = questionTags.questionId 
     Join user On question.userId=user.id
     Join tags on questionTags.tagId = tags.id
     Where questionTags.tagId =?
    `
        )
        .all(tagId);
}

//count questions with speicific tag
export function countQuestionsByTag(tagId: number) {
    return db
        .prepare(`SELECT COUNT(*) count FROM questionTags WHERE tagId=?`)
        .get(tagId);
}

export function createQuestion(
    userId: number,
    title: string,
    content: string,
    createdAt: string
) {
    return db
        .prepare(
            `INSERT INTO question (userId, title, content,createdAt) VALUES (?, ?, ?,?)`
        )
        .run(userId, title, content, createdAt);
}

export function createQuestionTag(questionId: number | bigint, tagId: number) {
    return db
        .prepare(`INSERT INTO questionTags (questionId, tagId) VALUES (?, ?)`)
        .run(questionId, tagId);
}

export function getTagByName(name: any) {
    return db.prepare(`SELECT * FROM tags WHERE name=?`).get(name);
}
