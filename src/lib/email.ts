import { Resend } from "resend";
import { ReactElement } from "react";

// Initialize Resend client. It will use the RESEND_API_KEY environment variable.
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from: "BuildOrbit <onboarding@resend.dev>", // using Resend's testing domain for now
      to,
      subject,
      react,
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
