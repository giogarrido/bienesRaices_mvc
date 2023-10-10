import express from "express";
import {formularioLogin, formularioRegistro, registrar, formularioOlvidePassword, confirmar, resetPassword} from "../controllers/usuarioController.js";

const router = express.Router();

// Routing
router.get("/login", formularioLogin );
router.get("/registro", formularioRegistro);
router.post("/registro", registrar);
router.get("/confirmar/:token",confirmar);
router.get("/olvide-password", formularioOlvidePassword);
router.post("/olvide-password", resetPassword);


// Export the router

export default router;