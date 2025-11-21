import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export class EmailService {
  private transporter: Nodemailer.Transporter;

  constructor() {
    this.transporter = Nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN || "4373cdbdb74ae9090db653942d9dd226",
      })
    );
    this.transporter.verify((err) => {
      if (err) {
        console.error("SMTP Error:", err);
        console.log("eror");

      } else {
        console.log("suc");

        console.log("SMTP server is ready to send emails");
      }
    });


  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const sender = {
      address: "hello@demomailtrap.co", // Mailtrap verified sender
      name: "PetMeeter",
    };

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-box {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
          }
          .message {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
            text-align: left;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 PetMeeter</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p class="message">
              We received a request to reset your password. Use the OTP below to reset your password.
            </p>
            <div class="otp-box">
              ${otp}
            </div>
            <p class="message">
              This OTP is valid for <strong>10 minutes</strong>.
            </p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 PetMeeter. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: sender,
        to: "jayesh.narola@freshcodes.net",
        subject: "Your PetMeeter OTP Code",
        html: htmlTemplate,
        text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        // category: "OTP",
      });

      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error("❌ Mail sending error:", err);
      throw new Error("Failed to send OTP email");
    }
  }


  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const sender = {
      address: "hello@demomailtrap.co", // Mailtrap verified sender
      name: "PetMeeter",
    };

    const htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                text-align: center;
                color: white;
              }
              .content {
                padding: 40px 30px;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐾 Welcome to PetMeeter!</h1>
              </div>
              <div class="content">
                <h2>Hi ${fullName}! 👋</h2>
                <p>Welcome to PetMeeter - where pets meet their perfect match!</p>
                <p>Your account has been successfully created. Start exploring and connect with other pet lovers.</p>
                <p>Happy matching! 🐕 🐈</p>
              </div>
              <div class="footer">
                <p>© 2025 PetMeeter. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

    const mailOptions = {
      from: sender,
      to: "jayesh.narola@freshcodes.net",
      subject: '🎉 Welcome to PetMeeter!',
      html: htmlTemplate,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

}




// import Nodemailer from "nodemailer";

// export class EmailService {
//   private transporter: nodemailer.Transporter;

//   // constructor() {
//   //   // Mailtrap configuration for testing
//   //   this.transporter = nodemailer.createTransport({
//   //     host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
//   //     port: parseInt(process.env.EMAIL_PORT || "2525"),
//   //     auth: {
//   //       user: process.env.EMAIL_USER || "6b649d0d49ffa9",
//   //       pass: process.env.EMAIL_PASS || "b7a14e27b3ec0b",
//   //     },
//   //   });
//   // }

//   constructor() {

//     // Mailtrap configuration for testing
//     // Looking to send emails in production? Check out our Email API/SMTP product!
//     this.transporter = nodemailer.createTransport({
//       host: "send.smtp.mailtrap.io",
//       port: 587,
//       auth: {
//         user: "6b649d0d49ffa9",
//         pass: "b7a14e27b3ec0b"
//       }
//     });

//     this.transporter.verify((err) => {
//       if (err) {
//         console.error("SMTP Error:", err);
//         console.log("eror");

//       } else {
//         console.log("suc");

//         console.log("SMTP server is ready to send emails");
//       }
//     });

//   }

//   async sendOTP(email: string, otp: string): Promise<void> {

//     console.log("servies mail ", email);
//     console.log("servies otp ", otp);

//     const htmlTemplate = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 0;
//           }
//           .container {
//             max-width: 600px;
//             margin: 50px auto;
//             background-color: #ffffff;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             padding: 30px;
//             text-align: center;
//             color: white;
//           }
//           .header h1 {
//             margin: 0;
//             font-size: 28px;
//           }
//           .content {
//             padding: 40px 30px;
//             text-align: center;
//           }
//           .otp-box {
//             background-color: #f8f9fa;
//             border: 2px dashed #667eea;
//             border-radius: 8px;
//             padding: 20px;
//             margin: 20px 0;
//             font-size: 32px;
//             font-weight: bold;
//             color: #667eea;
//             letter-spacing: 8px;
//           }
//           .message {
//             color: #666;
//             font-size: 16px;
//             line-height: 1.6;
//             margin: 20px 0;
//           }
//           .warning {
//             background-color: #fff3cd;
//             border-left: 4px solid #ffc107;
//             padding: 15px;
//             margin: 20px 0;
//             color: #856404;
//             text-align: left;
//           }
//           .footer {
//             background-color: #f8f9fa;
//             padding: 20px;
//             text-align: center;
//             color: #666;
//             font-size: 14px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🐾 PetMeeter</h1>
//           </div>
//           <div class="content">
//             <h2>Password Reset Request</h2>
//             <p class="message">
//               We received a request to reset your password. Use the OTP below to reset your password.
//             </p>
//             <div class="otp-box">
//               ${otp}
//             </div>
//             <p class="message">
//               This OTP is valid for <strong>10 minutes</strong>.
//             </p>
//             <div class="warning">
//               <strong>⚠️ Security Notice:</strong><br>
//               If you didn't request a password reset, please ignore this email and your password will remain unchanged.
//             </div>
//           </div>
//           <div class="footer">
//             <p>© 2025 PetMeeter. All rights reserved.</p>
//             <p>This is an automated email. Please do not reply.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const mailOptions = {
//       from: "PetMeeter <mailtrap@demomailtrap.com>",
//       to: "jayesh.narola@freshcodes.net",
//       subject: '🔐 PetMeeter - Password Reset OTP',
//       text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
//       html: htmlTemplate,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       console.log(`✅ OTP email sent successfully to ${email}`);
//     } catch (error) {
//       console.error('❌ Error sending email:', error);
//       throw new Error('Failed to send OTP email');
//     }
//   }

//   async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
//     const htmlTemplate = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 0;
//           }
//           .container {
//             max-width: 600px;
//             margin: 50px auto;
//             background-color: #ffffff;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             padding: 40px;
//             text-align: center;
//             color: white;
//           }
//           .content {
//             padding: 40px 30px;
//           }
//           .footer {
//             background-color: #f8f9fa;
//             padding: 20px;
//             text-align: center;
//             color: #666;
//             font-size: 14px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🐾 Welcome to PetMeeter!</h1>
//           </div>
//           <div class="content">
//             <h2>Hi ${fullName}! 👋</h2>
//             <p>Welcome to PetMeeter - where pets meet their perfect match!</p>
//             <p>Your account has been successfully created. Start exploring and connect with other pet lovers.</p>
//             <p>Happy matching! 🐕 🐈</p>
//           </div>
//           <div class="footer">
//             <p>© 2025 PetMeeter. All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const mailOptions = {
//       from: `PetMeeter <noreply@petmeeter.com>`,
//       to: email,
//       subject: '🎉 Welcome to PetMeeter!',
//       html: htmlTemplate,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       console.log(`✅ Welcome email sent successfully to ${email}`);
//     } catch (error) {
//       console.error('❌ Error sending welcome email:', error);
//       throw new Error('Failed to send welcome email');
//     }
//   }
// }