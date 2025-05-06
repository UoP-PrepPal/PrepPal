import request from "supertest";
import app from "./svr.js";

// Template for a unit test
// describe('Application functionality', () => {
//  test('should return true for valid input', () => {
//    expect(true).toBe(true);
//  });
// });

describe("Entering Details", () => {
  test("signup should return error status 400 for missing fields", async () => {
    const res = await request(app)
      .post("/signup")
      .send({ username: "testuser" }); // Test data with missing fields for sign up
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("signIn should return error status 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/signIn")
      .send({ username: "invalid", email: "invalid@example.com" }); // Test data attempting to sign in with a non-existent account
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
})
