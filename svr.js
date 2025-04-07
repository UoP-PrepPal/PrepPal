import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 8080;

const dbPromise = open({
  filename: path.resolve('db', 'database.sqlite'),
  driver: sqlite3.Database,
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
  }
}));


app.use(express.json());
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('client', 'introduction.html'));
});

app.post('/recipes', async (req, res) => {
  try {
    console.log('Request Body:', req.body); 

    const { user_id, name, description, instructions, est_time_min, ingredients } = req.body;
    if (!user_id || !name || !instructions || !est_time_min) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO recipes (user_id, name, description, instructions, est_time_min, ingredients) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, description, instructions, est_time_min, ingredients]
    );

    res.status(201).json({
      message: 'Recipe added successfully',
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    console.log('Request Body: ', req.body);
    const { username, email, first_name, last_name } = req.body;

    const missingFields = [];

    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO users (username, email, first_name, last_name)
      VALUES (?, ?, ?, ?)`,
      [username, email, first_name, last_name]
    );

    res.status(201).json({
      message: 'User added successfully',
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.log('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/recipes', async (req, res) => {
  
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
