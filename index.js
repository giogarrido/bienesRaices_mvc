import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from "./config/db.js";

// Create express instnace
const app = express();

// Connect to database
try {
    await db.authenticate();
    console.log('Connection DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
}


//Routing

app.use("/auth", usuarioRoutes);

// Set pug as template engine
app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files
app.use(express.static('public'));

// Define port
const port = 3000;

// Run server
app.listen(port, () => console.log(`Server running on port ${port}!`)

);
 
