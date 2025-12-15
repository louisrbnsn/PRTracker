import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import QuickStartSession from "./QuickStartSession"; // importer la séance
import CreateTemplateScreen from "./CreateTemplateScreen";
import { getTemplatesByUser, getTemplateExercises } from "../database/templates";

export default function HomeScreen({ route }) {
  const user = route.params?.user;
  const [sessionVisible, setSessionVisible] = useState(false); // pour le pop-up
  const [createTemplateVisible, setCreateTemplateVisible] = useState(false); // pour créer template
  const [templates, setTemplates] = useState([]); // routines from DB
  const [selectedTemplateId, setSelectedTemplateId] = useState(null); // for starting session with template

  // Load templates from database
  const loadTemplates = () => {
    if (user?.id) {
      try {
        const userTemplates = getTemplatesByUser(user.id);
        // Enrich templates with exercise info
        const templatesWithExercises = userTemplates.map(template => {
          const exercises = getTemplateExercises(template.id);
          return {
            ...template,
            exerciseCount: exercises.length,
            exerciseNames: exercises.slice(0, 3).map(e => e.exercise_name)
          };
        });
        setTemplates(templatesWithExercises);
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    }
  };

  // Load templates on mount and when screen gets focus
  useEffect(() => {
    loadTemplates();
  }, [user]);

  // Reload templates when returning from create template screen
  useEffect(() => {
    if (!createTemplateVisible && !sessionVisible) {
      loadTemplates();
    }
  }, [createTemplateVisible, sessionVisible]);

  // Start session with template
  const handleStartTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setSessionVisible(true);
  };

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

      {/* Modal pleine page pour session */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={sessionVisible}
        onRequestClose={() => {
          setSessionVisible(false);
          setSelectedTemplateId(null);
        }}
      >
        <QuickStartSession 
          onClose={() => {
            setSessionVisible(false);
            setSelectedTemplateId(null);
          }} 
          route={{ params: { user, templateId: selectedTemplateId } }}
        />
      </Modal>

      {/* Modal pour créer une routine */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={createTemplateVisible}
        onRequestClose={() => setCreateTemplateVisible(false)}
      >
        <CreateTemplateScreen
          onClose={() => setCreateTemplateVisible(false)}
          route={{ params: { user } }}
        />
      </Modal>

      {/* ROUTINES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vos routines</Text>
        <TouchableOpacity onPress={() => setCreateTemplateVisible(true)}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routineGrid}>
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune routine pour le moment</Text>
            <Text style={styles.emptyStateSubText}>Appuyez sur "+ Ajouter" pour créer une routine</Text>
          </View>
        ) : (
          templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.routineCard}
              onPress={() => handleStartTemplate(template.id)}
            >
              <Text style={styles.routineName}>{template.nom}</Text>
              <Text style={styles.routineSub}>
                {template.exerciseCount} exercice{template.exerciseCount !== 1 ? 's' : ''}
              </Text>
              {template.exerciseNames && template.exerciseNames.length > 0 && (
                <Text style={styles.routineExercises}>
                  {template.exerciseNames.join(', ')}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
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
    marginBottom: 4,
  },
  routineExercises: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 13,
    color: "#BBB",
  },
});