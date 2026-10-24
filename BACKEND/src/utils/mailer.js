import nodemailer from "nodemailer";

let transporter = null;
let checkedConfig = false;

const isConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const getTransporter = () => {
  if (!checkedConfig) {
    checkedConfig = true;
    if (isConfigured()) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      console.warn(
        "[mailer] SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) - " +
        "emails will be logged to the console instead of sent. Set these in .env for real delivery."
      );
    }
  }
  return transporter;
};

export const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    // Dev fallback: no SMTP configured, so just log it - this keeps
    // verification/reset flows fully testable without real email setup.
    console.log(`\n[mailer] Would send email to ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};
