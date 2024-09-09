
DROP TABLE IF EXISTS scoreboard;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE scoreboard
(
    identifier INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER NOT NULL
);
