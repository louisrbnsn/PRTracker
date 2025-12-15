import { getDBConnection } from "./database";
import { schemaQueries } from "./schema";

export const initDatabase = () => {
  const db = getDBConnection();

  schemaQueries.forEach(query => {
    db.execSync(query);
    console.log("Table OK");
  });

  return db;
};