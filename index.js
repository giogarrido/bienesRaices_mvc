import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import db from "./config/db.js";


// Create express instnace
const app = express();

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

//habilitar cookie parser
app.use(cookieParser());

//habilitar csrf
app.use(csrf({cookie: true}));


// Connect to database
try {
    await db.authenticate();
    db.sync();
    console.log('Connection DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
}


//Routing

app.use("/auth", usuarioRoutes);
app.use("/", propiedadesRoutes);

// Set pug as template engine
app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files
app.use(express.static('public'));

// Define port
const port = process.env.PORT || 3000;

// Run server
app.listen(port, () => console.log(`Server running on port ${port}!`)

);
 
