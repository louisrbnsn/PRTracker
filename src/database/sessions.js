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

/**
 * Update session duration (in seconds)
 */
export const updateSessionDuration = (sessionId, duration) => {
  const db = getDBConnection();
  db.runSync(
    `UPDATE sessions SET duration = ? WHERE id = ?`,
    [duration, sessionId]
  );
};

/**
 * Get all completed sessions for a user
 */
export const getAllCompletedSessions = (userId) => {
  const db = getDBConnection();
  return db.getAllSync(
    `SELECT * FROM sessions WHERE user_id = ? AND status = 'completed' ORDER BY date DESC`,
    [userId]
  );
};

/**
 * Get session details with exercises and series
 */
export const getSessionDetails = (sessionId) => {
  const db = getDBConnection();
  
  // Get session info
  const session = db.getFirstSync(
    `SELECT * FROM sessions WHERE id = ?`,
    [sessionId]
  );
  
  if (!session) return null;
  
  // Get all series with exercise names
  const series = db.getAllSync(
    `SELECT s.*, e.nom as exercise_name 
     FROM series s 
     JOIN exercises e ON s.exercise_id = e.id 
     WHERE s.session_id = ? 
     ORDER BY s.id`,
    [sessionId]
  );
  
  // Group series by exercise
  const exerciseMap = {};
  series.forEach(set => {
    if (!exerciseMap[set.exercise_id]) {
      exerciseMap[set.exercise_id] = {
        id: set.exercise_id,
        name: set.exercise_name,
        sets: []
      };
    }
    exerciseMap[set.exercise_id].sets.push(set);
  });
  
  return {
    session,
    exercises: Object.values(exerciseMap)
  };
};

/**
 * Delete a series by ID
 */
export const deleteSeries = (seriesId) => {
  const db = getDBConnection();
  db.runSync(
    `DELETE FROM series WHERE id = ?`,
    [seriesId]
  );
};
