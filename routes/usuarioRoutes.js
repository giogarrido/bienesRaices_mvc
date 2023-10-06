import express from "express";
import {formularioLogin, formularioRegistro, formularioOlvidePassword} from "../controllers/usuarioController.js";

const router = express.Router();

// Routing
router.get("/login", formularioLogin );
router.get("/registro", formularioRegistro);
router.get("/olvide-password", formularioOlvidePassword);


// Export the router

export default router;