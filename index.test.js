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
  let ingredientList;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = `
      <input id="recipe-name" value="Pasta" />
      <textarea id="recipe-description">A tasty pasta recipe</textarea>
      <textarea id="recipe-instructions">Boil pasta, add sauce</textarea>
      <input id="prep-time" value="15" />
      <div id="ingredient-list">
        <p>Tomatoes</p>
        <p>Cheese</p>
      </div>
    `;

    // Set up globals
    ingredientList = document.querySelector('#ingredient-list');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Recipe saved successfully' }),
      })
    );

    // Mock sessionStorage
    const mockStorage = (() => {
      let store = { userId: '123' };
      return {
        getItem: key => store[key],
        setItem: (key, value) => store[key] = value,
        clear: () => store = {},
      };
    })();
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
    });

    // Define the saveRecipe function (copy from your source)
    global.saveRecipe = function () {
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
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send recipe data via fetch with correct payload', async () => {
    await saveRecipe();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: '123',
        name: 'Pasta',
        description: 'A tasty pasta recipe',
        instructions: 'Boil pasta, add sauce',
        est_time_min: 15,
        ingredients: 'Tomatoes, Cheese'
      }),
    });
  });

  it('should log an error if required fields are missing', () => {
    document.querySelector('#recipe-name').remove(); // Simulate missing input

    console.error = jest.fn();

    saveRecipe();

    expect(console.error).toHaveBeenCalledWith('One or more required elements are missing.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should log an error if user is not logged in', () => {
    sessionStorage.clear();

    console.log = jest.fn();

    saveRecipe();

    expect(console.log).toHaveBeenCalledWith("User is not logged in");
    expect(fetch).not.toHaveBeenCalled();
  });
});
