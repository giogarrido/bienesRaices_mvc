import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token} = datos;

  //enviar el email
  
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices.com",
    text: "Confirma tu cuenta en BienesRaices.com",
    html: `
      <h1>Confirma tu cuenta</h1>
      <p> Hola ${nombre}, confirma tu cuenta haciendo click en el siguiente enlace:
      <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>

      <p>Si no has sido tu, ignora este mensaje.</p>

    `,
  });

};


const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token} = datos;

  //enviar el email
  
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Restablece tu password en BienesRaices.com",
    text: "Restablece tu password en BienesRaices.com",
    html: `
      <h1>Restablece tu password</h1>
      <p> Hola ${nombre}, has solicitado restablecer tu password, haz click en el siguiente enlace:
      <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password</a></p>

      <p>Si no has sido tu, ignora este mensaje.</p>

    `,
  });

};

export { emailRegistro, emailOlvidePassword };
