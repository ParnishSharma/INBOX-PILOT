const { google } = require('googleapis');

function getAuthenticatedClient(req) {
  const access_token = req.session?.accessToken;
  const refresh_token = req.session?.refreshToken;

  if (!access_token || !refresh_token) {
    console.warn("❌ Missing tokens in session:", req.session);
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token,
    refresh_token,
  });

  return oauth2Client;
}

module.exports = getAuthenticatedClient;
