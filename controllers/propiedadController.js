import { validationResult } from "express-validator";
import { Categoria, Precio, Propiedad } from "../models/index.js";

const admin = (req, res) => {
  res.render("propiedades/admin", {
    pagina: "Mis Propiedades",
    barra: true,
  });
};

//formulario para crear una nueva propiedades

const crear = async (req, res) => {
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    barra: true,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos:{}
  });
};

//guardar propiedades en la base de datos
const guardar = async (req, res) => {
  //Validación
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Consultar Modelo categorias y precios
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      barra: true,
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos:req.body
    });
  }

  // Crear registro en la base de datos

  const { titulo, descripcion, categoria: categoriaId, precio, habitaciones, wc, estacionamiento,calle, lat, lng  } = req.body;

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      categoriaId, // de una manera mas corta
      precioId: precio, // de una manera mas larga
      habitaciones,
      wc,
      estacionamiento,
      lat,
      lng,
      calle,
      //usuarioId: req.user.id,

    });
  } catch (error) {
    console.log(error);
  }


};

export { admin, crear, guardar };
