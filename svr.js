// Import required packages
import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 8080;

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open SQLite database using sqlite3 driver
const dbPromise = open({
  filename: path.resolve(__dirname, 'db', 'database.sqlite'),
  driver: sqlite3.Database,
});

const allowedPrepTimes = [0, 5, 10, 15, 20, 30, 45, 60, 90, 120];
const allowedDifficulties = ['Easy', 'Medium', 'Hard'];

// Configure express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key', // Secret for signing session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Session lasts for 1 day
  }
}));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static frontend files from "client" directory
app.use(express.static('client'));

// Route: Serve sign-in page on root URL
app.get('/', (req, res) => {
  res.sendFile(path.resolve('client', 'signIn.html'));
});

// Route: Add new recipe to the database
app.post('/recipes', async (req, res) => {
  try {
    console.log('Request Body:', req.body); 
    const { user_id, name, description, instructions, est_time_min, ingredients, difficulty} = req.body;

    // Validate required fields
    if (!user_id || !name || !description || !instructions || !est_time_min || !ingredients || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate est_time_min
    if (!allowedPrepTimes.includes(Number(est_time_min))) {
      return res.status(400).json({ error: 'Invalid value for estimated time' });
    }

    // Validate difficulty
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid value for difficulty' });
    }

    const db = await dbPromise;

    // Insert recipe into database
    const result = await db.run(
      `INSERT INTO recipes (user_id, name, description, instructions, est_time_min, ingredients, difficulty) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, description, instructions, est_time_min, ingredients, difficulty]
    );
    
    // Retrieve the last inserted row ID
    const row = await db.get('SELECT last_insert_rowid() as id');

    // Respond with success
    res.status(201).json({
      message: 'Recipe added successfully',
      id: row.id, // Use the retrieved ID
    });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Create new user (sign-up)
app.post('/signup', async (req, res) => {
  try {
    console.log('Request Body: ', req.body);
    const { username, email, first_name, last_name } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const db = await dbPromise;

    // Check if the account already exists
    const existingUser = await db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    // Insert new user into the database
    const result = await db.run(
      `INSERT INTO users (username, email, first_name, last_name)
      VALUES (?, ?, ?, ?)`,
      [username, email, first_name, last_name]
    );

    res.status(201).json({
      message: 'User added successfully',
      id: result.lastID,
    });
  } catch (error) {
    console.log('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Delete the logged-in user's account and their recipes
app.delete('/account', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await dbPromise;

    // Delete all recipes belonging to the user
    await db.run('DELETE FROM recipes WHERE user_id = ?', [req.session.userId]);

    // Delete the user account
    const result = await db.run('DELETE FROM users WHERE user_id = ?', [req.session.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Destroy the session after deleting the account
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Account deleted, but failed to log out' });
      }
      res.status(200).json({ message: 'Account and all recipes deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Authenticate user (sign-in)
app.post('/signIn', async (req, res) => {
  const { username, email } = req.body;
  const db = await dbPromise;

  // Query database for user with matching credentials
  const user = await db.get('SELECT * FROM users WHERE username = ? AND email = ?', [username, email]);

  if (user) {
    // Set session variables
    req.session.userId = user.user_id;
    req.session.username = user.username;
    res.status(200).json({ message: 'User signed in successfully', user_id: user.user_id });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Route: Serve sign-in HTML page
app.get('/signin', async (req, res) => {
  res.sendFile(path.resolve('client', 'signIn.html'));
});

// Route: Serve dashboard page if logged in
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to view the dashboard' });
  }

  res.sendFile(path.resolve('client', 'dashboard.html'));
});

// Route: Serve sign-up page
app.get('/signup', async (req, res) => {
  res.sendFile(path.resolve('client', 'signUp.html'));
});

// Route: Log out user by destroying session
app.post('/logout', (req, res) => {
if (!req.session.userId) {
    return res.status(500).json({ error: 'Failed to log out' });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Route: Serve add recipe page (protected)
app.get('/addrecipes', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to add recipes' });
  }

  res.sendFile(path.resolve('client', 'recipe.html'));
});

// Route: Get all recipes belonging to the logged-in user
app.get('/recipes', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to view recipes' });
    }

    const db = await dbPromise;
    const recipes = await db.all('SELECT * FROM recipes WHERE user_id = ?', [req.session.userId]);

    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Delete a specific recipe (only if user owns it)
app.delete('/recipes/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const recipeId = req.params.id;
    const db = await dbPromise;

    // Delete recipe from database only if it belongs to current user
    const result = await db.run(
      'DELETE FROM recipes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, req.session.userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found or unauthorized' });
    }

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Update a specific recipe (only if user owns it)
app.put('/recipes/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const recipeId = req.params.id;
    const { name, description, instructions, est_time_min, ingredients, difficulty } = req.body;

    // Validate required fields
    if (!name || !description || !instructions || !est_time_min || !ingredients || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }


    // Validate est_time_min
    if (!allowedPrepTimes.includes(Number(est_time_min))) {
      return res.status(400).json({ error: 'Invalid value for estimated time' });
    }

    // Validate difficulty
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid value for difficulty' });
    }

    const db = await dbPromise;

    // Update recipe fields in the database
    const result = await db.run(`
      UPDATE recipes
      SET name = ?, description = ?, instructions = ?, est_time_min = ?, ingredients = ?, difficulty = ?
      WHERE recipe_id = ? AND user_id = ?
    `, [name, description, instructions, est_time_min, ingredients, difficulty, recipeId, req.session.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found or unauthorized' });
    }

    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the "View Other's Recipes" page
//app.get('/view-others-recipes', (req, res) => {
//  res.sendFile(path.resolve('client', 'view-others-recipes.html'));
//});


// Route: Get recipes of a user by username
app.get('/recipes/username/:username', async (req, res) => {
  try {
    if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to view others recipes' });
  }
    const { username } = req.params;
    const db = await dbPromise;

    // Fetch the user by username
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the recipes of this user
    const recipes = await db.all('SELECT * FROM recipes WHERE user_id = ?', [user.user_id]);

    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server on specified port
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

export default app;
