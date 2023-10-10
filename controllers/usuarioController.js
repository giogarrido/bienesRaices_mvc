import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  // validar
  await check("nombre", "El nombre es obligatorio").not().isEmpty().run(req);
  await check("email", "El email es obligatorio").not().isEmpty().run(req);
  await check("email", "El email debe ser válido").isEmail().run(req);
  await check("password", "El password es obligatorio")
    .not()
    .isEmpty()
    .run(req);
  await check("password", "El password debe tener al menos 6 caracteres")
    .isLength({ min: 6 })
    .run(req);
  await check("repetir_password", "Confirmar password es obligatorio")
    .not()
    .isEmpty()
    .run(req);
  await check("repetir_password", "El password es diferente")
    .equals(req.body.password)
    .run(req);

  // leer los errores
  let resultado = validationResult(req);

  // si hay errores
  if (!resultado.isEmpty()) {
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //extraer datos
  const { nombre, email, password } = req.body;

  // verificar si el usuario ya esta registrado

  const existeUsuario = await Usuario.findOne({ where: { email } });

  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Almacenar usuario

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Enviar email de confirmación

  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmación
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un correo de confirmación a tu cuenta de email.",
  });
};

// Confirmar cuenta
const confirmar = async (req, res) => {
  const { token } = req.params;

  // verificar si el token es válido

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje:
        "Hubo un error al confirmar tu cuenta, por favor intenta de nuevo.",
      error: true,
    });
  }

  // confirmar el usuario

  usuario.token = null;
  usuario.confirmado = true;

  await usuario.save();

  return res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta confirmada correctamente",
    mensaje:
      "Tu cuenta ha sido confirmada correctamente, ya puedes iniciar sesión.",
  });
};

const resetPassword = async (req, res) => {
  // validar
  await check("email", "El email debe ser válido").isEmail().run(req);

  let resultado = validationResult(req);

  // verificar que el resultado no tenga errores
  if (!resultado.isEmpty()) {
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  // verificar si el usuario existe
  
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Olvide Password",
    csrfToken: req.csrfToken(),
  });
};

export {
  formularioLogin,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
};
