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
const lastNameInput = document.querySelector('last-name');

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

    const recipeData = {
        user_id: 1,
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

    }
}

addIngredientBtn.addEventListener('click', addIngredient);
saveBtn.addEventListener('click', saveRecipe);
createAccountBtn.addEventListener('click', createAccount);