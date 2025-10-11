import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "NatFoods <onboarding@resend.dev>", // or a verified domain email
      to,
      subject,
      html,
    })
    console.log("✅ Email sent:", data)
  } catch (err) {
    console.error("❌ Email send failed:", err)
  }
}
