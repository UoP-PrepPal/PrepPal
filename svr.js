import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const port = 8080;

const dbPromise = open({
  filename: path.resolve('db', 'database.sqlite'),
  driver: sqlite3.Database,
});

app.use(express.json());
app.use(express.static('client'));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
