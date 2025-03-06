const request = require("supertest");
const app = require("../api"); // Assure-toi que l'export de ton app fonctionne

describe("Test API Node.js", () => {
  it("Doit retourner 200 pour la route principale", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
