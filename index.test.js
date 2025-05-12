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
});
