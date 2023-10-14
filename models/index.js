import Propiedad from './propiedad.js';
import Categoria from './categoria.js';
import Usuario from './usuario.js';
import Precio from './precio.js';


//Propiedad tiene un precio
Propiedad.belongsTo(Precio , {foreignKey: 'precioId'});

//Propiedad tiene una categoria
Propiedad.belongsTo(Categoria , {foreignKey: 'categoriaId'});

//Propiedad tiene un usuario
Propiedad.belongsTo(Usuario , {foreignKey: 'usuarioId'});






export{
    Propiedad,
    Categoria,
    Usuario,
    Precio
}



