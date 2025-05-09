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

            // Fetch average rating for the recipe
            fetch(`/recipes/${recipe.recipe_id}/average-rating`)
              .then(response => response.json())
              .then(ratingData => {
                const averageRating = ratingData.average_rating || 'No ratings yet';

                recipeCard.innerHTML = `
                  <h3>${recipe.name}</h3>
                  <p>${recipe.description}</p>
                  <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                  <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                  <p><strong>Time:</strong> ${recipe.est_time_min} minutes</p>
                  <p><strong>Average Rating:</strong> ${averageRating} ⭐</p>
                  <label for="rating-${recipe.recipe_id}"><strong>Rate this recipe:</strong></label>
                  <select id="rating-${recipe.recipe_id}" data-id="${recipe.recipe_id}">
                    <option value="">--Select--</option>
                    <option value="1">1 ⭐</option>
                    <option value="2">2 ⭐</option>
                    <option value="3">3 ⭐</option>
                    <option value="4">4 ⭐</option>
                    <option value="5">5 ⭐</option>
                  </select>
                  <button class="rate-btn" data-id="${recipe.recipe_id}">Submit Rating</button>
                  <p class="rating-msg" id="rating-msg-${recipe.recipe_id}"></p>
                `;
                userRecipesList.appendChild(recipeCard);
              })
              .catch(error => {
                console.error('Error fetching average rating:', error);
              });
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

// Handle rating submission
userRecipesList.addEventListener('click', (event) => {
  if (event.target.classList.contains('rate-btn')) {
    const recipeId = event.target.getAttribute('data-id');
    const select = document.querySelector(`#rating-${recipeId}`);
    const rating = parseInt(select.value);
    const messageEl = document.querySelector(`#rating-msg-${recipeId}`);
    const user_id = sessionStorage.getItem('userId');

    if (!user_id) {
      messageEl.textContent = 'You must be logged in to rate recipes.';
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      messageEl.textContent = 'Please select a valid rating (1–5).';
      return;
    }

    fetch(`/recipes/${recipeId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, rating }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          messageEl.textContent = 'Rating submitted successfully!';
        } else {
          messageEl.textContent = 'Failed to submit rating.';
          console.error('Error:', data.error);
        }
      })
      .catch(error => {
        console.error('Error submitting rating:', error);
        messageEl.textContent = 'Error submitting rating.';
      });
  }
});
