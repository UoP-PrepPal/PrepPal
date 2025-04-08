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

app.post('/signIn', async (req, res) => {
  const { username, email } = req.body;
  const db = await dbPromise;
  const user = await db.get('SELECT * FROM users WHERE username = ? AND email = ?', [username, email]);

  if (user) {
    req.session.userId = user.user_id;
    req.session.username = user.username;
    res.status(200).json({ message: 'User signed in successfully', user_id: user.user_id });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
})

app.get('/signin', async (req, res) => {
  res.sendFile(path.resolve('client', 'signIn.html'));
})

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to view the dashboard' });
  }

  res.sendFile(path.resolve('client', 'dashboard.html'));
});

app.get('/signup', async (req, res) => {
  res.sendFile(path.resolve('client', 'signUp.html'));
})

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});


app.get('/addrecipes', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to add recipes' });
  }

  res.sendFile(path.resolve('client', 'recipe.html'));
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
