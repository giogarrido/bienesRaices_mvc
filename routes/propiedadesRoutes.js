import express from "express";
import { body } from "express-validator";
import { admin, crear, guardar, agregarImagen } from "../controllers/propiedadController.js";
import protegerRuta from "../middleware/protegerRuta.js";

const router = express.Router();

router.get("/mis-propiedades", protegerRuta, admin);
router.get("/propiedades/crear", protegerRuta, crear);
router.post(
  "/propiedades/crear",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El Titulo del anuncio es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacia")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una categoria"),
  body("precio").isNumeric().withMessage("Selecciona un precio"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Selecciona el numero de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Selecciona el numero de estacionamientos"),
  body("wc").isNumeric().withMessage("Selecciona el numero de baños"),
  body("lat").notEmpty().withMessage("Agrega la ubicación del inmueble"),
  guardar
);

router.get('/propiedades/agregar-imagen/:id',protegerRuta,agregarImagen)

export default router;
