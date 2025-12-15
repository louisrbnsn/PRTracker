import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";

export default function QuickStartSession({ onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [confirmFinishVisible, setConfirmFinishVisible] = useState(false);
  const [confirmAbandonVisible, setConfirmAbandonVisible] = useState(false);

  // Timer automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formater le temps
  const formatTime = sec => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Header avec Terminer */}
      <View style={styles.header}>
        <Text style={styles.title}>Séance en cours</Text>
        <TouchableOpacity onPress={() => setConfirmFinishVisible(true)}>
          <Text style={styles.finishButton}>Terminer</Text>
        </TouchableOpacity>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
      </View>

      {/* Contenu de la séance */}
      <View style={styles.content}>
        <Text style={styles.exercise}>Exercice en cours: Squats</Text>
        <Text style={styles.exercise}>Rowing</Text>
        <Text style={styles.exercise}>Bench Press</Text>
      </View>

      {/* Bouton Abandonner */}
      <TouchableOpacity
        style={styles.abandonButton}
        onPress={() => setConfirmAbandonVisible(true)}
      >
        <Text style={styles.abandonText}>Abandonner</Text>
      </TouchableOpacity>

      {/* Modal confirmation Terminer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmFinishVisible}
        onRequestClose={() => setConfirmFinishVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>
              Voulez-vous sauvegarder votre séance ?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#3B82F6" }]}
                onPress={() => {
                  setConfirmFinishVisible(false);
                  setTimeout(() => {
                    onClose(); // retourne à l'accueil après 50ms
                  }, 50);
                }}
              >
                <Text style={styles.confirmButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#ccc" }]}
                onPress={() => setConfirmFinishVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal confirmation Abandonner */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmAbandonVisible}
        onRequestClose={() => setConfirmAbandonVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>
              Voulez-vous vraiment abandonner votre séance ?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "red" }]}
                onPress={() => {
                  setConfirmAbandonVisible(false);
                  setTimeout(() => {
                    onClose(); // retourne à l'accueil après 50ms
                  }, 50);
                }}
              >
                <Text style={styles.confirmButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#ccc" }]}
                onPress={() => setConfirmAbandonVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  finishButton: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    backgroundColor: "green",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  exercise: {
    fontSize: 18,
    marginBottom: 20,
  },
  abandonButton: {
    backgroundColor: "red",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  abandonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});