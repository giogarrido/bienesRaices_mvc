import express from "express";
import {
  inicio,
  categoria,
  noEncontrado,
  buscador,
} from "../controllers/appController.js";

const router = express.Router();

//PAGINA DE INICIO
router.get("/", inicio);

//CATEGORÍAS
router.get("/categoria/:id", categoria);


//PAGINA 404
router.get("/404", noEncontrado);

//BUSCADOR DE PROPIEDADES
router.post("/buscador", buscador);

export default router;
