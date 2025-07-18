import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const calendar = google.calendar('v3');

// Load service account key
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',  // path to the downloaded JSON
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

export const createCalendarEvent = async ({ summary, description, location, start, end }) => {
  const authClient = await auth.getClient();

  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  const event = {
    summary,
    description,
    location,
    start: {
      dateTime: start,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: end,
      timeZone: 'Asia/Kolkata',
    },
  };

  return calendar.events.insert({
    auth: authClient,
    calendarId,
    requestBody: event,
  });
};
