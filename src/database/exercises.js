import { getDBConnection } from "./database";

/**
 * Create a new exercise
 */
export const createExercise = (nom, categorie = null, description = null, image = null) => {
  const db = getDBConnection();
  const result = db.runSync(
    `INSERT INTO exercises (nom, categorie, description, image) VALUES (?, ?, ?, ?)`,
    [nom, categorie, description, image]
  );
  return result.lastInsertRowId;
};

/**
 * Get an exercise by ID
 */
export const getExerciseById = (id) => {
  const db = getDBConnection();
  return db.getFirstSync(
    `SELECT * FROM exercises WHERE id = ?`,
    [id]
  );
};

/**
 * Get all exercises
 */
export const getAllExercises = () => {
  const db = getDBConnection();
  return db.getAllSync(`SELECT * FROM exercises ORDER BY nom`);
};

/**
 * Get exercise by name
 */
export const getExerciseByName = (nom) => {
  const db = getDBConnection();
  return db.getFirstSync(
    `SELECT * FROM exercises WHERE nom = ?`,
    [nom]
  );
};
