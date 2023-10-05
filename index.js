import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";

// Create express instnace
const app = express();

//Routing

app.use("/", usuarioRoutes);


// Define port
const port = 3000;

// Run server
app.listen(port, () => console.log(`Server running on port ${port}!`)

);
 
