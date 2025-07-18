import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendTaskNotification = async ({
    to,
    subject,
    text,
    taskTitle,
    taskDescription,
    taskEndDate,
}) => {
    let emailBody = text;
    let htmlBody = text;

    if (taskEndDate && taskTitle) {
        const end = new Date(taskEndDate);
        const year = end.getFullYear();
        const month = String(end.getMonth() + 1).padStart(2, '0');
        const day = String(end.getDate()).padStart(2, '0');

        const calendarId = process.env.GOOGLE_CALENDAR_ID;
        const calendarLink = `https://calendar.google.com/calendar/u/0/r/day/${year}/${month}/${day}?cid=${encodeURIComponent(calendarId)}`;

        emailBody = `
Task Assigned: ${taskTitle}
Description: ${taskDescription || 'N/A'}
End Date: ${day}-${month}-${year}
View on Calendar: ${calendarLink}
    `.trim();

        htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #2972a6; color: white; padding: 16px 24px;">
            <h2 style="margin: 0;">Smart Task Notification</h2>
          </div>
          <div style="padding: 24px;">
          <h2 style="color:  #004576ff">New Task Assigned</h2>
            <h3 style="color: #333;">📝 ${taskTitle}</h3>
            <p><strong>Description:</strong> ${taskDescription || 'N/A'}</p>
            <p><strong>Deadline:</strong> ${day}-${month}-${year}</p>
            <p>
              <a href="${calendarLink}" target="_blank" style="display: inline-block; background-color: #2972a6; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                📅 View on Calendar
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
    }

    const mailOptions = {
        from: `"Task Manager" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: emailBody,
        html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
};
