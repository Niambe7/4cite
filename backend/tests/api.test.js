const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../api"); // On n'importe PAS `server`, on démarre un serveur pour Jest

let server;

beforeAll((done) => {
    server = app.listen(5001, () => {
        console.log("✅ Test Server is running on port 5001");
        done();
    });
});

afterAll(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve)); // Ferme proprement le serveur
        console.log("🛑 Test Server stopped");
    }
    await mongoose.connection.close(); // Ferme proprement la connexion MongoDB
});
  
describe("Test API Node.js", () => {
    it("Doit retourner 200 pour la route principale", async () => {
        const res = await request(server).get("/");
        expect(res.statusCode).toEqual(200);
    });
});
