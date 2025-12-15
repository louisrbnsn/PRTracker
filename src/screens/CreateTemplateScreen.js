import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from "react-native";
import { createExercise, getExerciseByName } from "../database/exercises";
import { createTemplate, addExerciseToTemplate } from "../database/templates";

export default function CreateTemplateScreen({ onClose, route }) {
  const user = route?.params?.user || { id: 1 }; // Fallback user
  
  // Template info
  const [templateName, setTemplateName] = useState("");
  
  // Exercise management
  const [exercises, setExercises] = useState([]);
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState("");

  // Add exercise
  const handleAddExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'exercice");
      return;
    }

    try {
      // Check if exercise exists, if not create it
      let exercise = getExerciseByName(exerciseName);
      if (!exercise) {
        const exerciseId = createExercise(exerciseName);
        exercise = { id: exerciseId, nom: exerciseName };
      }

      const newExercise = {
        id: exercise.id,
        nom: exerciseName,
        sets: 3, // Default number of sets
        weight: "",
        reps: "",
        restTimer: 90 // Default 90 seconds
      };

      setExercises([...exercises, newExercise]);
      setExerciseName("");
      setAddExerciseVisible(false);
    } catch (error) {
      console.error("Error adding exercise:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'exercice");
    }
  };

  // Update exercise value
  const updateExerciseValue = (exerciseIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex][field] = value;
    setExercises(updatedExercises);
  };

  // Delete exercise
  const handleDeleteExercise = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(exerciseIndex, 1);
    setExercises(updatedExercises);
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom pour la routine");
      return;
    }

    try {
      // Create template
      const templateId = createTemplate(user.id, templateName);

      // Add exercises to template
      exercises.forEach((exercise, index) => {
        const seriesPred = JSON.stringify({
          sets: parseInt(exercise.sets) || 3,
          weight: exercise.weight,
          reps: exercise.reps
        });
        
        addExerciseToTemplate(
          templateId,
          exercise.id,
          index + 1, // ordre
          seriesPred,
          parseInt(exercise.restTimer) || 90
        );
      });

      Alert.alert(
        "Succès",
        "Routine créée avec succès !",
        [
          {
            text: "OK",
            onPress: () => onClose()
          }
        ]
      );
    } catch (error) {
      console.error("Error saving template:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder la routine");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle Routine</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Template name input */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameLabel}>Nom de la routine</Text>
        <TextInput
          style={styles.nameInput}
          value={templateName}
          onChangeText={setTemplateName}
          placeholder="Ex: Full Body, Push Day..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Exercises list */}
      <ScrollView style={styles.content}>
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseContainer}>
            {/* Exercise header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.nom}</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Supprimer l'exercice",
                    "Voulez-vous vraiment supprimer cet exercice ?",
                    [
                      { text: "Annuler", style: "cancel" },
                      { 
                        text: "Supprimer", 
                        style: "destructive",
                        onPress: () => handleDeleteExercise(exerciseIndex)
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.deleteButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Exercise configuration */}
            <View style={styles.configRow}>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Séries</Text>
                <TextInput
                  style={styles.configInput}
                  value={exercise.sets.toString()}
                  onChangeText={(value) => updateExerciseValue(exerciseIndex, "sets", value)}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>

              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Poids (kg)</Text>
                <TextInput
                  style={styles.configInput}
                  value={exercise.weight}
                  onChangeText={(value) => updateExerciseValue(exerciseIndex, "weight", value)}
                  keyboardType="numeric"
                  placeholder="Opt."
                />
              </View>

              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Reps</Text>
                <TextInput
                  style={styles.configInput}
                  value={exercise.reps}
                  onChangeText={(value) => updateExerciseValue(exerciseIndex, "reps", value)}
                  keyboardType="numeric"
                  placeholder="Opt."
                />
              </View>

              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Repos (s)</Text>
                <TextInput
                  style={styles.configInput}
                  value={exercise.restTimer.toString()}
                  onChangeText={(value) => updateExerciseValue(exerciseIndex, "restTimer", value)}
                  keyboardType="numeric"
                  placeholder="90"
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add exercise button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setAddExerciseVisible(true)}
        >
          <Text style={styles.addExerciseButtonText}>+ AJOUTER EXERCICE</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveTemplate}
      >
        <Text style={styles.saveButtonText}>ENREGISTRER LA ROUTINE</Text>
      </TouchableOpacity>

      {/* Modal Add Exercise */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addExerciseVisible}
        onRequestClose={() => setAddExerciseVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nom de l'exercice</Text>
            <TextInput
              style={styles.exerciseInput}
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Ex: Squat (Barbell)"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#3B82F6" }]}
                onPress={handleAddExercise}
              >
                <Text style={styles.modalButtonText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setAddExerciseVisible(false);
                  setExerciseName("");
                }}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
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
    backgroundColor: "#F6F7FB",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  nameContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  exerciseContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },
  deleteButton: {
    fontSize: 24,
    color: "#FF4444",
    fontWeight: "600",
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  configItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  configLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  configInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: "center",
  },
  addExerciseButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  addExerciseButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  exerciseInput: {
    width: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
