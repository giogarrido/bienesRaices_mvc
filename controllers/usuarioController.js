import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import {generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar sesión",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {

  // validar
  await check("email", "El email debe ser válido").isEmail().run(req);
  await check("password", "El password es obligatorio").not().isEmpty().run(req);

  // leer los errores
  let resultado = validationResult(req);

  // si hay errores
  if (!resultado.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    });
  }

  // buscar el usuario

  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  // si el usuario no existe
  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no existe" }],
    });
  }

  // comprobar su el usuario esta confirmado
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Tu cuenta no ha sido confirmada" }],
    });
  }

  // verificar el password

  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El password es incorrecto" }],
    });
  }

//Autenticar el usuario

const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

console.log(token);

//Almacenar el token en una cookie

return res.cookie("_token", token, {
  httpOnly: true,
  //secure:true,  //se usa cuando se tiene un certificado SSL
  //sameSite:true  //se usa cuando se tiene un certificado SSL
}).redirect("/mis-propiedades");



}

const cerrarSesion = (req, res) => {

  res.clearCookie("_token").status(200).redirect("/auth/login");
  

}

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
  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "No existe una cuenta con este email" }],
    });
  }

  // generar token y enviar email

  usuario.token = generarId();
  await usuario.save();

  // enviar email

  emailOlvidePassword({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //randerizar mensaje

  res.render("templates/mensaje", {
    pagina: "Reestablisher tu password",
    mensaje: "Hemos enviado un correo para reestablecer tu password",
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  // verificar si el token es válido

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablecer tu password",
      mensaje:
        "Hubo un error al validar tu información, por favor intenta de nuevo.",
      error: true,
    });
  }

  //Mostrar formulario para reestablecer el password

  res.render("auth/reset-password", {
    pagina: "Reestablecer tu password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  // validar password
  await check("password", "El password debe tener al menos 6 caracteres")
    .isLength({ min: 6 })
    .run(req);

  let resultado = validationResult(req);

  // verificar que el resultado no tenga errores
  if (!resultado.isEmpty()) {
    return res.render("auth/reset-password", {
      pagina: "Reestablecer tu password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio de password

  const usuario = await Usuario.findOne({ where: { token } });

  // hashear el password

  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Pasword actualizado correctamente",
    mensaje:
      "Tu password ha sido actualizado correctamente, ya puedes iniciar sesión",
  });
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
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
};
