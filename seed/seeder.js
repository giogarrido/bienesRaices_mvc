import categorias from "./categorias.js";
import Categoria from "../models/Categoria.js";
import Precio from "../models/Precio.js";
import precios from "./precios.js";
import db from "../config/db.js";

const importarDatos = async () => {
  try {
    // Autenticar
    await db.authenticate();

    // Generar las columnas de la tabla
    await db.sync();

    // Insertar datos
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
    ]);
    console.log("Datos insertados correctamente");
    // terminar la ejecución de manera correcta
    process.exit(0);
  } catch (error) {
    console.log(error);
    // terminar la ejecución de manera incorrecta
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
}
