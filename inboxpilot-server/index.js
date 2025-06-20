const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const getAuthenticatedClient = require('./utils/googleClient');
const axios = require('axios');
const mongoose = require('mongoose');
const Rollup = require('./models/Rollup');
const session = require('express-session');
const { google } = require('googleapis');
const cheerio = require('cheerio')
const MongoStore = require('connect-mongo');


dotenv.config();
const app = express();

app.use(express.json());


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));



app.use(cookieParser());

app.use(session({
  secret: process.env.INBOXPILOT_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), 
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

const port = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');

    // Now start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect to Google login
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://mail.google.com/' // full Gmail access
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID
  });

  res.redirect(url);
});

// Step 2: Google redirects here after login
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // For now, just log and confirm it worked
  console.log("🔑 Tokens: ", tokens);

  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true, // Set to true if using production!!!
    sameSite: 'none',
    maxAge: 3600000 * 10

  });

  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true, // Set to true if using production!!!
    sameSite: 'none',
    maxAge: 3600000 * 24 * 30 // 30 days
  });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();
  const email = profile.email;

  await User.findOneAndUpdate(
    { email },
    {
      email,
      refreshToken: tokens.refresh_token,
      rollupFreq: 'weekly' // Default preference
    },
    { upsert: true, new: true }
  );

  // Redirect back to frontend
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

app.get('/me', async (req, res) => {
  const client = getAuthenticatedClient(req);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });

  res.json({
    user: {
      email: req.session?.email || 'user@demo.com',
    },
    rollupFreq: req.session?.rollupFreq || 'weekly',
  });
});

app.post('/me/settings', async (req, res) => {
  req.session.rollupFreq = req.body.rollupFreq;
  res.json({ message: 'Preference updated' });
});

app.get('/logout', (req, res) => {
  if (!req.session) return res.status(400).json({ error: 'No session to destroy' });

  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});
app.get('/me/emails', async (req, res) => {

  const client = getAuthenticatedClient(req);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });

  const gmail = google.gmail({ version: 'v1', auth: client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: '', // you can add filters here
    });

    const messages = response.data.messages || [];

    const emailDetails = await Promise.all(messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',


      });
      

      const headers = detail.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
      const unsubscribe = headers.find(h => h.name.toLowerCase() === 'List-Unsubscribe')?.value || '';

      const rawDate = headers.find(h => h.name === 'Date')?.value || '';
const date = rawDate ? new Date(rawDate).toLocaleString() : 'Unknown Date';



      let unsubscribeLink = '';
      if (unsubscribe.includes('<')) {
        const match = unsubscribe.match(/<([^>]+)>/);;
        if (match?.length) unsubscribeLink = match[0].replace(/[<>]/g, '')
      } else {
        unsubscribeLink = unsubscribe;
      }

      const base64Body = detail.data.payload.parts?.find(
        part => part.mimeType === 'text/html'
      )?.body?.data;

      const htmlBody = base64Body
        ? Buffer.from(base64Body, 'base64').toString('utf-8')
        : '';


      if (!unsubscribeLink && htmlBody) {
        const match = htmlBody.match(/https?:\/\/[^\s"']*unsubscribe[^\s"']*/i);
        if (match) unsubscribeLink = match[0];
      }

      return {
        id: msg.id,
        subject,
        date,
        from,
        unsubscribe: unsubscribeLink,
        htmlBody
      };
    }));

    res.json(emailDetails);
  } catch (err) {
    console.error("Failed to fetch emails", err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

app.post('/me/rollup', async (req, res) => {

  const client = getAuthenticatedClient(req);

  if (!client) return res.status(401).json({ error: 'Unauthorized' });

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data: profile } = await oauth2.userinfo.get();

  const userEmail = profile.email;

  const { id: gmailMessageId, subject, from, } = req.body
  try {
    const gmail = google.gmail({ version: 'v1', auth: client });

    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: gmailMessageId,
      format: 'full',
    });

    const base64Body = detail.data.payload.parts?.find(
      part => part.mimeType === 'text/html'
    )?.body?.data;

    const htmlBody = base64Body
      ? Buffer.from(base64Body, 'base64').toString('utf-8')
      : '';


    await Rollup.create({ gmailMessageId, subject, from, userEmail, htmlBody });
    res.json({ message: 'Rollup successful!' });

  } catch (err) {
    console.error("Failed to rollup email", err);
    res.status(500).json({ error: 'Failed to rollup email' });
  }
});

app.get('/me/rollup', async (req, res) => {
  const client = getAuthenticatedClient(req);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const emails = await Rollup.find().sort({ createdAt: -1 }).lean();
    res.json(emails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB fetch failed' });
  }
});

app.delete('/me/rollup/:id', async (req, res) => {

  const client = getAuthenticatedClient(req);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await Rollup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rollup deleted successfully', result });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete rollup' });
  }
});

app.get('/labels', async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    console.log("Access token:", accessToken);

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/labels', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log("User object:", req.user);
    console.log("Gmail label API response:", data);

    const labels = data.labels || [];

    res.json(labels);
  } catch (err) {
    console.error("Failed to fetch labels", err);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});



app.post('/assign-label', async (req, res) => {
  const { emailId, labelId } = req.body;
  try {
    console.log("aSSIGN BODY", req.body);
    const accessToken = req.cookies.access_token;

    await axios.post(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`, {
      addLabelIds: [labelId],
      removeLabelIds: ['INBOX'], 
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error assigning label:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to assign label' });
  }
});

app.get('/labels/:labelId/emails', async (req, res) => {
  const labelId = req.params.labelId;
  const accessToken = req.cookies.access_token;

  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client }); // Reuse the already-created client


  try {
    const messageList = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [labelId],
      maxResults: 10,
    });

    const messages = messageList.data.messages || [];

    const fullMessages = await Promise.all(messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = detail.data.payload.headers;
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      const from = headers.find((h) => h.name === 'From')?.value || '';

      const base64Body = detail.data.payload.parts?.find(
        part => part.mimeType === 'text/html'
      )?.body?.data;

      const htmlBody = base64Body
        ? Buffer.from(base64Body, 'base64').toString('utf-8')
        : '';

      return {
        id: msg.id,
        subject,
        from,
        htmlBody
      };
    }));

    res.json(fullMessages);
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});


const cron = require('node-cron');

const User = require('./models/User');
cron.schedule('04 23 * * * ', async () => {
  console.log("⏰ Sending weekly rollups...");

  try {
    const users = await User.find({ rollupFreq: 'weekly' });
    console.log(`📦 Found ${users.length} users`);

    for (const user of users) {
      console.log(`📧 Sending to ${user.email}`);

      const emails = await Rollup.find({ userEmail: user.email });
      console.log(`📨 Found ${emails.length} emails`);

      if (emails.length === 0) continue;

      const content = emails.map(email =>
        `<li><b>${email.subject}</b> from ${email.from}</li>`
      ).join('');

      const htmlBody = `
    <h2>Your Weekly Rollup Summary</h2>
    <ul>${content}</ul>
    <p>Thank you for using InboxPilot!</p>
  `;

      oauth2Client.setCredentials({ refresh_token: user.refreshToken });

      const { token } = await oauth2Client.getAccessToken();
      if (!token) {
        console.error(`❌ Could not retrieve access token for ${user.email}`);
        continue;
      }

      oauth2Client.setCredentials({ access_token: token, refresh_token: user.refreshToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });


      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(
            `To: ${user.email}\r\n` +
            `Subject: InboxPilot Weekly Rollup\r\n` +
            `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
            htmlBody
          ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_')
        }
      });

      console.log("✅ Rollup sent!");
      await Rollup.deleteMany({ userEmail: user.email }); // clear user-specific emails
    }

  } catch (err) {
    console.error("❌ Fatal cron error:", err);
  }
});
