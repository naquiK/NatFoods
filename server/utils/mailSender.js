import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const mailSender = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: process.env.SMTP_MAIL , 
      to,
      subject,
      html,
    })
    console.log("✅ Email sent:", data)
  } catch (err) {
    console.error("❌ Email send failed:", err)
  }
}
