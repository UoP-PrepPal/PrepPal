const saveBtn = document.querySelector('#save-btn');
const ingredientInput = document.querySelector('#ingredient');
const addIngredientBtn = document.querySelector('#add-ingredient');
const ingredientList = document.querySelector('#ingredient-list');
const emailInput = document.querySelector('#email');
const usernameInput = document.querySelector('#username');
//const password = document.querySelector('#password');
//const retypedPassword = document.querySelector('#retype-password');
const createAccountBtn = document.querySelector('#create-account');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const signInUsername = document.querySelector('#signin-username');
const signInEmail = document.querySelector('#signin-email');
const SignInBtn = document.querySelector('#signin-btn');
const logoutBtn = document.querySelector('#logout-btn');
const recipesList = document.getElementById("recipes-list");

if (recipesList) {
    window.addEventListener('DOMContentLoaded', () => {
      fetch('/recipes')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch recipes');
          }
          return response.json();
        })
        .then(data => {
          recipesList.innerHTML = '';
          if (data.recipes.length === 0) {
            recipesList.innerHTML = '<p>No recipes found.</p>';
          } else {
            data.recipes.forEach(recipe => {
              const recipeCard = document.createElement('div');
              recipeCard.className = 'recipe-card';
              recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p><strong>Description:</strong> ${recipe.description}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                <p><strong>Prep Time:</strong> ${recipe.est_time_min} mins</p>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
              `;
              recipesList.appendChild(recipeCard);
            });
          }
        })
        .catch(error => {
          console.error('Error loading recipes:', error);
          recipesList.innerHTML = '<p>Error loading recipes.</p>';
        });
    });
  }
  

function addIngredient() {
    const ingredientValue = ingredientInput.value.trim(); 
    if (ingredientValue) {
        const newIngredient = document.createElement('p');
        newIngredient.textContent = ingredientValue;
        ingredientList.appendChild(newIngredient);
        ingredientInput.value = '';
    }
}

function saveRecipe() {
    const recipeName = document.querySelector('#recipe-name');
    const recipeDescription = document.querySelector('#recipe-description');
    const recipeInstructions = document.querySelector('#recipe-instructions');
    const recipeTime = document.querySelector('#prep-time');

    if (!recipeName || !recipeDescription || !recipeTime) {
        console.error('One or more required elements are missing.');
        return;
    }

    const ingredientElements = ingredientList.querySelectorAll('p');
    const ingredients = Array.from(ingredientElements).map(ingredient => ingredient.textContent);

    const user_id = sessionStorage.getItem('userId');
    if (!user_id){
        console.log("User is not logged in");
        return;
    }

    const recipeData = {
        user_id: user_id,
        name: recipeName.value.trim(),
        description: recipeDescription.value.trim(),
        instructions: recipeDescription.value.trim(),
        est_time_min: parseInt(recipeTime.value, 10),
        ingredients: ingredients.join(', ') 
    };

    console.log('Recipe Data:', recipeData);

    fetch('/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('Recipe saved successfully:', data);
        }
    })
    .catch(error => {
        console.error('Error saving recipe:', error);
    });
}

function createAccount(){
    const userData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        first_name: firstNameInput.value.trim(),
        last_name: lastNameInput.value.trim()
    }

    console.log('User Data: ', userData);

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('User account created successfully:', data);
        }
    })
    .catch(error => {
        console.error('Error creating account:', error);
    });
}

function signIn(){
    const signInData = {
        username: signInUsername.value.trim(),
        email: signInEmail.value.trim()
    }
    console.log('Sign in data: ', signInData);

    fetch('/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(signInData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('User signed in successfully:', data);
            sessionStorage.setItem('userId', data.user_id);
            window.location.href = '/dashboard'; 
        }
    })
    .catch(error => {
        console.error('Error signing in:', error);
    });
}

function logout() {
    console.log("Hello");
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('Logged out successfully:', data.message);
            window.location.href = '/signin.html'; 
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}



if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', addIngredient);
}

if (saveBtn) {
    saveBtn.addEventListener('click', saveRecipe);
}

if (createAccountBtn) {
    createAccountBtn.addEventListener('click', createAccount);
}

if (SignInBtn){
    SignInBtn.addEventListener('click', signIn);
}

if (logoutBtn){
    logoutBtn.addEventListener('click', logout);
}