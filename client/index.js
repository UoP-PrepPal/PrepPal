const saveBtn = document.querySelector('#save-button');
const ingredientInput = document.querySelector('#ingredient');
const addIngredientBtn = document.querySelector('#add-ingredient');
const ingredientList = document.querySelector('#ingredient-list'); // Reference to the ingredient list (ul)




function addIngredient() {
    console.log("Hello");
    const ingredientValue = ingredientInput.value.trim(); // Get the ingredient value
    if (ingredientValue) {
        const newIngredient = document.createElement('li');
        newIngredient.textContent = ingredientValue;

        ingredientList.appendChild(newIngredient);

        ingredientInput.value = '';
    }
}

addIngredientBtn.addEventListener('click', addIngredient);
