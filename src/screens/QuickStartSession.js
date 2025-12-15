import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from "react-native";
import { createExercise, getExerciseByName } from "../database/exercises";
import { createSession, createSeries, updateSessionStatus, updateSessionDuration, deleteSeries } from "../database/sessions";

export default function QuickStartSession({ onClose, route }) {
  const user = route?.params?.user || { id: 1 }; // Fallback user
  const [seconds, setSeconds] = useState(0);
  const [confirmFinishVisible, setConfirmFinishVisible] = useState(false);
  const [confirmAbandonVisible, setConfirmAbandonVisible] = useState(false);
  
  // Exercise management
  const [exercises, setExercises] = useState([]);
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  
  // Set type modal
  const [setTypeModalVisible, setSetTypeModalVisible] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  
  // RPE modal
  const [rpeModalVisible, setRpeModalVisible] = useState(false);
  const [selectedSetForRPE, setSelectedSetForRPE] = useState(null);
  
  // Session ID
  const [sessionId, setSessionId] = useState(null);
  
  // Rest timer
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [activeExerciseForRest, setActiveExerciseForRest] = useState(null);

  // Create session on mount
  useEffect(() => {
    try {
      const newSessionId = createSession(user.id);
      setSessionId(newSessionId);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }, []);

  // Timer automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Rest timer
  useEffect(() => {
    if (restTimerActive && restTimeLeft > 0) {
      const interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            setActiveExerciseForRest(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimerActive, restTimeLeft]);

  // Formater le temps
  const formatTime = sec => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

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
        sets: [
          { id: Date.now(), setNumber: 1, weight: "", reps: "", type: "normal", completed: false, rpe: null, dbId: null }
        ],
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

  // Add set to exercise
  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    const lastSetNumber = updatedExercises[exerciseIndex].sets.length;
    updatedExercises[exerciseIndex].sets.push({
      id: Date.now(),
      setNumber: lastSetNumber + 1,
      weight: "",
      reps: "",
      type: "normal",
      completed: false,
      rpe: null,
      dbId: null
    });
    setExercises(updatedExercises);
  };

  // Update set value
  const updateSetValue = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  // Open set type modal
  const openSetTypeModal = (exerciseIndex, setIndex) => {
    setSelectedSet({ exerciseIndex, setIndex });
    setSetTypeModalVisible(true);
  };

  // Change set type
  const changeSetType = (type) => {
    if (selectedSet) {
      const updatedExercises = [...exercises];
      updatedExercises[selectedSet.exerciseIndex].sets[selectedSet.setIndex].type = type;
      setExercises(updatedExercises);
    }
    setSetTypeModalVisible(false);
    setSelectedSet(null);
  };

  // Open RPE modal
  const openRPEModal = (exerciseIndex, setIndex) => {
    setSelectedSetForRPE({ exerciseIndex, setIndex });
    setRpeModalVisible(true);
  };

  // Change RPE value
  const changeRPE = (rpeValue) => {
    if (selectedSetForRPE) {
      const updatedExercises = [...exercises];
      updatedExercises[selectedSetForRPE.exerciseIndex].sets[selectedSetForRPE.setIndex].rpe = rpeValue;
      setExercises(updatedExercises);
    }
    setRpeModalVisible(false);
    setSelectedSetForRPE(null);
  };

  // Get RPE description
  const getRPEDescription = (rpe) => {
    const descriptions = {
      6: "Vous pouviez faire encore 4 reps ou plus",
      6.5: "Vous pouviez faire 3 ou 4 reps de plus",
      7: "Vous pouviez faire 3 reps de plus",
      7.5: "Vous pouviez faire 2 ou 3 reps de plus",
      8: "Vous pouviez faire 2 reps de plus",
      8.5: "Vous pouviez faire 1 ou 2 reps de plus",
      9: "Vous pouviez faire 1 rep de plus",
      9.5: "Vous auriez pu faire 1 rep de plus avec difficulté",
      10: "Échec musculaire complet, impossible de faire une rep de plus"
    };
    return descriptions[rpe] || "";
  };

  // Complete set
  const completeSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    
    if (!set.weight || !set.reps) {
      Alert.alert("Erreur", "Veuillez remplir le poids et les répétitions");
      return;
    }

    set.completed = !set.completed;
    setExercises(updatedExercises);

    // Save to database if completed
    if (set.completed && sessionId) {
      try {
        const dbId = createSeries(
          sessionId,
          updatedExercises[exerciseIndex].id,
          parseFloat(set.weight) || 0,
          parseInt(set.reps) || 0,
          set.type,
          set.rpe,
          null
        );
        
        // Store database ID for potential deletion
        updatedExercises[exerciseIndex].sets[setIndex].dbId = dbId;
        setExercises(updatedExercises);

        // Start rest timer
        const restTime = updatedExercises[exerciseIndex].restTimer;
        if (restTime > 0) {
          setRestTimeLeft(restTime);
          setRestTimerActive(true);
          setActiveExerciseForRest(exerciseIndex);
        }
      } catch (error) {
        console.error("Error saving set:", error);
      }
    }
  };

  // Update rest timer
  const updateRestTimer = (exerciseIndex, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].restTimer = parseInt(value) || 0;
    setExercises(updatedExercises);
  };

  // Get set type color
  const getSetTypeColor = (type) => {
    switch (type) {
      case "warmup": return "#FFA500";
      case "failure": return "#FF4444";
      case "PR": return "#FFD700";
      case "dropset": return "#9B59B6";
      default: return "#3B82F6";
    }
  };

  // Get set type label
  const getSetTypeLabel = (type, setNumber) => {
    switch (type) {
      case "warmup": return `W${setNumber}`;
      case "failure": return `F${setNumber}`;
      case "PR": return `P${setNumber}`;
      case "dropset": return `D${setNumber}`;
      default: return setNumber;
    }
  };

  // Delete set
  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    
    // Delete from database if it was saved
    if (set.dbId) {
      try {
        deleteSeries(set.dbId);
      } catch (error) {
        console.error("Error deleting series from database:", error);
      }
    }
    
    // Remove from local state
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // Renumber remaining sets
    updatedExercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    
    setExercises(updatedExercises);
  };

  // Finish session
  const handleFinishSession = () => {
    if (sessionId) {
      try {
        updateSessionStatus(sessionId, 'completed');
        updateSessionDuration(sessionId, seconds); // Save duration in seconds
      } catch (error) {
        console.error("Error finishing session:", error);
      }
    }
    setConfirmFinishVisible(false);
    setTimeout(() => {
      onClose();
    }, 50);
  };

  // Abandon session
  const handleAbandonSession = () => {
    if (sessionId) {
      try {
        updateSessionStatus(sessionId, 'cancelled');
      } catch (error) {
        console.error("Error abandoning session:", error);
      }
    }
    setConfirmAbandonVisible(false);
    setTimeout(() => {
      onClose();
    }, 50);
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
        {restTimerActive && (
          <View style={styles.restTimerContainer}>
            <Text style={styles.restTimerLabel}>Repos</Text>
            <Text style={styles.restTimer}>{formatTime(restTimeLeft)}</Text>
          </View>
        )}
      </View>

      {/* Contenu de la séance */}
      <ScrollView style={styles.content}>
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseContainer}>
            {/* Exercise header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.nom}</Text>
              <View style={styles.restTimerInput}>
                <Text style={styles.restTimerInputLabel}>Repos (s):</Text>
                <TextInput
                  style={styles.restTimerInputField}
                  value={exercise.restTimer.toString()}
                  onChangeText={(value) => updateRestTimer(exerciseIndex, value)}
                  keyboardType="numeric"
                  placeholder="90"
                />
              </View>
            </View>

            {/* Sets table header */}
            <View style={styles.setsHeader}>
              <Text style={[styles.setsHeaderText, { flex: 1 }]}>SET</Text>
              <Text style={[styles.setsHeaderText, { flex: 2 }]}>KG</Text>
              <Text style={[styles.setsHeaderText, { flex: 2 }]}>REPS</Text>
              <Text style={[styles.setsHeaderText, { flex: 1.5 }]}>RPE</Text>
              <View style={{ flex: 1 }} />
            </View>
            
            {exercise.sets.length > 0 && (
              <Text style={styles.hintText}>Appui long pour supprimer une série</Text>
            )}

            {/* Sets */}
            {exercise.sets.map((set, setIndex) => (
              <View key={set.id} style={styles.setRowWrapper}>
                <TouchableOpacity
                  style={styles.setRow}
                  onLongPress={() => {
                    Alert.alert(
                      "Supprimer la série",
                      "Voulez-vous vraiment supprimer cette série ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        { 
                          text: "Supprimer", 
                          style: "destructive",
                          onPress: () => handleDeleteSet(exerciseIndex, setIndex)
                        }
                      ]
                    );
                  }}
                  activeOpacity={0.8}
                  delayLongPress={500}
                >
                  <TouchableOpacity
                    style={[styles.setNumberButton, { backgroundColor: getSetTypeColor(set.type) }]}
                    onPress={() => openSetTypeModal(exerciseIndex, setIndex)}
                  >
                    <Text style={styles.setNumberText}>
                      {getSetTypeLabel(set.type, set.setNumber)}
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.setInput}
                    value={set.weight}
                    onChangeText={(value) => updateSetValue(exerciseIndex, setIndex, "weight", value)}
                    keyboardType="numeric"
                    placeholder="-"
                    editable={!set.completed}
                  />

                  <TextInput
                    style={styles.setInput}
                    value={set.reps}
                    onChangeText={(value) => updateSetValue(exerciseIndex, setIndex, "reps", value)}
                    keyboardType="numeric"
                    placeholder="-"
                    editable={!set.completed}
                  />

                  <TouchableOpacity
                    style={styles.rpeButton}
                    onPress={() => openRPEModal(exerciseIndex, setIndex)}
                    disabled={set.completed}
                  >
                    <Text style={[styles.rpeButtonText, set.rpe && styles.rpeButtonTextFilled]}>
                      {set.rpe ? set.rpe.toFixed(1) : "-"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => completeSet(exerciseIndex, setIndex)}
                  >
                    <Text style={[styles.checkmark, set.completed && styles.checkmarkCompleted]}>
                      {set.completed ? "✓" : "○"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add set button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(exerciseIndex)}
            >
              <Text style={styles.addSetButtonText}>+ AJOUTER SÉRIE</Text>
            </TouchableOpacity>
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

      {/* Bouton Abandonner */}
      <TouchableOpacity
        style={styles.abandonButton}
        onPress={() => setConfirmAbandonVisible(true)}
      >
        <Text style={styles.abandonText}>Abandonner</Text>
      </TouchableOpacity>

      {/* Modal Add Exercise */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addExerciseVisible}
        onRequestClose={() => setAddExerciseVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>Nom de l'exercice</Text>
            <TextInput
              style={styles.exerciseInput}
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Ex: Squat (Barbell)"
              autoFocus
            />
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#3B82F6" }]}
                onPress={handleAddExercise}
              >
                <Text style={styles.confirmButtonText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setAddExerciseVisible(false);
                  setExerciseName("");
                }}
              >
                <Text style={styles.confirmButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Set Type */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={setTypeModalVisible}
        onRequestClose={() => setSetTypeModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>Type de série</Text>
            <View style={styles.setTypeButtons}>
              <TouchableOpacity
                style={[styles.setTypeButton, { backgroundColor: "#3B82F6" }]}
                onPress={() => changeSetType("normal")}
              >
                <Text style={styles.setTypeButtonText}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.setTypeButton, { backgroundColor: "#FFA500" }]}
                onPress={() => changeSetType("warmup")}
              >
                <Text style={styles.setTypeButtonText}>Warmup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.setTypeButton, { backgroundColor: "#FF4444" }]}
                onPress={() => changeSetType("failure")}
              >
                <Text style={styles.setTypeButtonText}>Failure</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.setTypeButton, { backgroundColor: "#FFD700" }]}
                onPress={() => changeSetType("PR")}
              >
                <Text style={styles.setTypeButtonText}>PR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.setTypeButton, { backgroundColor: "#9B59B6" }]}
                onPress={() => changeSetType("dropset")}
              >
                <Text style={styles.setTypeButtonText}>Dropset</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "#ccc", marginTop: 15 }]}
              onPress={() => setSetTypeModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal RPE */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rpeModalVisible}
        onRequestClose={() => setRpeModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmContainer, { maxHeight: '80%' }]}>
            <Text style={styles.confirmText}>Sélectionner RPE</Text>
            <Text style={styles.rpeSubText}>Rate of Perceived Exertion</Text>
            
            <ScrollView style={styles.rpeScrollView} showsVerticalScrollIndicator={true}>
              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpeValue) => (
                <TouchableOpacity
                  key={rpeValue}
                  style={styles.rpeOption}
                  onPress={() => changeRPE(rpeValue)}
                >
                  <Text style={styles.rpeValue}>RPE {rpeValue}</Text>
                  <Text style={styles.rpeDescription}>{getRPEDescription(rpeValue)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "#ccc", marginTop: 15 }]}
              onPress={() => setRpeModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                onPress={handleFinishSession}
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
                onPress={handleAbandonSession}
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
    marginBottom: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111",
  },
  restTimerContainer: {
    marginTop: 10,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  restTimerLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 10,
  },
  restTimer: {
    color: "white",
    fontWeight: "700",
    fontSize: 20,
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
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },
  restTimerInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  restTimerInputLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 5,
  },
  restTimerInputField: {
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    width: 50,
    textAlign: "center",
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
  hintText: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  setRowWrapper: {
    marginBottom: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  setNumberButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  setNumberText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  setInput: {
    flex: 2,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
    textAlign: "center",
  },
  checkButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 28,
    color: "#ccc",
  },
  checkmarkCompleted: {
    color: "#4CAF50",
  },
  addSetButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addSetButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  confirmText: {
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
  setTypeButtons: {
    width: "100%",
    marginBottom: 10,
  },
  setTypeButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  setTypeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  setRowWrapper: {
    marginBottom: 8,
  },
  rpeButton: {
    flex: 1.5,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rpeButtonText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
  },
  rpeButtonTextFilled: {
    color: "#3B82F6",
  },
  rpeSubText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  rpeScrollView: {
    width: "100%",
    maxHeight: 400,
  },
  rpeOption: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    width: "100%",
  },
  rpeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  rpeDescription: {
    fontSize: 13,
    color: "#666",
  },
});