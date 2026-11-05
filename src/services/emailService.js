const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_USER || "appagile4@gmail.com",
      pass: process.env.SMTP_PASS || "ozas hxat tryq blzn",
    },
  });
};

/**
 * Send OTP Email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.otp - 5-digit OTP code
 * @param {string} [options.type] - "signup" | "forgot_password" | "resend" | "login"
 * @param {string} [options.name] - User's name if available
 */
const sendOtpEmail = async ({ to, otp, type = "signup", name = "User" }) => {
  const transporter = createTransporter();

  let subject = "Your Verification Code - Kalki Sena Drive";
  let heading = "Verify Your Account";
  let intro = `Hello ${name}, please use the verification code below to verify your account.`;

  if (type === "forgot_password") {
    subject = "Reset Your Password - Kalki Sena Drive";
    heading = "Password Reset Request";
    intro = `Hello ${name}, we received a request to reset your password. Use the code below to complete the reset.`;
  } else if (type === "resend") {
    subject = "Your New Verification Code - Kalki Sena Drive";
    heading = "New Verification Code";
    intro = `Hello ${name}, here is your requested new verification code.`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #020b18; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020b18; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #071C38; border-radius: 16px; border: 1px solid #163660; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 32px 24px 20px 24px; background: linear-gradient(180deg, #092347 0%, #071C38 100%);">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #2079F2; letter-spacing: 0.5px;">Kalki Sena Drive</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #8EB4D8;">Super App for Nepal</p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 19px; font-weight: 600; color: #FFFFFF; text-align: center;">${heading}</h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #C6DBEF; text-align: center;">${intro}</p>

                    <!-- OTP Code Display Card -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                      <tr>
                        <td align="center">
                          <div style="background-color: #030e1d; border: 1.5px dashed #2079F2; border-radius: 12px; padding: 18px 24px; display: inline-block;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #2079F2; text-indent: 10px;">${otp}</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Note -->
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #8EB4D8; text-align: center;">
                      ⏱️ This code is valid for <strong>30 Seconds</strong>.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #5B7A9C; text-align: center; line-height: 18px;">
                      If you did not request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 24px; background-color: #030e1d; border-top: 1px solid #102B4E; text-align: center;">
                    <p style="margin: 0; font-size: 11.5px; color: #4B6B8E;">
                      © ${new Date().getFullYear()} Kalki Sena Drive. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Kalki Sena Drive" <appagile4@gmail.com>',
    to,
    subject,
    html: htmlContent,
    text: `${heading}\n\n${intro}\n\nYour OTP Code is: ${otp}\n\nThis code expires in 10 minutes.\n\n© Kalki Sena Drive`,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
};
