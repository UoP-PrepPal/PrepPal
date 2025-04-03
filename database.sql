/*

Links to database logical resources:

- ERD: https://www.edrawmax.com/online/share.html?code=9b7de5cee88011ef9c1f0a54be41f961
- Data Dictionary: https://docs.google.com/document/d/1FZFvx8Ackj2w9GUdl1m55n319Ih34K4-ekknqC8ot4k/edit?usp=sharing


Entities:

- users
- preferences
- user-preferences
- friends

- favourites (recipes)
- ratings

- recipes
- ingredients
- recipe-ingredients
- allergies
- ingredient-allergens
- categories
- recipe-categories

*/

-- SQLite version of the database schema

-- Create statuses table (replacing ENUM with TEXT)
CREATE TABLE statuses (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL UNIQUE
);

-- Insert values for statuses
INSERT INTO statuses (status) VALUES ('Requested');
INSERT INTO statuses (status) VALUES ('Accepted');
INSERT INTO statuses (status) VALUES ('Blocked');

-- Create users table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    created_at DATE NOT NULL DEFAULT current_date,
    profile_picture TEXT
);

-- Create friends table
CREATE TABLE friends (
    friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    friend_status INTEGER NOT NULL,  -- Changed to INTEGER referring to statuses
    requested_at DATE DEFAULT current_date,
    accepted_at DATE,
    blocked_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (friend_id) REFERENCES users(user_id),
    FOREIGN KEY (friend_status) REFERENCES statuses(status_id)
);

-- Create recipes table
CREATE TABLE recipes (
    recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    est_time_min INTEGER NOT NULL,
    ingredients TEXT,
    date_added DATE NOT NULL DEFAULT current_date,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create ratings table
CREATE TABLE ratings (
    rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
    comments TEXT,
    date_added DATE NOT NULL DEFAULT current_date,
    edited_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Create categories table
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Create recipe_categories table (many-to-many relationship)
CREATE TABLE recipe_categories (
    recipe_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Create favourites table
CREATE TABLE favourites (
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Create allergies table
CREATE TABLE allergies (
    allergy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Create ingredient_allergens table (many-to-many relationship)
CREATE TABLE ingredient_allergens (
    ingredient_id INTEGER NOT NULL,
    allergy_id INTEGER NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id),
    FOREIGN KEY (allergy_id) REFERENCES allergies(allergy_id)
);

-- View to gather ingredients and allergens for recipes
CREATE VIEW ingredients_info AS
SELECT
    r.recipe_id AS "Recipe",
    i.name AS "Ingredient",
    ri.unit AS "Amount",
    GROUP_CONCAT(a.name, ', ') AS "Allergens"
FROM
    ingredients i
    JOIN recipe_ingredients ri USING (ingredient_id)
    JOIN recipes r USING (recipe_id)
    JOIN ingredient_allergens ia ON i.ingredient_id = ia.ingredient_id
    JOIN allergies a USING (allergy_id)
GROUP BY r.recipe_id, i.name, ri.unit
ORDER BY r.recipe_id, i.name;
