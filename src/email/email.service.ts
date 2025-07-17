/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      console.warn('⚠️ SMTP environment variables are missing. Email sending is disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(port, 10),
      secure: false,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmailVerification(email: string, code: string, name: string) {
    console.log(`Verification code for ${name} (${email}): ${code}`);
  }

  // async sendEmailVerification(email: string, code: string, name: string) {
  //   const mailOptions = {
  //     from: process.env.SMTP_USER,
  //     to: email,
  //     subject: 'Email Verification',
  //     html: `
  //       <h2>Email Verification</h2>
  //       <p>Hello ${name},</p>
  //       <p>Please use the following code to verify your email:</p>
  //       <h3>${code}</h3>
  //       <p>This code will expire in 10 minutes.</p>
  //     `,
  //   };

  //   await this.transporter.sendMail(mailOptions);
  // }
  async resendVerification(email: string, code: string, name: string) {
    console.log(`Verification code for ${name} (${email}): ${code}`);
  }

  async sendPasswordResetOtp(email: string, code: string, name: string) {
    console.log(`PasswordReset code for ${name} (${email}): ${code}`);
  }
  // async sendPasswordResetOtp(email: string, code: string, name: string) {
  //   const mailOptions = {
  //     from: process.env.SMTP_USER,
  //     to: email,
  //     subject: 'Password Reset Code',
  //     html: `
  //       <h2>Password Reset</h2>
  //       <p>Hello ${name},</p>
  //       <p>Please use the following code to reset your password:</p>
  //       <h3>${code}</h3>
  //       <p>This code will expire in 10 minutes.</p>
  //     `,
  //   };

  //   await this.transporter.sendMail(mailOptions);
  // }

  async sendGroupInvitation(groupName: string, inviteLink: string, inviterName: string) {
    console.log(`The invitation link for ${groupName} (${inviterName}: ${inviteLink}`);
  }

  async sendGroupCode(inviteCode: string) {
    console.log(`The invitation code is ${inviteCode}`);
  }
  //  async sendGroupInvitation(params: {
  //   to: string;
  //   groupName: string;
  //   inviterName: string;
  //   inviteLink: string;
  //   message?: string;
  // }) {
  //   const { to, groupName, inviterName, inviteLink, message } = params;

  //   const emailContent = `
  //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //       <h2>You're invited to join ${groupName}!</h2>

  //       <p>Hi there,</p>

  //       <p><strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong>.</p>

  //       ${message ? `<p><em>"${message}"</em></p>` : ''}

  //       <div style="text-align: center; margin: 30px 0;">
  //         <a href="${inviteLink}"
  //            style="background-color: #007bff; color: white; padding: 12px 30px;
  //                   text-decoration: none; border-radius: 5px; display: inline-block;">
  //           Join Group
  //         </a>
  //       </div>

  //       <p>Or copy and paste this link in your browser:</p>
  //       <p style="word-break: break-all; color: #666;">${inviteLink}</p>

  //       <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

  //       <p style="color: #999; font-size: 12px;">
  //         This invitation will expire in 7 days. If you don't want to receive these invitations,
  //         please contact the group admin.
  //       </p>
  //     </div>
  //   `;

  //   // TODO: Implement actual email sending
  //   console.log('Sending email invitation:', {
  //     to,
  //     subject: `Invitation to join ${groupName}`,
  //     html: emailContent,
  //   });

  //   // Example with SendGrid:
  //   // const msg = {
  //   //   to,
  //   //   from: process.env.FROM_EMAIL,
  //   //   subject: `Invitation to join ${groupName}`,
  //   //   html: emailContent,
  //   // };
  //   // await this.sgMail.send(msg);

  //   return { success: true, to };
  // }
}
