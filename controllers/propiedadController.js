import { unlink } from "node:fs/promises";
import { validationResult } from "express-validator";
import { Categoria, Mensaje, Precio, Propiedad, Usuario } from "../models/index.js";
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req, res) => {
  //LEER QUERYSTRING

  const { pagina: paginaActual } = req.query;

  const expresionRegular = /^[1-9]$/;

  if (!expresionRegular.test(paginaActual)) {
    return res.redirect("/mis-propiedades?pagina=1");
  }

  try {
    const { id } = req.usuario;

    //LIMITES Y OFFSETS PARA LA PAGINACIÓN

    const limit = 10;
    const offset = paginaActual * limit - limit;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          usuarioId: id,
        },
        include: [
          { model: Categoria, as: "categoria" },
          { model: Precio, as: "precio" },
          { model: Mensaje, as: "mensajes"}
        ],
      }),
      Propiedad.count({
        where: {
          usuarioId: id,
        },
      }),
    ]);

    res.render("propiedades/admin", {
      pagina: "Mis Propiedades",
      propiedades,
      csrfToken: req.csrfToken(),
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      total,
      offset,
      limit,
    });
  } catch (error) {
    console.log(error);
  }
};

//formulario para crear una nueva propiedades

const crear = async (req, res) => {
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {},
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
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body,
    });
  }

  // Crear registro en la base de datos

  const {
    titulo,
    descripcion,
    categoria: categoriaId,
    precio,
    habitaciones,
    wc,
    estacionamiento,
    calle,
    lat,
    lng,
  } = req.body;

  const { id: usuarioId } = req.usuario;

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
      usuarioId,
      imagen: "",
    });

    const { id } = propiedadGuardada;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;

  //VALIDAR QUE LA PROPIEDAD EXISTA

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //VALIDDAR QUE LA PROPIEDAD NO ESTE PUBLICADA

  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //VALIDAR QUE EL USUARIO SEA EL PROPIETARIO

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `Agregar Imagen: ${propiedad.titulo}`,
    propiedad,
    csrfToken: req.csrfToken(),
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params;

  //VALIDAR QUE LA PROPIEDAD EXISTA

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //VALIDDAR QUE LA PROPIEDAD NO ESTE PUBLICADA

  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //VALIDAR QUE EL USUARIO SEA EL PROPIETARIO

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    //Almacenar la imagen en el servidor
    propiedad.imagen = req.file.filename;
    propiedad.publicado = 1;

    await propiedad.save();

    next();
  } catch (error) {
    console.log(error);
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  //VALIDAR QUE LA PROPIEDAD EXISTA

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //REVISAR QUE QUIEN VISITA LA PAGINA SEA EL PROPIETARIO

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //CONSULTAR MODELO DE CATEGORÍAS Y PRECIOS
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/editar", {
    pagina: `Editar Propiedad: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad,
  });
};

const guardarCambios = async (req, res) => {
  //VERIFICAR LA VALIDACIÓN

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Consultar Modelo categorias y precios
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/editar", {
      pagina: "Editar Propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body,
    });
  }

  const { id } = req.params;

  //VALIDAR QUE LA PROPIEDAD EXISTA

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //REVISAR QUE QUIEN VISITA LA PAGINA SEA EL PROPIETARIO

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //REESCRIBIR LOS VALORES DE LA PROPIEDAD Y GUARDARLOS EN LA BASE DE DATOS

  try {
    const {
      titulo,
      descripcion,
      categoria: categoriaId,
      precio: precioId,
      habitaciones,
      wc,
      estacionamiento,
      calle,
      lat,
      lng,
    } = req.body;

    propiedad.set({
      titulo,
      descripcion,
      categoriaId,
      precioId,
      habitaciones,
      wc,
      estacionamiento,
      calle,
      lat,
      lng,
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.log(error);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  //VALIDAR QUE LA PROPIEDAD EXISTA

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //REVISAR QUE QUIEN VISITA LA PAGINA SEA EL PROPIETARIO

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //ELIMINAR IMAGEN DE LA PROPIEDAD

  await unlink(`public/uploads/${propiedad.imagen}`);

  //ELIMINAR LA PROPIEDAD

  await propiedad.destroy();

  res.redirect("/mis-propiedades");
};

// MODIFICA EL ESTADO DE UNA PROPIEDAD
const cambiarEstado = async (req, res) => {

  const {id} = req.params

  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id)
  if(!propiedad) {
      return res.redirect('/mis-propiedades')
  }

  // Revisar que quien visita la URl, es quien creo la propiedad
  if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
      return res.redirect('/mis-propiedades')
  }

  // Actualizar
  propiedad.publicado = !propiedad.publicado

  await propiedad.save()

  res.json({
      resultado: true
  })
}



// MUESTRA UNA PROPIEDAD

const mostrarPropiedad = async (req, res) => {
  const { id } = req.params;

  //VALIDAR QUE LA PROPIEDAD EXISTA
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });

  if (!propiedad || !propiedad.publicado) {
    return res.redirect("/404");
  }

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
  });
};

const enviarMensaje = async (req, res) => {
  const { id } = req.params;

  // Comprobar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Precio, as: "precio" },
      { model: Categoria, as: "categoria" },
    ],
  });

  if (!propiedad) {
    return res.redirect("/404");
  }

  // Renderizar los errores
  // Validación
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("propiedades/mostrar", {
      propiedad,
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array(),
    });
  }
  const { mensaje } = req.body;
  const { id: propiedadId } = req.params;
  const { id: usuarioId } = req.usuario;

  // Almacenar el mensaje
  await Mensaje.create({
    mensaje,
    propiedadId,
    usuarioId,
  });

  res.redirect("/");
};

// Leer mensajes recibidos
const verMensajes = async (req, res) => {
  const { id } = req.params;

  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope("eliminarPassword"), as: "usuario" }],
      },
    ],
  });

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  // Revisar que quien visita la URl, es quien creo la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/mensajes", {
    pagina: "Mensajes",
    mensajes: propiedad.mensajes,
    formatearFecha,
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  eliminar,
  cambiarEstado,
  guardarCambios,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
};
