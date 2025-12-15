import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getDBConnection } from "../database/database";
import { createUser, getUserByEmail } from "../database/users";

export default function SignupScreen({ navigation }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const validateNom = (nom) => {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    return re.test(nom.trim());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const onSignup = async () => {
    setError("");
    setSuccess("");

    if (!validateNom(nom)) {
      setError("Le nom doit contenir uniquement des lettres.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Adresse email invalide.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Le mot de passe doit faire au moins 8 caractères, avec au moins une lettre et un chiffre.");
      return;
    }

    const db = getDBConnection();
    const existing = await getUserByEmail(db, email);
    if (existing) {
      setError("Cet email est déjà utilisé.");
      return;
    }

    try {
      createUser(db, { nom, email, password });
      setSuccess("Compte créé, vous pouvez vous connecter.");
      setNom("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.log(err);
      setError("Erreur lors de l'inscription.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <TextInput style={styles.input} placeholder="Nom" value={nom} onChangeText={setNom} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry={true} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={onSignup}>
        <Text style={styles.btnText}>Créer un compte</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Déjà un compte ? Connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, marginBottom: 12, borderRadius: 8 },
  btn: { backgroundColor: "black", padding: 15, borderRadius: 8, width: "100%", marginTop: 10 },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  link: { marginTop: 20, color: "blue" },
  error: { color: "red", marginBottom: 10 },
  success: { color: "green", marginBottom: 10 }
});