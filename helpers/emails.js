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
      <a> href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}"</a>Confirmar cuenta</p>

      <p>Si no has sido tu, ignora este mensaje.</p>

    `,
  });

};

export { emailRegistro };
