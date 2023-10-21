import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./Usuarios.js";
import db from "../config/db.js";
import {Categoria, Precio, Usuario} from "../models/index.js";

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
      Usuario.bulkCreate(usuarios),
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

const eliminarDatos = async () => {
  try {

    // Eliminar las columnas de la tabla
    // await Promise.all([
    //   Categoria.destroy({where:{}, truncate: true }),
    //   Precio.destroy({where:{}, truncate: true }),
    // ]);

    await db.sync({ force: true }); // drops all tables then recreates them

    console.log("Datos eliminados correctamente");

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

if (process.argv[2] === "-e") {
  eliminarDatos();
}
