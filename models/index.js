import Propiedad from './Propiedad.js';
import Categoria from './Categoria.js';
import Usuario from './Usuario.js';
import Precio from './Precio.js';
import Mensaje from './Mensaje.js';


//Propiedad tiene un precio
Propiedad.belongsTo(Precio , {foreignKey: 'precioId'});

//Propiedad tiene una categoria
Propiedad.belongsTo(Categoria , {foreignKey: 'categoriaId'});

//Propiedad tiene un usuario
Propiedad.belongsTo(Usuario , {foreignKey: 'usuarioId'});

//Propiedad tiene muchos mensajes
Propiedad.hasMany(Mensaje , {foreignKey: 'propiedadId'})


Mensaje.belongsTo(Propiedad , {foreignKey: 'propiedadId'})
Mensaje.belongsTo(Usuario , {foreignKey: 'usuarioId'})






export{
    Propiedad,
    Categoria,
    Usuario,
    Precio,
    Mensaje
}



