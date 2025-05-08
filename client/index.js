// Element selectors for various buttons and form inputs
const saveBtn = document.querySelector('#save-btn');
const ingredientInput = document.querySelector('#ingredient');
const addIngredientBtn = document.querySelector('#add-ingredient');
const ingredientList = document.querySelector('#ingredient-list');
const emailInput = document.querySelector('#email');
const usernameInput = document.querySelector('#username');
// const password = document.querySelector('#password');
// const retypedPassword = document.querySelector('#retype-password');
const createAccountBtn = document.querySelector('#create-account');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const signInUsername = document.querySelector('#signin-username');
const signInEmail = document.querySelector('#signin-email');
const SignInBtn = document.querySelector('#signin-btn');
const signInError = document.querySelector('#signin-error');
const logoutBtn = document.querySelector('#logout-btn');
const recipesList = document.getElementById("recipes-list");

// Load recipes on dashboard if recipesList exists
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
                    // Render each recipe as a card with edit/delete options
                    data.recipes.forEach(recipe => {
                        const recipeCard = document.createElement('div');
                        recipeCard.className = 'recipe-card';
                        recipeCard.innerHTML = `
                            <input type="text" class="edit-name" value="${recipe.name}" disabled />
                            <textarea class="edit-description" disabled>${recipe.description}</textarea>
                            <textarea class="edit-instructions" disabled>${recipe.instructions}</textarea>
                            <input type="number" class="edit-time" value="${recipe.est_time_min}" disabled />
                            <textarea class="edit-ingredients" disabled>${recipe.ingredients}</textarea>
                            <button class="edit-btn" data-id="${recipe.recipe_id}">Edit</button>
                            <button class="delete-btn" data-id="${recipe.recipe_id}">Delete</button>
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

    // Handle edit and delete button clicks
    recipesList.addEventListener('click', function (event) {
        const target = event.target;

        // Handle delete action
        if (target.classList.contains('delete-btn')) {
            const recipeId = target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this recipe?')) {
                fetch(`/recipes/${recipeId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        target.parentElement.remove();
                    } else {
                        console.error('Delete failed:', data.error);
                    }
                })
                .catch(err => console.error('Error deleting recipe:', err));
            }
        }

        // Handle edit/save toggle
        if (target.classList.contains('edit-btn')) {
            const card = target.parentElement;
            const isEditing = target.textContent === 'Save';
            const inputs = card.querySelectorAll('input, textarea');

            if (isEditing) {
                // Save updated recipe
                const recipeId = target.getAttribute('data-id');
                const updatedData = {
                    name: card.querySelector('.edit-name').value.trim(),
                    description: card.querySelector('.edit-description').value.trim(),
                    instructions: card.querySelector('.edit-instructions').value.trim(),
                    est_time_min: parseInt(card.querySelector('.edit-time').value.trim(), 10),
                    ingredients: card.querySelector('.edit-ingredients').value.trim()
                };

                fetch(`/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.message) {
                        console.log('Recipe updated successfully:', data);
                        inputs.forEach(el => el.disabled = true);
                        target.textContent = 'Edit';
                    } else {
                        console.error('Update failed:', data.error);
                    }
                })
                .catch(err => console.error('Error updating recipe:', err));
            } else {
                // Enable inputs for editing
                inputs.forEach(el => el.disabled = false);
                target.textContent = 'Save';
            }
        }
    });
}

// Add a new ingredient to the ingredient list
function addIngredient() {
    const ingredientValue = ingredientInput.value.trim();
    if (ingredientValue) {
        const ingredientWrapper = document.createElement('div');
        ingredientWrapper.classList.add('ingredient-item');

        const newIngredient = document.createElement('p');
        newIngredient.textContent = ingredientValue;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '❌';
        deleteBtn.style.marginLeft = '8px';
        deleteBtn.addEventListener('click', () => {
            ingredientWrapper.remove();
        });

        ingredientWrapper.appendChild(newIngredient);
        ingredientWrapper.appendChild(deleteBtn);
        ingredientList.appendChild(ingredientWrapper);

        ingredientInput.value = '';
    }
}

// Save a new recipe to the backend
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
    if (!user_id) {
        console.log("User is not logged in");
        return;
    }

    const recipeData = {
        user_id: user_id,
        name: recipeName.value.trim(),
        description: recipeDescription.value.trim(),
        instructions: recipeInstructions.value.trim(),
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

// Create a new user account
function createAccount() {
    const userData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        first_name: firstNameInput.value.trim(),
        last_name: lastNameInput.value.trim()
    };

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

// Sign in an existing user
function signIn() {
    const signInData = {
        username: signInUsername.value.trim(),
        email: signInEmail.value.trim()
    };

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
            if (signInUsername.value === "" || signInEmail.value === "") {
                signInError.textContent = "Error: Username and / or Email is empty. Please fill both fields";
            } else {
                signInError.textContent = "Error: Username and / or Email is incorrect. Please check and try again";
            }
            console.error('Error:', data.error);
        } else {
            console.log('User signed in successfully:', data);
            sessionStorage.setItem('userId', data.user_id);
            window.location.href = '/dashboard';
            signInError.textContent = "User signed in successfully!";
        }
    })
    .catch(error => {
        console.error('Error signing in:', error);
        signInError.textContent = "Error signing in";
    });
}

// Log out the current user
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

// Event listeners for buttons
if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', addIngredient);
}

if (saveBtn) {
    saveBtn.addEventListener('click', saveRecipe);
}

if (createAccountBtn) {
    createAccountBtn.addEventListener('click', createAccount);
}

if (SignInBtn) {
    SignInBtn.addEventListener('click', signIn);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
