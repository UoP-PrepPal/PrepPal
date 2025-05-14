const searchBtn = document.querySelector('#search-btn');
const searchUsername = document.querySelector('#search-username');
const userRecipesList = document.querySelector('#user-recipes-list');

searchBtn.addEventListener('click', () => {
  const username = searchUsername.value.trim();
  
  if (username) {
    fetch(`/recipes/username/${username}`)
      .then(response => response.json())
      .then(data => {
        userRecipesList.innerHTML = '';
        if (data.error) {
          userRecipesList.innerHTML = `<p>${data.error}</p>`;
        } else if (data.recipes.length === 0) {
          userRecipesList.innerHTML = '<p>No recipes found for this user.</p>';
        } else {
          data.recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
              <h3>${recipe.name}</h3>
              <p>${recipe.description}</p>
              <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
              <p><strong>Instructions:</strong> ${recipe.instructions}</p>
              <p><strong>Time:</strong> ${recipe.est_time_min} minutes</p>
              <p><strong>Difficulty:</strong> ${recipe.difficulty || 'Not specified'}</p>
            `;
            userRecipesList.appendChild(recipeCard);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching recipes:', error);
        userRecipesList.innerHTML = '<p>Error loading recipes.</p>';
      });
  } else {
    userRecipesList.innerHTML = '<p>Please enter a username to search.</p>';
  }
});
