import nodemailer from "nodemailer"
import { Resend } from "resend"
import { ReactElement } from "react"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

import { render } from "@react-email/render"

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: "BuildOrbit <onboarding@resend.dev>", // using Resend's testing domain for now
        to,
        subject,
        react,
      });
      console.log("Email sent successfully via Resend:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return { success: false, error };
    }
  }

  // Fallback to Nodemailer if Resend is not configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      // For some components, rendering to HTML is async, some are sync. render is async in newer versions
      const html = await render(react);
      const info = await transporter.sendMail({
        from: `"BuildOrbit" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
      });
      console.log("Email sent successfully via Nodemailer:", info.messageId);
      return { success: true, data: info };
    } catch (error) {
      console.error("Failed to send email via Nodemailer:", error);
      return { success: false, error };
    }
  }

  console.warn("Neither RESEND_API_KEY nor EMAIL_USER/EMAIL_PASS are set. Email will not be sent to", to);
  return { success: false, error: new Error("No email provider configured") };
}


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOTP(email: string, otp: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set. OTP to", email, "is", otp)
    return
  }

  const mailOptions = {
    from: `"BuildOrbit" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your BuildOrbit Verification Code",
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Welcome to BuildOrbit!</h2>
        <p style="color: #475569; font-size: 16px;">Please use the verification code below to complete your registration.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #10b981;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Error sending OTP email:", error)
    throw new Error("Failed to send verification email.")
  }
}
