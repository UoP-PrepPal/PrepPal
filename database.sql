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
)