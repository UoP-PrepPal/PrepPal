import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import uuid from 'uuid-random';

const app = express();
const port = 8080;

app.use(express.static('client/login.html'));
app.use(express.json());


app.listen(port);
console.log('Listening on http://localhost:8080');