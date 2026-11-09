// JWT claims are only a local eligibility check. The backend verifies signatures.
export function sessionExpiration(session) {
  try {
    const claims = JSON.parse(atob(session.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Math.min(session.expiresAt, claims.exp * 1000);
  } catch { return 0; }
}

export function eligibleSession(session, now = Date.now()) {
  try {
    const parts = session.accessToken.split('.');
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return false;
    const decode = part => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    const header = decode(parts[0]);
    const claims = decode(parts[1]);
    return header.alg === 'HS256' && claims.tokenType === 'access' &&
      claims.role === 'passenger' && claims.iss === 'saheli-safar-api' &&
      claims.aud === 'saheli-safar-apps' && /^[a-f0-9]{24}$/i.test(claims.sub) &&
      session.user?.id === claims.sub && session.user?.role === 'passenger' &&
      session.user?.status === 'active' && Number.isFinite(claims.exp) &&
      Number.isFinite(session.expiresAt) && now < Math.min(session.expiresAt, claims.exp * 1000);
  } catch { return false; }
}

export function sessionFromLogin(response, now = Date.now()) {
  let claims;
  try { claims = JSON.parse(atob(response.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); }
  catch { throw new Error('Unable to complete login. Invalid Passenger session.'); }
  const lifetime = Number.isFinite(response.expiresInSeconds) && response.expiresInSeconds > 0
    ? response.expiresInSeconds * 1000 : 14 * 60 * 1000;
  const session = { accessToken: response.accessToken, user: response.user,
    expiresAt: Math.min(now + lifetime, now + 14 * 60 * 1000, claims.exp * 1000) };
  if (response.success !== true || !eligibleSession(session, now)) {
    throw new Error('Unable to complete login. An active Passenger account is required.');
  }
  return session;
}
