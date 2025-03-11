const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../api");
require('dotenv').config() 

let server;
let accessToken = ""; // Stocke le token pour les tests

const testUser = {
    name: { firstName: "John", lastName: "Doe" },
    emailId: "johndoe@example.com",
    birthDate: "1990-01-01",
    password: "password123"
};

beforeAll(async () => {
    console.log("⏳ Tentative de connexion à MongoDB pour les tests...");

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_TEST_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    console.log("✅ Connexion MongoDB réussie !");

    // Récupération de la base de données avec getClient()
    const db = mongoose.connection.getClient().db();
    console.log("🔍 Nom de la base de données :", db.databaseName);

    if (!db) {
        console.error("❌ MongoDB ne renvoie pas de base de données !");
        process.exit(1);
    }

    console.log("🗑️ Suppression des anciennes données de test...");
    try {
        await db.collection("users").deleteMany({});
        console.log("✅ Suppression effectuée !");
    } catch (error) {
        console.error("❌ Erreur lors de la suppression des données :", error);
        process.exit(1);
    }

    server = app.listen(5001, () => {
        console.log("✅ Test Server is running on port 5001");
    });
});




afterAll(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log("🛑 Test Server stopped");
    }
    await mongoose.connection.close();
    console.log("✅ Connexion MongoDB fermée.");
});

describe("🌍 Test API Node.js", () => {

    it("✅ Doit retourner 200 pour la route principale", async () => {
        const res = await request(server).get("/");
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain("Hello Express");
    });

    it("✅ Doit créer un nouvel utilisateur", async () => {
        const res = await request(server).post("/auth/sign_up").send(testUser);
        console.log("📌 Réponse de l'inscription :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(1);
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
    }, 15000); // Timeout augmenté pour la création d'utilisateur

    it("✅ Doit connecter l'utilisateur", async () => {
        const res = await request(server).post("/auth/log_in").send({
            email: testUser.emailId,
            password: testUser.password
        });
        console.log("📌 Réponse de la connexion :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(1);
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
    });

    it("✅ Doit récupérer les détails de l'utilisateur", async () => {
        const res = await request(server)
            .post("/auth/get_user_details")
            .set("Authorization", `Bearer ${accessToken}`);
        console.log("📌 Réponse des détails utilisateur :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.user_details.emailId).toBe(testUser.emailId);
    });

    it("✅ Doit déconnecter l'utilisateur", async () => {
        const res = await request(server)
            .post("/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);
        console.log("📌 Réponse de la déconnexion :", res.text);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe("User logout");
    });

});
