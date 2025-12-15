import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import QuickStartSession from "./QuickStartSession"; // importer la séance

export default function HomeScreen({ route }) {
  const user = route.params?.user;
  const [sessionVisible, setSessionVisible] = useState(false); // pour le pop-up

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      {/* HEADER + LOGO */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../img/logoPRTracker3.png")}
          style={styles.logoLarge}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.welcome}>Bonjour</Text>
          <Text style={styles.username}>{user?.nom}</Text>
        </View>
      </View>

      {/* QUICK START */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Start</Text>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => setSessionVisible(true)}
        >
          <Text style={styles.mainButtonText}>Commencer une séance</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pleine page */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={sessionVisible}
        onRequestClose={() => setSessionVisible(false)}
      >
        <QuickStartSession onClose={() => setSessionVisible(false)} />
      </Modal>

      {/* ROUTINES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vos routines</Text>
        <TouchableOpacity>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routineGrid}>
        <View style={styles.routineCard}>
          <Text style={styles.routineName}>Full Body</Text>
          <Text style={styles.routineSub}>Squats, Rowing, Bench Press</Text>
        </View>

        <View style={styles.routineCard}>
          <Text style={styles.routineName}>Push Day</Text>
          <Text style={styles.routineSub}>Développé militaire, Dips</Text>
        </View>

        <View style={styles.routineCard}>
          <Text style={styles.routineName}>Leg Day</Text>
          <Text style={styles.routineSub}>Squats, Presse, Fentes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  /* HEADER + LOGO */
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  headerText: {
    marginLeft: 15,
  },
  welcome: {
    fontSize: 22,
    color: "#777",
  },
  username: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
  },
  logoLarge: {
    width: 120,
    height: 120,
  },

  /* QUICK START */
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  mainButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  mainButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  /* ROUTINES */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  addButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },

  routineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  routineCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  routineName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  routineSub: {
    fontSize: 12,
    color: "#666",
  },
});