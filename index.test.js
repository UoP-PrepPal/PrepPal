/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';


describe('addIngredient()', () => {
  let ingredientInput, ingredientList, addIngredientBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="ingredient" />
      <div id="ingredient-list"></div>
      <button id="add-ingredient">Add</button>
    `;

    ingredientInput = document.querySelector('#ingredient');
    ingredientList = document.querySelector('#ingredient-list');
    addIngredientBtn = document.querySelector('#add-ingredient');

    global.addIngredient = function () {
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
      } else {
        console.log("Cannot add empty ingredient value");
      }
    };
  });

  it('adds a new ingredient to the list', () => {
    ingredientInput.value = 'Tomatoes';

    addIngredient();

    const items = document.querySelectorAll('.ingredient-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('p').textContent).toBe('Tomatoes');
  });

  it('does not add empty ingredient', () => {
    ingredientInput.value = '   ';

    console.log = jest.fn(); // mock console.log
    addIngredient();

    const items = document.querySelectorAll('.ingredient-item');
    expect(items.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith("Cannot add empty ingredient value");
  });

  it('removes an ingredient when delete button is clicked', () => {
    ingredientInput.value = 'Onions';
    addIngredient();

    let items = document.querySelectorAll('.ingredient-item');
    expect(items.length).toBe(1);

    const deleteBtn = items[0].querySelector('button');
    deleteBtn.click();

    items = document.querySelectorAll('.ingredient-item');
    expect(items.length).toBe(0);
  });
});

describe('saveRecipe()', () => {
    let recipeNameInput, recipeDescriptionInput, recipeInstructionsInput, prepTimeInput, ingredientInput, ingredientList;

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="recipe-name" />
            <textarea id="recipe-description"></textarea>
            <textarea id="recipe-instructions"></textarea>
            <input id="prep-time" />
            <input id="ingredient" />
            <div id="ingredient-list"></div>
        `;

        recipeNameInput = document.querySelector('#recipe-name');
        recipeDescriptionInput = document.querySelector('#recipe-description');
        recipeInstructionsInput = document.querySelector('#recipe-instructions');
        prepTimeInput = document.querySelector('#prep-time');
        ingredientInput = document.querySelector('#ingredient');
        ingredientList = document.querySelector('#ingredient-list');

        global.alert = jest.fn(); // Mock alert
        global.sessionStorage = {
            getItem: jest.fn(() => '123'), // Mock user ID
        };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ message: 'Recipe saved successfully' }),
            })
        );
        global.saveRecipe = function () {
          const recipeName = document.querySelector('#recipe-name').value;
          const recipeDescription = document.querySelector('#recipe-description').value;
          const recipeInstructions = document.querySelector('#recipe-instructions').value;
          const prepTime = document.querySelector('#prep-time').value;
      
          const validPrepTimes = ["0", "5", "10", "15", "20", "30", "45", "60", "90", "120"];
          let errorMessage = "";
      
          // Validate fields
          if (!recipeName) {
              errorMessage += "Recipe name cannot be empty.\n";
          }
          if (!recipeDescription) {
              errorMessage += "Recipe description cannot be empty.\n";
          }
          if (!recipeInstructions) {
              errorMessage += "Recipe instructions cannot be empty.\n";
          }
          if (!prepTime || !validPrepTimes.includes(prepTime)) {
              errorMessage += "Invalid preparation time.\n";
          }
      
          if (errorMessage) {
              alert(errorMessage);
              return;
          }
      
          const userId = sessionStorage.getItem('userId');
          const ingredients = Array.from(document.querySelectorAll('#ingredient-list p')).map(
              (ingredient) => ingredient.textContent
          );
      
          const recipeData = {
              sample: {
                  user_id: userId,
                  name: recipeName,
                  description: recipeDescription,
                  instructions: recipeInstructions,
                  est_time_min: parseInt(prepTime, 10),
                  ingredients: ingredients.join(', '),
              },
              inverse: false,
          };
      
          fetch('/recipes', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(recipeData),
          })
              .then((response) => response.json())
              .then((data) => {
                  alert(data.message);
              })
              .catch((error) => {
                  alert('Failed to save recipe.');
              });
      };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows an alert if required fields are empty', () => {
        saveRecipe();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Recipe name cannot be empty.'));
    });

    it('shows an alert if preparation time is invalid', () => {
        recipeNameInput.value = 'Test Recipe';
        recipeDescriptionInput.value = 'Test Description';
        recipeInstructionsInput.value = 'Test Instructions';
        prepTimeInput.value = '3'; // Invalid prep time
        ingredientInput.value = 'Tomato';

        saveRecipe();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Invalid preparation time.\n'));
    });
});
