import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AccountScreen({ route, navigation }) {
  const user = route.params?.user;

  const logout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Compte</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nom :</Text>
        <Text style={styles.value}>{user?.nom}</Text>

        <Text style={styles.label}>Email :</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  label: {
    fontSize: 15,
    color: "#777",
    marginTop: 10,
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});