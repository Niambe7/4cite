const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth.js");
const house = require("./routes/house.js");
const reservations = require("./routes/reservations.js");

require("dotenv").config();
console.log("🛠️ NODE_ENV =", process.env.NODE_ENV || "❌ Non défini");

console.log("🚀 Début de l'exécution de api.js");

// Vérifier si les variables d'environnement sont bien chargées
console.log("🔑 DB_USER:", process.env.DB_USER ? "✅ Chargé" : "❌ Manquant");
console.log("🔑 DB_PASSWORD:", process.env.DB_PASSWORD ? "✅ Chargé" : "❌ Manquant");
console.log("🌍 Port défini :", process.env.PORT || "5001 (défaut)");

// Initialisation Express
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Déclaration globale du serveur
let server;

// Routes
console.log("📌 Ajout des routes...");
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations);
console.log("✅ Routes ajoutées !");

// Route de test
app.get("/", (req, res) => {
    res.send(`Hello Express ! Le serveur fonctionne sur le port ${process.env.PORT || 5001}`);
    console.log("✅ Route GET '/' appelée avec succès !");
});

// Fonction pour se connecter à MongoDB et démarrer le serveur
async function main() {
    console.log("⏳ Tentative de connexion à MongoDB...");

    try {
        console.log("📌 Début de la connexion à MongoDB...");
        const MONGO_URI = process.env.NODE_ENV === "test" ? process.env.MONGO_TEST_URI : 
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tkzvadc.mongodb.net/motel-develpoment-db`;
    
        console.log("🔍 Connexion MongoDB à :", MONGO_URI);
        
        await mongoose.connect(MONGO_URI);
        
        if (process.env.NODE_ENV !== "test") {
            const PORT = process.env.PORT || 5001;
            console.log(`⏳ Tentative de démarrage du serveur sur le port ${PORT}...`);

            try {
                server = app.listen(PORT, () => {
                    console.log(`✅ Serveur en écoute sur le port ${PORT}`);
                });
                console.log("📌 `server.listen()` a été exécuté !");
            } catch (serverError) {
                console.error("❌ Erreur lors du démarrage du serveur :", serverError);
                process.exit(1);
            }

            setTimeout(() => {
                if (!server || !server.listening) {
                    console.error("❌ Le serveur n'est pas en écoute après 5 secondes !");
                    process.exit(1);
                } else {
                    console.log("✅ Vérification : le serveur tourne bien !");
                }
            }, 5000);
        }
    } catch (err) {
        console.error("❌ Erreur de connexion à MongoDB :", err);
        process.exit(1);
    }
}

// Gestion des signaux pour fermer MongoDB proprement
process.on("SIGINT", async () => {
    console.log("🛑 Arrêt du serveur...");
    if (server) {
        server.close(() => {
            console.log("✅ Serveur arrêté avec succès.");
        });
    }
    await mongoose.connection.close();
    console.log("✅ Connexion MongoDB fermée.");
    process.exit(0);
});

// Exécuter `main()` et détecter les erreurs
main()
    .then(() => console.log("✅ main() exécutée avec succès"))
    .catch(err => {
        console.error("❌ Erreur dans main():", err);
        process.exit(1);
    });

module.exports = { app, server };
