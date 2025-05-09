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
    const { user_id, name, description, instructions, est_time_min, ingredients } = req.body;

    // Validate required fields
    if (!user_id || !name || !instructions || !est_time_min) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await dbPromise;

    // Insert recipe into database
    const result = await db.run(
      `INSERT INTO recipes (user_id, name, description, instructions, est_time_min, ingredients) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, description, instructions, est_time_min, ingredients]
    );

    // Respond with success
    res.status(201).json({
      message: 'Recipe added successfully',
      id: result.lastInsertRowid,
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

    // Insert new user into the database
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
    const { name, description, instructions, est_time_min, ingredients } = req.body;

    const db = await dbPromise;

    // Update recipe fields in the database
    const result = await db.run(`
      UPDATE recipes
      SET name = ?, description = ?, instructions = ?, est_time_min = ?, ingredients = ?
      WHERE recipe_id = ? AND user_id = ?
    `, [name, description, instructions, est_time_min, ingredients, recipeId, req.session.userId]);

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

app.post('/recipes/:id/rate', async (req, res) => {
  try {
    const db = await dbPromise;
    const recipeId = parseInt(req.params.id, 10);
    const { user_id, rating } = req.body;

    if (!user_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating or user ID' });
    }

    const recipe = await db.get('SELECT * FROM recipes WHERE recipe_id = ?', [recipeId]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await db.run(`
      INSERT INTO ratings (user_id, recipe_id, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, recipe_id) DO UPDATE SET rating = excluded.rating
    `, [user_id, recipeId, rating]);

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get average rating of a specific recipe
app.get('/recipes/:id/average-rating', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const db = await dbPromise;

    // Get the average rating for the recipe
    const result = await db.get(`
      SELECT AVG(rating) AS average_rating
      FROM ratings
      WHERE recipe_id = ?
    `, [recipeId]);

    if (!result || result.average_rating === null) {
      return res.status(404).json({ error: 'Recipe not found or no ratings available' });
    }

    res.status(200).json({
      recipe_id: recipeId,
      average_rating: result.average_rating.toFixed(2), // rounding to 2 decimal places
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Start server on specified port
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

export default app;
