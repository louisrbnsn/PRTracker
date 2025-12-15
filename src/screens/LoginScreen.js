import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { getDBConnection } from "../database/database";
import { loginUser } from "../database/users";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    const db = getDBConnection();
    const user = await loginUser(db, email, password);

    if (!user) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    navigation.navigate("MainTabs", { user });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Créer un compte</Text>
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
  error: { color: "red", marginBottom: 10 }
});