import request from "supertest";
import app from "./svr.js";

/*
npm installs I used:
  npm install --save-dev jest @jest-environment-jsdom
  npm install --save-dev jest babel-jest @babel/preset-env
  npm install --save-dev supertest
*/ 

describe("Entering Details", () => {  // Test suite for entering user details for sign up / sign in
  test("signup should return error status 400 for missing fields", async () => {
    const res = await request(app)
      .post("/signup")
      .send({ username: "testuser" }); // Test data with missing fields for sign up
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("signin should return success status 200 for valid credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "testing", email: "testing@testing.com" }); // Test data attempting to sign in with an existing account
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User signed in successfully");
  });

  test("signIn should return error status 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "invalid", email: "invalid@invalid.com" }); // Test data attempting to sign in with a non-existent account
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
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

    const res = await agent.post("/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });
});


describe("Dashboard Access", () => {  // Test suite for accessing the dashboard page
  test("dashboard should return error status 401 if user is not logged in", async () => {
    const res = await request(app).get("/dashboard");  // Attempting to access the dashboard without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("You must be logged in to view the dashboard");
  });

  test("dashboard should return success status 200 if user is logged in", async () => {
    const agent = request.agent(app); 

    // Simulating a user sign in
    await agent.post("/signIn").send({
      username: "testing",
      email: "testing@testing.com",
    });

    const res = await agent.get("/dashboard");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
  });
});


describe("Adding Recipes", () => {  // Test suite for adding recipes
  test("addRecipe should return error status 401 when attempting to add a recipe while not logged in", async () => {
    const res = await request(app).get("/addrecipes");  // Attempting to access the add recipes page without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("You must be logged in to add recipes");
  });
});


describe("Viewing Recipes", () => {  // Test suite for viewing recipes
  test("recipes should return error status 401 when attempting to view recipes while not logged in", async () => {
    const res = await request(app).get("/recipes");  // Attempting to access the recipes page without first logging in
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("You must be logged in to view recipes");
  });
});
