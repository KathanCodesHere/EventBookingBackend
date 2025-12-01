import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM,
      to,
      subject,
      html,
    });

    console.log("Invitation email sent successfully");
  } catch (error) {
    console.log("Email sending error:", error);
  }
};
