import request from "supertest";
import app from "./svr.js";
import e from "express";
/*
npm installs I used:
  npm install --save-dev jest @jest-environment-jsdom
  npm install --save-dev jest babel-jest @babel/preset-env
  npm install --save-dev supertest
*/ 

describe("Signing Up", () => {  // Test suite for entering user details for sign up
  test("signup should return success status 201 for successfully creating a new account", async () => {
    const agent = request.agent(app);

    // Valid user data for signing up
    const userData = {
      username: "signup_3",
      email: "signup3@signup.com",
      first_name: "Sign",
      last_name: "Up",
    };

    // Creating the new account
    const signupRes = await agent.post("/signup").send(userData);
    expect(signupRes.statusCode).toBe(201);
    expect(signupRes.body.message).toBe("User added successfully");
    expect(signupRes.body).toHaveProperty("id");

    // Attempting to sign in with the new account
    const signInRes = await agent.post("/signIn").send({
      username: userData.username,
      email: userData.email,
    });
    expect(signInRes.statusCode).toBe(200);

    // Deleting the account
    const deleteRes = await agent.delete("/account");
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Account and all recipes deleted successfully");
  });

  test("signup should return error status 409 for attempting to sign up with an existing account", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account with an existing username
      .send({
        username: "testing",
        email: "new@testing.com",
        first_name: "Ing",
        last_name: "Test",
      });
    
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Account already exists");
    });

  test("signup should return error status 409 for attempting to sign up with an existing email", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account with an existing email
      .send({
        username: "new_testing",
        email: "testing@testing.com",
        first_name: "Ing",
        last_name: "Test",
      });
    
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Account already exists");
  });

  test("signup should return error status 400 for attempting to sign up without a username", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account without a username
      .send({ 
        email: "testing@testing.com",
        first_name: "Test",
        last_name: "Ing",
      }); 
    
      expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("signup should return error status 400 for attempting to sign up without an email", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account without an email
      .send({ 
        username: "testing",
        first_name: "Test",
        last_name: "Ing",
      }); 
    
      expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("signup should return error status 400 for attempting to sign up without a first name", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account without a first name
      .send({ 
        username: "testing",
        email: "testing@testing.com",
        last_name: "Ing",
      }); 
    
      expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("signup should return error status 400 for attempting to sign up without a last name", async () => {
    const res = await request(app)
      .post("/signup")
      
      // Test data attempting to create an account without a last name
      .send({ 
        username: "testing",
        email: "testing@testing.com",
        first_name: "Test",
      }); 
    
      expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });
});


describe("Signing In", () => {  // Test suite for signing in 
  test("signin should return success status 200 for signing in with valid credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "testing", email: "testing@testing.com" }); // Test data attempting to sign in with an existing account
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User signed in successfully");
  });

  test("signIn should return error status 401 for attempting to sign in with invalid username", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "invalid", email: "testing@testing.com" }); // Test data attempting to sign in with an invalid username
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  test("signIn should return error status 401 for attempting to sign in with invalid email", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "testing", email: "invalid@invalid.com" }); // Test data attempting to sign in with an invalid email
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  // Test cases for missing username and email - these are to make the tests more closely match the test plan
  test("signIn should return error status 401 for attempting to sign in with missing username", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "", email: "testing@testing.com" }); // Test data attempting to sign in with missing username
    expect(res.statusCode).toBe(401); 
    expect(res.body.error).toBe("Invalid credentials");
  });

  test("signIn should return error status 401 for attempting to sign in with missing email", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "testing", email: "" }); // Test data attempting to sign in with missing email
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
});

describe("Dashboard Access", () => {  // Test suite for accessing the dashboard page
  test("dashboard should return success status 200 if accessing dashboard while user is logged in", async () => {
    const agent = request.agent(app); 

    // Simulating a user sign in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    const res = await agent.get("/dashboard");  // Attempting to access the dashboard while logged in
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
  });
  
  test("dashboard should return error status 401 if attempting to access dashboard while user is not logged in", async () => {
    const res = await request(app).get("/dashboard");  // Attempting to access the dashboard without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("You must be logged in to view the dashboard");
  });
});

describe("Viewing Recipes", () => {  // Test suite for viewing recipes
  test("recipes should return success status 200 when viewing recipes while logged in", async () => {
    const agent = request.agent(app);

    await agent.post("/signIn").send({
        username: "testing",
        email: "testing@testing.com",
      });

    const res = await agent.get("/recipes");

    expect(res.statusCode).toBe(200);
  });
  
  test("recipes should return error status 401 when attempting to view recipes while not logged in", async () => {
    const res = await request(app).get("/recipes");  // Attempting to access the recipes page without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("You must be logged in to view recipes");
  }); 
});


describe("Adding Recipes", () => {
  test("recipes should return success status 201 when adding a recipe while logged in and entering correct info", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Valid recipe data to be added
    const recipeData = {
      user_id: 5,
      name: "Recipe to Add",
      description: "A simple test recipe",
      instructions: "Mix ingredients and cook.",
      est_time_min: 30,
      ingredients: "Tests, Experiments",
      difficulty: "Easy",
    };

    // Adding the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Recipe added successfully");
    expect(res.body).toHaveProperty("id"); // Ensure the response contains the recipe ID

    // Deleting the added recipe
    const recipeId = res.body.id;
    const deleteRes = await agent.delete(`/recipes/${recipeId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Recipe deleted successfully");
  });
  
  test("recipes should return error status 404 when attempting to add a recipe while not logged in", async () => {
    const recipeData = {
      name: "Test Recipe",
      ingredients: ["Eggs", "Flour"],
      instructions: "Mix and bake."
    };

    const res = await request(app)
      .post("/recipe")
      .send(recipeData);

    expect(res.statusCode).toBe(404);
  });

  test("recipes should return error status 400 when adding a recipe with an invalid difficulty", async () => {
    const agent = request.agent(app);

    // Simulating user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Attempting to add a recipe with an invalid difficulty
    const recipeData = {
      user_id: 5,
      name: "Impossible to Make Recipe",
      description: "You physically cannot make this.",
      instructions: "Just try it.",
      est_time_min: 30,
      ingredients: "Futility",
      difficulty: "Impossible", // Not in ['Easy', 'Medium', 'Hard']
    };

    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value for difficulty");
  });

  test("recipes should return error status 400 when adding a recipe with an invalid estimated time", async () => {
    const agent = request.agent(app);

    // Simulating user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Attempting to create recipe with invalid est_time_min
    const recipeData = {
      user_id: 5,
      name: "Recipe with Invalid Time",
      description: "You can approach, but never reach the end of this recipe.",
      instructions: "Just keep going.",
      est_time_min: 999, // Not in allowedPrepTimes
      ingredients: "Time, Space",
      difficulty: "Easy",
    };

    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value for estimated time");
  });

  test("recipes should return error status 400 when attempting to add a recipe with a missing name", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data with a missing name
    const recipeData = {
      user_id: 5,
      description: "A recipe without a name",
      instructions: "Ride into town on your horse with no name.",
      est_time_min: 20,
      ingredients: "Westerns, Cowboys",
      difficulty: "Medium",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("recipes should return error status 400 when attempting to add a recipe with a missing description", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data with a missing description
    const recipeData = {
      user_id: 5,
      name: "Recipe without a Description",
      instructions: "Figure out some more details about this recipe.",
      est_time_min: 20,
      ingredients: "Vague, Unclear",
      difficulty: "Hard",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("recipes should return error status 400 when attempting to add a recipe without instructions", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data without instructions
    const recipeData = {
      user_id: 5,
      name: "Recipe without Instructions",
      description: "A recipe where you.. cook?",
      est_time_min: 20,
      ingredients: "Mystery, Secrets",
      difficulty: "Hard",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("recipes should return error status 400 when attempting to add a recipe without an estimated time", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data without an estimated time
    const recipeData = {
      user_id: 5,
      name: "Recipe without an estimated time",
      description: "A recipe where you cook.",
      instructions: "Put it in the oven for...?",
      ingredients: "The concept of time",
      difficulty: "Medium",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("recipes should return error status 400 when attempting to add a recipe without any ingredients", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data without ingredients
    const recipeData = {
      user_id: 5,
      name: "Recipe without Ingredients",
      description: "A recipe where you cook.",
      instructions: "Put the ____ in the bowl with the ____, and stir.",
      est_time_min: 20,
      difficulty: "Easy",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("recipes should return error status 400 when attempting to add a recipe without a listed difficulty", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Invalid recipe data without a listed difficulty
    const recipeData = {
      user_id: 5,
      name: "Recipe without a difficulty",
      description: "A recipe where you cook really hard.",
      instructions: "Go easy with it.",
      est_time_min: 20,
      ingredients: "Blood, Sweat, Tears",
    };

    // Attempting to add the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });
});

describe("Editing Recipes", () => {
  test("recipes should return success status 200 and edit a recipe when logged in and the recipe belongs to the user", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Adding a recipe to edit later
    const recipeData = {
      user_id: 5,
      name: "Recipe to Edit",
      description: "This recipe will be edited",
      instructions: "Edit.",
      est_time_min: 20,
      ingredients: "Prior ingredients",
      difficulty: "Easy",
    };

    const addRes = await agent.post("/recipes").send(recipeData);

    // Ensuring the recipe was added successfully
    expect(addRes.statusCode).toBe(201);
    expect(addRes.body.message).toBe("Recipe added successfully");
    expect(addRes.body).toHaveProperty("id");

    // Retrieving the recipe ID
    const recipeId = addRes.body.id;

    // Updating recipe data
    const updatedRecipeData = {
      name: "Edited Recipe",
      description: "This recipe has been edited",
      instructions: "Validate the edits.",
      est_time_min: 30,
      ingredients: "New ingredients",
      difficulty: "Medium",
    };

    // Editing the recipe
    const editRes = await agent.put(`/recipes/${recipeId}`).send(updatedRecipeData);

    expect(editRes.statusCode).toBe(200);
    expect(editRes.body.message).toBe("Recipe updated successfully");

    // Verifying the changes
    const fetchRes = await agent.get("/recipes");
    const updatedRecipe = fetchRes.body.recipes.find((recipe) => recipe.recipe_id === recipeId);

    expect(updatedRecipe).toBeDefined();
    expect(updatedRecipe.name).toBe(updatedRecipeData.name);
    expect(updatedRecipe.description).toBe(updatedRecipeData.description);
    expect(updatedRecipe.instructions).toBe(updatedRecipeData.instructions);
    expect(updatedRecipe.est_time_min).toBe(updatedRecipeData.est_time_min);
    expect(updatedRecipe.ingredients).toBe(updatedRecipeData.ingredients);

    // Deleting the edited recipe
    const deleteRes = await agent.delete(`/recipes/${recipeId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Recipe deleted successfully");
  });

  test("recipes should return error status 401 when attempting to edit a recipe while not logged in", async () => {
    // Attempting to edit a recipe without logging in
    const recipeId = 84; 
    const updatedRecipeData = {
      name: "Unauthorized Edit",
      description: "This edit should fail",
      instructions: "No instructions",
      est_time_min: 15,
      ingredients: "None",
      difficulty: "Hard",
    };

    const res = await request(app).put(`/recipes/${recipeId}`).send(updatedRecipeData);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("recipes should return error status 404 when attempting to edit a non-existent recipe", async () => {
    const agent = request.agent(app);

    // Simulating user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Attempting to edit a recipe that does not exist
    const nonExistentRecipeId = 9999;
    const updatedRecipeData = {
      name: "Recipe that does not Exist",
      description: "This recipe does not exist",
      instructions: "No instructions",
      est_time_min: 10,
      ingredients: "None",
      difficulty: "Easy",
    };

    const res = await agent.put(`/recipes/${nonExistentRecipeId}`).send(updatedRecipeData);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Recipe not found or unauthorized");
  });

  test("recipes should return error status 400 when editing a recipe to have an invalid difficulty", async () => {
    const agent = request.agent(app);

    // Simulating user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Adding a valid recipe to be edited
    const recipeData = {
      user_id: 5,
      name: "Scaling Recipe",
      description: "This recipe's about to get a hell of a lot harder.",
      instructions: "Just try it.",
      est_time_min: 30,
      ingredients: "Nerves, Anxiety",
      difficulty: "Easy",
    };
    const addRes = await agent.post("/recipes").send(recipeData);
    const recipeId = addRes.body.id;

    // Attempting to edit with invalid difficulty
    const updatedRecipeData = {
      name: "Scaling Recipe",
      description: "This recipe's about to get a hell of a lot harder.",
      instructions: "Just try it.",
      est_time_min: 30,
      ingredients: "Nerves, Anxiety",
      difficulty: "Impossible", // Not in ['Easy', 'Medium', 'Hard']
    };
    const res = await agent.put(`/recipes/${recipeId}`).send(updatedRecipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value for difficulty");

    // Cleanup
    await agent.delete(`/recipes/${recipeId}`);
  });

    test("recipes should return error status 400 when editing a recipe to have an invalid estimated time", async () => {
    const agent = request.agent(app);

    // Simulate user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Add a valid recipe first
    const recipeData = {
      user_id: 5,
      name: "Extending Recipe",
      description: "This little manauver is going to cost us 51 years.",
      instructions: "Just keep going",
      est_time_min: 30,
      ingredients: "The Sands of Time",
      difficulty: "Easy",
    };
    const addRes = await agent.post("/recipes").send(recipeData);
    const recipeId = addRes.body.id;

    // Attempt to edit with invalid est_time_min
    const updatedRecipeData = {
      name: "Extending Recipe",
      description: "This little manauver is going to cost us 51 years.",
      instructions: "Just keep going",
      est_time_min: 999, // Not in allowedPrepTimes
      ingredients: "The Sands of Time",
      difficulty: "Easy",
    };
    const res = await agent.put(`/recipes/${recipeId}`).send(updatedRecipeData);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value for estimated time");

    // Cleanup
    await agent.delete(`/recipes/${recipeId}`);
    });
});

describe("Deleting Recipes", () => {
  test("recipes should return success status 200 and delete a recipe when logged in and the recipe belongs to the user", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Adding a recipe to delete later
    const recipeData = {
      user_id: 5, 
      name: "Recipe to Delete",
      description: "A test recipe that should not be here.",
      instructions: "Delete.",
      est_time_min: 15,
      ingredients: "Nothing",
      difficulty: "Easy",
    };

    const addRes = await agent.post("/recipes").send(recipeData);

    // Ensuring the recipe was added successfully
    expect(addRes.statusCode).toBe(201);
    expect(addRes.body.message).toBe("Recipe added successfully");
    expect(addRes.body).toHaveProperty("id");

    // Retrieving the recipe ID
    const recipeId = addRes.body.id;

    // Deleting the recipe
    const deleteRes = await agent.delete(`/recipes/${recipeId}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Recipe deleted successfully");
  });

  test("recipes should return error status 404 when attempting to delete a recipe that does not exist", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Setting the ID of the recipe to be deleted to a recipe that does not exist
    const nonExistentRecipeId = 9999;

    const res = await agent.delete(`/recipes/${nonExistentRecipeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Recipe not found or unauthorized");
  });

  test("recipes should return error status 401 when attempting to delete a recipe with a user that does not exist", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "non-existent-user",
      email: "non-existent@testing.com",
    });

    const recipeID = 1;

    const res = await agent.delete(`/recipes/${recipeID}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("recipes should return error status 401 when attempting to delete a recipe while not logged in", async () => {
    const res = await request(app).delete("/recipes/1");  // Attempting to delete a recipe without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });
});

describe("Viewing others' Recipes", () => {
    test("/recipes/username/:username should return success status 200 when trying to view the recipe of an existing user", async () => {
  const agent = request.agent(app);

  await agent.post("/signIn").send({
      username: "alighezal",
      email: "alighezal773@gmail.com",
    });
  
  const usernameInput = {
    username: "alighezal"
  };

  const res = await agent
    .get(`/recipes/username/${usernameInput.username}`);


  expect(res.statusCode).toBe(200);
  });
  
  test("/recipes/username/:username should return error code 404 when trying to view the recipe of a non-existent user", async () => {
  const agent = request.agent(app);

  await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });
  
  const usernameInput = {
    username: "sadkjbv"
  };

  const res = await agent
    .get(`/recipes/username/${usernameInput.username}`);

  expect(res.statusCode).toBe(404);
  });

  test("/recipes/username/:username should return error code 401 when trying to view others recipes while not logged in", async () => {
  const agent = request.agent(app);
  
  const usernameInput = {
    username: "alighezal"
  };

  const res = await agent
    .get(`/recipes/username/${usernameInput.username}`);


  expect(res.statusCode).toBe(401);
  });
})


describe("Logging Out", () => {
  test("logout should return should return success status 200 and log out if user is logged in", async () => {
    const agent = request.agent(app);

    // Simulating a user sign in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    const res = await agent.post("/logout");  // Attempting to log out while logged in
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  test("logout should return error status 500 if user attempts to log out while not logged in", async () => {
    const res = await request(app).post("/logout");  // Attempting to log out while not logged in
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to log out");
  });
});

