const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth.js");
const house = require("./routes/house.js");
const reservations = require("./routes/reservations.js");

require("dotenv").config();

const app = express();

// Parse Data
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations);

let server; // Déclaration globale du serveur

async function main() {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tkzvadc.mongodb.net/motel-develpoment-db`);
        
        if (process.env.NODE_ENV !== "test") {
            server = app.listen(process.env.PORT, () => {
                console.log('✅ MongoDB connecté');
                console.log(`✅ Serveur démarré sur le port ${process.env.PORT}`);
            });
        }
    } catch (err) {
        console.error("❌ Erreur de connexion à MongoDB :", err);
    }
}

app.get("/", (req, res) => {
    res.send(`Hello Express ! Le serveur fonctionne sur le port ${process.env.PORT}`);
});

main();

module.exports = { app, server };
