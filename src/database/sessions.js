import { getDBConnection } from "./database";

/**
 * Create a new session
 */
export const createSession = (userId, templateId = null) => {
  const db = getDBConnection();
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO sessions (user_id, template_id, date, status) VALUES (?, ?, ?, ?)`,
    [userId, templateId, now, 'en_progress']
  );
  return result.lastInsertRowId;
};

/**
 * Update session status
 */
export const updateSessionStatus = (sessionId, status) => {
  const db = getDBConnection();
  db.runSync(
    `UPDATE sessions SET status = ? WHERE id = ?`,
    [status, sessionId]
  );
};

/**
 * Get session by ID
 */
export const getSessionById = (id) => {
  const db = getDBConnection();
  return db.getFirstSync(
    `SELECT * FROM sessions WHERE id = ?`,
    [id]
  );
};

/**
 * Create a new series (set)
 */
export const createSeries = (sessionId, exerciseId, poids, reps, type = 'normal', RPE = null, note = null) => {
  const db = getDBConnection();
  const result = db.runSync(
    `INSERT INTO series (session_id, exercise_id, poids, reps, type, RPE, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, exerciseId, poids, reps, type, RPE, note]
  );
  return result.lastInsertRowId;
};

/**
 * Get all series for a session
 */
export const getSeriesBySession = (sessionId) => {
  const db = getDBConnection();
  return db.getAllSync(
    `SELECT * FROM series WHERE session_id = ? ORDER BY id`,
    [sessionId]
  );
};

/**
 * Get series for a specific exercise in a session
 */
export const getSeriesByExercise = (sessionId, exerciseId) => {
  const db = getDBConnection();
  return db.getAllSync(
    `SELECT * FROM series WHERE session_id = ? AND exercise_id = ? ORDER BY id`,
    [sessionId, exerciseId]
  );
};
