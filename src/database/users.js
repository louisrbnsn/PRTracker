import sha256 from "js-sha256";

export const createUser = (db, { nom, email, password }) => {
  const password_hash = sha256(password);

  const result = db.runSync(
    `INSERT INTO users (nom, email, password_hash) VALUES (?, ?, ?)`,
    [nom, email, password_hash]
  );
};

export const getUserByEmail = (db, email) => {
  return db.getFirstSync(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
};

export const loginUser = (db, email, password) => {
  const user = getUserByEmail(db, email);
  if (!user) return null;

  const hash = sha256(password);
  return user.password_hash === hash ? user : null;
};