import {Sequelize} from 'sequelize'
import {Categoria, Precio, Propiedad} from '../models/index.js'


const inicio = async(req, res) => {
    const categorias = await Categoria.findAll({raw: true})
    const precios = await Precio.findAll({raw: true})

    const [ casas, departamentos] = await Promise.all([
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId: 1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order:[['createdAt', 'DESC']] // Ordenar por fecha de creación de forma descendente
        }),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId: 2
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order:[['createdAt', 'DESC']] // Ordenar por fecha de creación de forma descendente
        })

    ])

    res.render('inicio',{
        pagina: 'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        csrfToken: req.csrfToken()

    })
}

const categoria = async (req, res) => {

    const {id} = req.params

    // Comprobar que la categoría existe
    const categoria = await Categoria.findByPk(id)
    if(!categoria){
        return res.redirect('/404')
    }

    // Obtener las propiedades de la categoría
    const propiedades = await Propiedad.findAll({
        where:{
            categoriaId: id
        },
        include: [
            {
                model: Precio,
                as: 'precio'
            }
        ],

    })

    res.render('categoria',{
        pagina: `${categoria.nombre}s en Venta`,
        propiedades,
        csrfToken: req.csrfToken()
    })
}

const noEncontrado = (req, res) => {
    res.render('404', {
        pagina: 'No Encontrada',
        csrfToken: req.csrfToken()
    })

}

const buscador = async (req, res) => {
    const { termino } = req.body

    // Validar que termino no este vacio
    if(!termino.trim()) {
        return res.redirect('back')
    }

    // Consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where: {
            titulo: {
                [Sequelize.Op.like] : '%' + termino + '%'  // Buscar por coincidencia
            }
        },
        include: [
            { model: Precio, as: 'precio'}
        ]
    })

    res.render('busqueda', {
        pagina: 'Resultados de la Búsqueda',
        propiedades, 
        csrfToken: req.csrfToken()
    })
    
}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}
