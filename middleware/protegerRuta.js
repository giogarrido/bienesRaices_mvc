import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const protegerRuta = async (req, res, next) => {
    
    //Verrificar si hay un token
    const {_token} = req.cookies;
    if(!_token){
        return res.redirect('/auth/login')
    }


    //Verificar si el token es valido

    try {

        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);

        //Almacenar el usuario en la req
        if(usuario){
            req.usuario = usuario;
        } else {
            return res.redirect('/auth/login')
        }
        return next();

    } catch (error) {
        console.log(error);
        return res.clearCookie('_token').res.redirect('/auth/login')
    }

    next();
}

export default protegerRuta;

