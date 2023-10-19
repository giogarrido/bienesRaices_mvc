import express from "express";
import { body } from "express-validator";
import {
  admin,
  crear,
  guardar,
  guardarCambios,
  editar,
  eliminar,
  agregarImagen,
  almacenarImagen,
  mostrarPropiedad
} from "../controllers/propiedadController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import upload from "../middleware/subirImagen.js";

const router = express.Router();

router.get("/mis-propiedades", protegerRuta, admin);
router.get("/propiedades/crear", protegerRuta, crear);
router.post(
  "/propiedades/crear",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El Título del anuncio es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción no puede ir vacía")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una categoría"),
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

router.get("/propiedades/agregar-imagen/:id",
   protegerRuta,
   agregarImagen
   );

router.post("/propiedades/agregar-imagen/:id",
    protegerRuta,
    upload.single("imagen"),
    almacenarImagen
    );

router.get("/propiedades/editar/:id", protegerRuta, editar);

router.post(
  "/propiedades/editar/:id",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El Titulo del anuncio es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción no puede ir vacía")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una categoría"),
  body("precio").isNumeric().withMessage("Selecciona un precio"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Selecciona el numero de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Selecciona el numero de estacionamientos"),
  body("wc").isNumeric().withMessage("Selecciona el numero de baños"),
  body("lat").notEmpty().withMessage("Agrega la ubicación del inmueble"),
  guardarCambios
);

router.post("/propiedades/eliminar/:id", protegerRuta, eliminar );

//AREA PUBLICA

router.get("/propiedad/:id", mostrarPropiedad);

export default router;
