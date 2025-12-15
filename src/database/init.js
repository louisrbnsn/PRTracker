import { getDBConnection } from "./database";
import { schemaQueries } from "./schema";

export const initDatabase = () => {
  const db = getDBConnection();

  // Create tables if they don't exist
  schemaQueries.forEach(query => {
    db.execSync(query);
    console.log("Table OK");
  });

  // Run migrations for existing databases
  try {
    // Check if user_id column exists in templates table
    const templatesInfo = db.getAllSync(`PRAGMA table_info(templates)`);
    const hasUserId = templatesInfo.some(col => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log("Adding user_id column to templates table");
      // For existing templates without user_id, we need to add it
      // First check if there are any rows
      const templateCount = db.getFirstSync(`SELECT COUNT(*) as count FROM templates`);
      
      if (templateCount.count === 0) {
        // No data, can safely recreate table
        db.execSync(`DROP TABLE IF EXISTS templates`);
        db.execSync(schemaQueries.find(q => q.includes('CREATE TABLE IF NOT EXISTS templates')));
      } else {
        // Has data - need to add column with default value
        // Since we can't add a NOT NULL column without default, we'll use a workaround
        db.execSync(`ALTER TABLE templates ADD COLUMN user_id INTEGER DEFAULT 1`);
        console.log("Added user_id column to existing templates");
      }
    }

    // Check if rest_timer column exists in template_exercises table
    const templateExercisesInfo = db.getAllSync(`PRAGMA table_info(template_exercises)`);
    const hasRestTimer = templateExercisesInfo.some(col => col.name === 'rest_timer');
    
    if (!hasRestTimer) {
      console.log("Adding rest_timer column to template_exercises table");
      db.execSync(`ALTER TABLE template_exercises ADD COLUMN rest_timer INTEGER DEFAULT 90`);
      console.log("Added rest_timer column to template_exercises");
    }

    // Check if duration column exists in sessions table (should already exist)
    const sessionsInfo = db.getAllSync(`PRAGMA table_info(sessions)`);
    const hasDuration = sessionsInfo.some(col => col.name === 'duration');
    
    if (!hasDuration) {
      console.log("Adding duration column to sessions table");
      db.execSync(`ALTER TABLE sessions ADD COLUMN duration INTEGER`);
      console.log("Added duration column to sessions");
    }
  } catch (error) {
    console.error("Error during database migration:", error);
  }

  return db;
};