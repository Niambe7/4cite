const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../api");
require('dotenv').config();

let server;
let accessToken = ""; // Stocke le token pour les tests

// Données de test
const testUser = {
    name: { firstName: "John", lastName: "Doe" },
    emailId: "johndoe@example.com",
    birthDate: "1990-01-01",
    password: "password123"
};

// Il faut changer les information de la reservation apres chaque test de reservation
const testReservation = {
    listingId: "66016a81a046e25504beaae3",
    authorId: "", // Sera défini après la création de l'utilisateur
    guestNumber: 2,
    checkIn: "2025-04-10",
    checkOut: "2025-04-15",
    nightStaying: 5,
    orderId: 1875521123
};

beforeAll(async () => {
    console.log("⏳ Connexion à MongoDB pour les tests de réservation...");

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_TEST_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    console.log(" Connexion MongoDB réussie !");

    const db = mongoose.connection.getClient().db();
    console.log("🔍 Nom de la base de données :", db.databaseName);

    if (!db) {
        console.error("❌ MongoDB ne renvoie pas de base de données !");
        process.exit(1);
    }

    console.log(" Suppression des anciennes données de test...");
    try {
        await db.collection("users").deleteMany({});
        await db.collection("reservations").deleteMany({});
        console.log(" Suppression effectuée !");
    } catch (error) {
        console.error("❌ Erreur lors de la suppression des données :", error);
        process.exit(1);
    }

    server = app.listen(5001, () => {
        console.log(" Test Server is running on port 5001");
    });
});

afterAll(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log("🛑 Test Server stopped");
    }
    await mongoose.connection.close();
    console.log(" Connexion MongoDB fermée.");
});

describe("🏨 Test des réservations d'hôtels", () => {

    it(" Doit créer un nouvel utilisateur", async () => {
        const res = await request(server).post("/auth/sign_up").send(testUser);
        console.log("📌 Réponse de l'inscription :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(1);
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
        testReservation.authorId = res.body.userId; // Stocke l'ID de l'utilisateur
    });

    it("Doit connecter l'utilisateur", async () => {
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

    it("Doit récupérer la clé Stripe publishable", async () => {
        const res = await request(server).get("/reservations/config");
        console.log("📌 Clé Stripe :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.publishableKey).toBeDefined();
    });

    it(" Doit créer un paiement avec Stripe", async () => {
        const res = await request(server)
            .post("/reservations/create_payment_intent")
            .send({});
        console.log("📌 Paiement Stripe :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.clientSecret).toBeDefined();
    });

    // it(" Doit effectuer une réservation", async () => {
    //     const res = await request(server)
    //         .post("/reservations/booking")
    //         .set("Authorization", `Bearer ${accessToken}`)
    //         .send(testReservation);
    //     console.log("📌 Réponse de la réservation :", res.text);
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.text).toBe("Payment confirmed.");
    // });

    it(" Doit récupérer les réservations d'un listing", async () => {
        const res = await request(server)
            .post("/reservations/get_reservations")
            .send({ id: testReservation.listingId });
        console.log("📌 Réservations du listing :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it(" Doit récupérer les réservations de l'auteur", async () => {
        const res = await request(server)
            .get("/reservations/get_author_reservations")
            .set("Authorization", `Bearer ${accessToken}`);
        console.log("📌 Réservations de l'auteur :", res.body);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});
