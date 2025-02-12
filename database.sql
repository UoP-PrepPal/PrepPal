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

CREATE TYPE statuses AS ENUM ('Online', 'Offline');

CREATE TABLE Users (
    user_id SERIAL, 
    username varchar(20) NOT NULL UNIQUE, 
    email varchar(100) NOT NULL UNIQUE,
    first_name varchar(20),
    last_name varchar(20),
    -- password_hash NOT NULL,
    created_at DATE DEFAULT current_date,
    profile_picture VARCHAR(50), 
    PRIMARY KEY (user_id)
);

CREATE TABLE Friends (
    friendship_id SERIAL,
    user_id int NOT NULL,
    friend_id int NOT NULL,
    friend_status statuses NOT NULL,
    requested_at DATE DEFAULT current_date,
    accepted_at DATE,
    blocked_at DATE,
    PRIMARY KEY (friendship_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (friend_id) REFERENCES Users(user_id)
);

CREATE TABLE Preferences (
    preference_id SERIAL,
    name VARCHAR(20) NOT NULL UNQIUE,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (preference_id)
);

CREATE TYPE statuses AS ENUM ('Requested', 'Accepted', 'Blocked');

CREATE TABLE users (
    user_id SERIAL, 
    username varchar(20) NOT NULL UNIQUE, 
    email varchar(100) NOT NULL UNIQUE,
    first_name varchar(20),
    last_name varchar(20),
    -- password_hash NOT NULL,
    created_at DATE NOT NULL DEFAULT current_date,
    profile_picture VARCHAR(50), 
    PRIMARY KEY (user_id)
);

CREATE TABLE friends (
    friendship_id SERIAL,
    user_id int NOT NULL,
    friend_id int NOT NULL,
    friend_status statuses NOT NULL,
    requested_at DATE DEFAULT current_date,
    accepted_at DATE,
    blocked_at DATE,
    PRIMARY KEY (friendship_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (friend_id) REFERENCES users(user_id)
);

CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    name VARCHAR(30) NOT NULL,
    description VARCHAR(255),
    instructions VARCHAR(1023) NOT NULL,
    est_time_min SMALLINT NOT NULL,
    image VARCHAR(50) NOT NULL,
    date_added DATE NOT NULL DEFAULT current_date
);

CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    recipe_id INT NOT NULL REFERENCES recipes(recipe_id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
    comments VARCHAR(127),
    date_added DATE NOT NULL DEFAULT current_date,
    edited_at DATE
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(127)
);

CREATE TABLE recipe_categories (
    recipe_id INT NOT NULL REFERENCES recipes(recipe_id),
    category_id INT NOT NULL REFERENCES categories(category_id),
    PRIMARY KEY (recipe_id, category_id)
);

CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(63) NOT NULL
);

CREATE TABLE recipe_ingredients (
    recipe_id INT NOT NULL REFERENCES recipes(recipe_id),
    ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id),
    PRIMARY KEY (recipe_id, ingredient_id),
    unit VARCHAR(10) NOT NULL
);

CREATE TABLE allergies (
    allergy_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(63)
);

CREATE TABLE ingredient_allergens (
    ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id),
    allergy_id INT NOT NULL REFERENCES allergies(allergy_id)
);
-- i love derek