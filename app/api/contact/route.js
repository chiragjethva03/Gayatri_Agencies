import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { fullName, email, mobileNo, companyName, description } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "gaytriagency170@gmail.com",
      // Improved Subject Line
      subject: `New Contact Request: ${fullName} - Gayatri Agency`,
      // Professionally Styled HTML Body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="background-color: #113741; padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">GAYATRI AGENCY</h1>
            <p style="color: #f97316; margin: 8px 0 0 0; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">New Contact Message</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 15px; color: #475569; margin-top: 0; margin-bottom: 25px;">You have received a new message from the website contact form. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; width: 130px; font-weight: bold; color: #113741; font-size: 14px;">Full Name:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #113741; font-size: 14px;">Email:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #f97316; text-decoration: none; font-weight: bold;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #113741; font-size: 14px;">Mobile No:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">${mobileNo}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #113741; font-size: 14px;">Company:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">${companyName || "<span style='color: #94a3b8; font-style: italic;'>Not provided</span>"}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px;">
              <h3 style="color: #113741; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid #113741; padding-bottom: 8px; display: inline-block;">Message Description</h3>
              <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #f97316; border-radius: 0 4px 4px 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${description}</div>
            </div>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            This email was generated automatically from the Gayatri Agency website.
          </div>
          
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}