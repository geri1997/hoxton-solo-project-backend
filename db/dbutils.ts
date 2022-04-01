import Database from 'better-sqlite3';

const db = new Database('./data.db', {
    verbose: console.log,
});

export function createUser(username: string, email: string, password: string) {
    return db
        .prepare(
            `INSERT INTO user (username,email,password) VALUES (?,?,?)`
        )
        .run(username, email, password,);
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