// Verifies a Facebook Login access token server-side before trusting it.
// Two calls to the Graph API:
//   1. /debug_token - confirms the token is valid AND was issued for OUR
//      app (using the app access token = APP_ID|APP_SECRET), so a token
//      minted for a different Facebook app can't be replayed against us.
//   2. /me - fetches the profile fields we actually need.
// Uses the platform's built-in fetch (Node 18+), no extra dependency.

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

export const isFacebookAuthConfigured = () =>
  !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

export const verifyFacebookAccessToken = async (accessToken) => {
  const appToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;

  const debugRes = await fetch(
    `${GRAPH_BASE}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appToken)}`
  );
  const debugData = await debugRes.json();

  const tokenInfo = debugData?.data;
  if (
    !tokenInfo ||
    tokenInfo.is_valid !== true ||
    String(tokenInfo.app_id) !== String(process.env.FACEBOOK_APP_ID)
  ) {
    return null;
  }

  const profileRes = await fetch(
    `${GRAPH_BASE}/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`
  );
  const profile = await profileRes.json();

  if (!profile?.id) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email || null, // Facebook may withhold this if unverified or permission denied
    picture: profile.picture?.data?.url || null,
  };
};
