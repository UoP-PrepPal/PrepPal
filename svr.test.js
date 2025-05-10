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
  test("signup should return error status 400 for attempting to sign up with missing fields", async () => {
    const res = await request(app)
      .post("/signup")
      .send({ username: "testuser" }); // Test data with missing fields for sign up
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

  test("signIn should return error status 401 for attempting to sign in with invalid credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "invalid", email: "invalid@invalid.com" }); // Test data attempting to sign in with a non-existent account
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  test("signIn should return error status 401 for attempting to sign in with missing credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "", email: "" }); // Test data attempting to sign in with missing credenttials
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

describe("Viewing Recipes", () => {  // Test suite for viewing recipes
  test("recipes should return status 200 when viewing recipes while logged in", async () => {
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
  test("recipes should return success status 200 when adding a recipe while logged in and entering correct info", async () => {
    const agent = request.agent(app);

    // Simulating a user sign-in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    // Valid recipe data to be added
    const recipeData = {
      user_id: 5,
      name: "Test Recipe",
      description: "A simple test recipe",
      instructions: "Mix ingredients and cook.",
      est_time_min: 30,
      ingredients: "Eggs, Flour, Sugar",
    };

    // Adding the recipe
    const res = await agent.post("/recipes").send(recipeData);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Recipe added successfully");
    expect(res.body).toHaveProperty("id"); // Ensure the response contains the recipe ID

    // Cleanup: Delete the added recipe
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
});

describe("Viewing others' Recipes", () => {
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

  test("/recipes/username/:username should success status 200 when trying to view the recipe of an existing user", async () => {
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

