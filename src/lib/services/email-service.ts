import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const emailService = {
  getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  },

  async sendMail({ to, subject, html }: EmailOptions) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials not found. Email not sent.")
      console.log(`[Email to ${to}] Subject: ${subject}`)
      return { success: false, reason: "No SMTP credentials configured" }
    }

    try {
      const transporter = this.getTransporter()
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'BuildOrbit HR'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      })
      console.log(`Email sent: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }
  },

  // PRE-BUILT EMAIL TEMPLATES

  async sendLeaveRequestAlertToManager(managerEmail: string, employeeName: string, leaveType: string, days: number, startDate: Date, endDate: Date) {
    const subject = `Leave Request: ${employeeName} has applied for ${leaveType}`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Leave Request</h2>
        <p style="color: #334155;">Hello,</p>
        <p style="color: #334155;"><strong>${employeeName}</strong> has requested <strong>${days} days</strong> of <strong>${leaveType}</strong>.</p>
        
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>From:</strong> ${startDate.toLocaleDateString()}</p>
          <p style="margin: 4px 0;"><strong>To:</strong> ${endDate.toLocaleDateString()}</p>
        </div>
        
        <p style="color: #334155;">Please log in to the BuildOrbit dashboard to review and approve/reject this request.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/hr/leave-approval" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 10px; font-weight: bold;">Review Request</a>
      </div>
    `
    return this.sendMail({ to: managerEmail, subject, html })
  },

  async sendLeaveStatusUpdateToEmployee(employeeEmail: string, leaveType: string, status: "APPROVED" | "REJECTED", approverName: string) {
    const subject = `Leave Request ${status}: ${leaveType}`
    const color = status === "APPROVED" ? "#10b981" : "#ef4444"
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">Leave Request Update</h2>
        <p style="color: #334155;">Hello,</p>
        <p style="color: #334155;">Your request for <strong>${leaveType}</strong> has been <span style="color: ${color}; font-weight: bold;">${status}</span> by ${approverName}.</p>
        
        <p style="color: #334155;">You can check your updated leave balance on your dashboard.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workforce/leave" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 10px; font-weight: bold;">View Details</a>
      </div>
    `
    return this.sendMail({ to: employeeEmail, subject, html })
  },

  async sendPayslipGeneratedAlert(employeeEmail: string, employeeName: string, month: number, year: number) {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })
    const subject = `Payslip Available: ${monthName} ${year}`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">Payslip Generated</h2>
        <p style="color: #334155;">Hello ${employeeName},</p>
        <p style="color: #334155;">Your salary slip for the month of <strong>${monthName} ${year}</strong> has been generated and is now available to download.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workforce/payslip" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 10px; font-weight: bold;">View Payslip</a>
      </div>
    `
    return this.sendMail({ to: employeeEmail, subject, html })
  }
}
