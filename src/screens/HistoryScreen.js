import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllCompletedSessions, getSessionDetails } from "../database/sessions";

export default function HistoryScreen({ route }) {
  const user = route.params?.user;
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Reload sessions when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [user])
  );

  const loadSessions = () => {
    try {
      if (user?.id) {
        const completedSessions = getAllCompletedSessions(user.id);
        setSessions(completedSessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const openSessionDetail = (sessionId) => {
    try {
      const details = getSessionDetails(sessionId);
      if (details) {
        setSelectedSession(details);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error loading session details:", error);
    }
  };

  const getSetTypeLabel = (type, index) => {
    const num = index + 1;
    switch (type) {
      case "warmup": return `W${num}`;
      case "failure": return `F${num}`;
      case "PR": return `P${num}`;
      case "dropset": return `D${num}`;
      default: return num;
    }
  };

  const getSetTypeColor = (type) => {
    switch (type) {
      case "warmup": return "#FFA500";
      case "failure": return "#FF4444";
      case "PR": return "#FFD700";
      case "dropset": return "#9B59B6";
      default: return "#3B82F6";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune séance complétée</Text>
            <Text style={styles.emptySubText}>
              Vos séances terminées apparaîtront ici
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            // Get details for summary
            const details = getSessionDetails(session.id);
            const exerciseCount = details?.exercises?.length || 0;

            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => openSessionDetail(session.id)}
              >
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.duration)}
                  </Text>
                </View>
                <Text style={styles.sessionSummary}>
                  {exerciseCount} {exerciseCount > 1 ? "exercices" : "exercice"}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Session Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedSession && (
          <View style={styles.detailContainer}>
            {/* Header */}
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Détails de la séance</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Text style={styles.closeButton}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Session info */}
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionInfoDate}>
                {formatDate(selectedSession.session.date)}
              </Text>
              <Text style={styles.sessionInfoDuration}>
                Durée: {formatDuration(selectedSession.session.duration)}
              </Text>
            </View>

            {/* Exercises and sets */}
            <ScrollView style={styles.detailContent}>
              {selectedSession.exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseDetailContainer}>
                  <Text style={styles.exerciseDetailName}>{exercise.name}</Text>

                  {/* Sets table header */}
                  <View style={styles.setsHeader}>
                    <Text style={[styles.setsHeaderText, { flex: 1 }]}>SET</Text>
                    <Text style={[styles.setsHeaderText, { flex: 2 }]}>KG</Text>
                    <Text style={[styles.setsHeaderText, { flex: 2 }]}>REPS</Text>
                    <Text style={[styles.setsHeaderText, { flex: 1.5 }]}>RPE</Text>
                  </View>

                  {/* Sets */}
                  {exercise.sets.map((set, setIndex) => (
                    <View key={set.id} style={styles.setDetailRow}>
                      <View
                        style={[
                          styles.setDetailNumber,
                          { backgroundColor: getSetTypeColor(set.type) }
                        ]}
                      >
                        <Text style={styles.setDetailNumberText}>
                          {getSetTypeLabel(set.type, setIndex)}
                        </Text>
                      </View>

                      <Text style={styles.setDetailValue}>{set.poids || "-"}</Text>
                      <Text style={styles.setDetailValue}>{set.reps || "-"}</Text>
                      <Text style={styles.setDetailValue}>
                        {set.RPE ? set.RPE.toFixed(1) : "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
  },
  sessionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sessionSummary: {
    fontSize: 14,
    color: "#666",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  closeButton: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  sessionInfo: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sessionInfoDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  sessionInfoDuration: {
    fontSize: 16,
    color: "#666",
  },
  detailContent: {
    flex: 1,
  },
  exerciseDetailContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  exerciseDetailName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 8,
  },
  setsHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
  },
  setDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setDetailNumber: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  setDetailNumberText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  setDetailValue: {
    flex: 2,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
});
