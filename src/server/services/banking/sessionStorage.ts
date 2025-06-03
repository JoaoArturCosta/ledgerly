/**
 * Session storage for banking providers
 *
 * In a production environment, this should use a secure, persistent storage
 * such as Redis or a database. For this implementation, we'll use a simple
 * in-memory store for demonstration purposes.
 */

// In-memory session storage (replace with database/Redis in production)
const sessions: Record<string, any> = {};

// 30-minute expiration for sessions
const SESSION_EXPIRY_MS = 30 * 60 * 1000;

/**
 * Store session data with the given ID
 */
export async function storeSessionData(
  sessionId: string,
  data: any,
): Promise<void> {
  sessions[sessionId] = {
    ...data,
    expiresAt: Date.now() + SESSION_EXPIRY_MS,
  };
}

/**
 * Retrieve session data for the given ID
 */
export async function getSessionData(sessionId: string): Promise<any> {
  const session = sessions[sessionId];

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.expiresAt < Date.now()) {
    delete sessions[sessionId];
    throw new Error("Session expired");
  }

  return session;
}

/**
 * Update session data for the given ID
 */
export async function updateSessionData(
  sessionId: string,
  data: any,
): Promise<void> {
  const session = sessions[sessionId];

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.expiresAt < Date.now()) {
    delete sessions[sessionId];
    throw new Error("Session expired");
  }

  sessions[sessionId] = {
    ...data,
    expiresAt: Date.now() + SESSION_EXPIRY_MS,
  };
}

/**
 * Delete session data for the given ID
 */
export async function deleteSessionData(sessionId: string): Promise<void> {
  delete sessions[sessionId];
}

/**
 * Clean up expired sessions
 * This should be called periodically in a production environment
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const now = Date.now();

  Object.keys(sessions).forEach((sessionId) => {
    if (sessions[sessionId].expiresAt < now) {
      delete sessions[sessionId];
    }
  });
}
