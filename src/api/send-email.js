const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, taskTitle, userName } = req.body;

  if (!to || !taskTitle || !userName) {
    return res.status(400).json({ error: 'Missing required fields: to, taskTitle, userName' });
  }

  try {
    // Gmail API setup
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground' // Redirect URI used to obtain refresh token
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Read PDF file
    const pdfPath = path.join(process.cwd(), 'public', 'taskfiles', 'food_product_review.pdf');
    const pdfContent = await fs.readFile(pdfPath);

    // Compose email
    const mailOptions = {
      from: 'Work From Home <workfromhome.onlinepay@gmail.com>',
      to,
      subject: `Congratulations on Your New Role: ${taskTitle}`,
      text: `Dear ${userName},\n\nCongratulations! You have successfully applied and been selected for the task "${taskTitle}". Attached, you will find the task instructions in a PDF file.\n\nBest regards,\nWork From Home Team`,
      html: `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully applied and been selected for the task "<strong>${taskTitle}</strong>".</p>
        <p>Attached, you will find the task instructions in a PDF file.</p>
        <p>Best regards,<br>Work From Home Team</p>
      `,
      attachments: [
        {
          filename: 'food_product_review.pdf',
          content: pdfContent,
          contentType: 'application/pdf',
        },
      ],
    };

    // Encode email message
    const encodeMessage = (message) => {
      return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const mailComposer = new MailComposer(mailOptions);
    const message = await mailComposer.compile().build();
    const rawMessage = encodeMessage(message);

    // Send email
    const result = await gmail.users.messages.send({
      userId: 'me',
      resource: { raw: rawMessage },
    });

    return res.status(200).json({ message: 'Email sent successfully', messageId: result.data.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}