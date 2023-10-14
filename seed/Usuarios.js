import bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre: 'admin',
        email: 'admin@admin.com',
        confirmado:1,
        password: bcrypt.hashSync('123456', 10)
    },
];

export default usuarios;
