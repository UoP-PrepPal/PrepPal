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
                            <div class="difficulty-wrapper"></div>
                            <button class="edit-btn" data-id="${recipe.recipe_id}">Edit</button>
                            <button class="delete-btn" data-id="${recipe.recipe_id}">Delete</button>
                        `;

                        const difficultySelect = document.createElement('select');
                        difficultySelect.className = 'edit-difficulty';
                        difficultySelect.disabled = true;

                        const difficulties = ['Easy', 'Medium', 'Hard'];
                        difficulties.forEach(level => {
                            const option = document.createElement('option');
                            option.value = level;
                            option.textContent = level;
                            if (recipe.difficulty === level) {
                                option.selected = true;
                            }
                            difficultySelect.appendChild(option);
                        });

                        const difficultyWrapper = recipeCard.querySelector('.difficulty-wrapper');
                        difficultyWrapper.appendChild(difficultySelect);

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
            const inputs = card.querySelectorAll('input, textarea, select');

            if (isEditing) {
                // Save updated recipe
                const recipeId = target.getAttribute('data-id');
                const updatedData = {
                    name: card.querySelector('.edit-name').value.trim(),
                    description: card.querySelector('.edit-description').value.trim(),
                    instructions: card.querySelector('.edit-instructions').value.trim(),
                    est_time_min: parseInt(card.querySelector('.edit-time').value.trim(), 10),
                    ingredients: card.querySelector('.edit-ingredients').value.trim(),
                    difficulty: card.querySelector('.edit-difficulty').value.trim()
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
    else{
        console.log("Cannot add empty ingredient value")
    }
}

// Save a new recipe to the backend
function saveRecipe() {
    const recipeName = document.querySelector('#recipe-name').value;
    const recipeDescription = document.querySelector('#recipe-description').value;
    const recipeInstructions = document.querySelector('#recipe-instructions').value;
    const recipeTime = document.querySelector('#prep-time').value;
    const prepTime = document.querySelector('#prep-time').value;
    const ingredientEntry = document.querySelector('#ingredient').value;
    const difficulty = document.querySelector('#difficulty').value;

    const validPrepTimes = ["0", "5", "10", "15", "20", "30", "45", "60", "90", "120"];

    let errorMessage = "";

    // empty fields
    if (!recipeName) {
        errorMessage += "Recipe name cannot be empty.\n";
    }

    if (!recipeDescription) {
        errorMessage += "Recipe description cannot be empty.\n";
    }

    if (!recipeInstructions) {
        errorMessage += "Recipe instructions cannot be empty.\n";
    }

    if (!prepTime) {
        errorMessage += "Preparation time must be selected.\n";
    }

    // over character limit
    if (recipeName.length > 100) {
        errorMessage += "Recipe name cannot exceed 100 characters.\n";
    }

    if (recipeDescription.length > 500) {
        errorMessage += "Recipe description cannot exceed 500 characters.\n";
    }

    if (recipeInstructions.length > 2000) {
        errorMessage += "Recipe instructions cannot exceed 2000 characters.\n";
    }

    if (!validPrepTimes.includes(prepTime)) {
        errorMessage += "Preparation time must be one of the predefined options.\n";
    }

    if (ingredientEntry.length > 100) {
        errorMessage += "Ingredient entry cannot exceed 100 characters.\n";
    }
    
    if (errorMessage) {
        alert(errorMessage);
        return
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
        name: recipeName.trim(),
        description: recipeDescription.trim(),
        instructions: recipeInstructions.trim(),
        est_time_min: parseInt(recipeTime, 10),
        ingredients: ingredients.join(', '),
        difficulty: difficulty
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

