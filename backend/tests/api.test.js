const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../api"); // On n'importe que `app`, pas `server`

let server;

beforeAll((done) => {
    server = app.listen(5001, () => {
        console.log("✅ Test Server is running on port 5001");
        done();
    });
});

afterAll(async () => {
    await mongoose.connection.close(); // Ferme MongoDB proprement
    if (server) {
        server.close(() => {
            console.log("🛑 Test Server stopped");
        });
    }
});

describe("Test API Node.js", () => {
    it("Doit retourner 200 pour la route principale", async () => {
        const res = await request(server).get("/");
        expect(res.statusCode).toEqual(200);
    });
});
