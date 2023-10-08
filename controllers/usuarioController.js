import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";


const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear cuenta",
  });
};

const registrar = async(req, res) => {

  // validar
  await check("nombre", "El nombre es obligatorio").not().isEmpty().run(req);
  await check("email", "El email es obligatorio").not().isEmpty().run(req);
  await check("email", "El email debe ser válido").isEmail().run(req);
  await check("password", "El password es obligatorio").not().isEmpty().run(req);
  await check("password", "El password debe tener al menos 6 caracteres").isLength({ min: 6 }).run(req);
  await check("repetir_password", "Confirmar password es obligatorio").not().isEmpty().run(req);
  await check("repetir_password", "El password es diferente").equals(req.body.password).run(req);

  // leer los errores
  let resultado = validationResult(req);

  // si hay errores
  if (!resultado.isEmpty()) {
    
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      errores: resultado.array()
    });
    
  }

    const usuario = await Usuario.create(req.body);
    res.json(usuario);
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Olvide Password",
  });
};

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrar,
};
