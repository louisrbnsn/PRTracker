import { getDBConnection } from "./database";

/**
 * Create a new template
 */
export const createTemplate = (userId, nom, description = null) => {
  const db = getDBConnection();
  const result = db.runSync(
    `INSERT INTO templates (user_id, nom, description) VALUES (?, ?, ?)`,
    [userId, nom, description]
  );
  return result.lastInsertRowId;
};

/**
 * Get all templates for a user
 */
export const getTemplatesByUser = (userId) => {
  const db = getDBConnection();
  return db.getAllSync(
    `SELECT * FROM templates WHERE user_id = ? ORDER BY nom`,
    [userId]
  );
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
  const db = getDBConnection();
  return db.getFirstSync(
    `SELECT * FROM templates WHERE id = ?`,
    [templateId]
  );
};

/**
 * Add an exercise to a template
 */
export const addExerciseToTemplate = (templateId, exerciseId, ordre, seriesPred = null, restTimer = 90) => {
  const db = getDBConnection();
  const result = db.runSync(
    `INSERT INTO template_exercises (template_id, exercise_id, ordre, series_pred, rest_timer) 
     VALUES (?, ?, ?, ?, ?)`,
    [templateId, exerciseId, ordre, seriesPred, restTimer]
  );
  return result.lastInsertRowId;
};

/**
 * Get all exercises for a template with exercise details
 */
export const getTemplateExercises = (templateId) => {
  const db = getDBConnection();
  return db.getAllSync(
    `SELECT te.*, e.nom as exercise_name, e.categorie, e.description, e.image
     FROM template_exercises te
     JOIN exercises e ON te.exercise_id = e.id
     WHERE te.template_id = ?
     ORDER BY te.ordre`,
    [templateId]
  );
};

/**
 * Get exercise count for a template
 */
export const getTemplateExerciseCount = (templateId) => {
  const db = getDBConnection();
  const result = db.getFirstSync(
    `SELECT COUNT(*) as count FROM template_exercises WHERE template_id = ?`,
    [templateId]
  );
  return result ? result.count : 0;
};

/**
 * Delete a template (cascade will delete template_exercises)
 */
export const deleteTemplate = (templateId) => {
  const db = getDBConnection();
  db.runSync(
    `DELETE FROM templates WHERE id = ?`,
    [templateId]
  );
};

/**
 * Update template
 */
export const updateTemplate = (templateId, nom, description = null) => {
  const db = getDBConnection();
  db.runSync(
    `UPDATE templates SET nom = ?, description = ? WHERE id = ?`,
    [nom, description, templateId]
  );
};

/**
 * Delete an exercise from a template
 */
export const deleteTemplateExercise = (templateExerciseId) => {
  const db = getDBConnection();
  db.runSync(
    `DELETE FROM template_exercises WHERE id = ?`,
    [templateExerciseId]
  );
};
