import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "asapdf <noreply@asapdf.com>",
      to: [email],
      subject: "Verify your .edu email for free Pro access",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">asapdf</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">As Soon As PDF</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a202c; margin: 0 0 24px 0; font-size: 24px;">Verify Your Educational Email</h2>
              
              <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for signing up with your educational email! To get free Pro access, please verify your email with the code below:
              </p>
              
              <div style="background: #f7fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #718096; margin: 16px 0 0 0; font-size: 14px;">This code expires in 10 minutes</p>
              </div>
              
              <p style="color: #4a5568; line-height: 1.6; margin: 24px 0 0 0; font-size: 14px;">
                Once verified, you'll get unlimited file processing, premium quality conversions, and priority support - all free with your .edu email!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              
              <p style="color: #718096; font-size: 12px; margin: 0;">
                If you didn't request this verification, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Email sending error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Email service error:", error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "asapdf <hello@asapdf.com>",
      to: [email],
      subject: "Welcome to asapdf! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to asapdf</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to asapdf!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">As Soon As PDF</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a202c; margin: 0 0 24px 0; font-size: 24px;">Hi ${name}! 👋</h2>
              
              <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for joining asapdf! You're now ready to transform your documents with lightning speed.
              </p>
              
              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #2d3748; margin: 0 0 16px 0; font-size: 18px;">What you can do:</h3>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Merge multiple PDFs into one document</li>
                  <li style="margin-bottom: 8px;">Convert Markdown files to PDF</li>
                  <li style="margin-bottom: 8px;">Transform PowerPoint presentations to PDF</li>
                  <li style="margin-bottom: 8px;">Process up to 5 files per day on the free plan</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://asapdf.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Start Processing Files
                </a>
              </div>
              
              <p style="color: #4a5568; line-height: 1.6; margin: 24px 0 0 0; font-size: 14px;">
                Need more? Upgrade to Pro for unlimited processing, or verify your .edu email for free Pro access!
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Welcome email error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Email service error:", error)
    return false
  }
}
