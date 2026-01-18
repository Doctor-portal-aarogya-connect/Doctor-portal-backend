import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

/* ================= COMPONENT ================= */

export default function PatientRecord() {
  const insets = useSafeAreaInsets();

  // Route param
  const { patientData } = useLocalSearchParams();

  // Patient state
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (patientData) {
      try {
        const parsedPatient = JSON.parse(patientData as string);
        setPatient(parsedPatient);
      } catch (error) {
        console.log("Failed to parse patient data", error);
      }
    }
  }, [patientData]);

  // Loading state
  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading patient records...</Text>
      </View>
    );
  }

  const hasRecords = patient.records && patient.records.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#F8FAFC", "#EEF2FF", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER WITH BACK BUTTON */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.recordArea}>
        {/* PATIENT INFO */}
        <View style={styles.patientInfo}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.meta}>
            Age {patient.age} • {patient.phone}
          </Text>
        </View>

        {/* ✅ NO RECORDS FOUND */}
        {!hasRecords && (
          <View style={styles.noRecordBox}>
            <Feather name="file-text" size={32} color="#94A3B8" />
            <Text style={styles.noRecordText}>No records found</Text>
          </View>
        )}

        {/* ✅ RECORD LIST */}
        {hasRecords &&
          patient.records.map((rec: any) => (
            <View key={rec.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordType}>
                  {rec.origin === "appointment"
                    ? "Appointment"
                    : "Chatbot Query"}
                </Text>
                <Text style={styles.recordDate}>
                  {rec.date} • {rec.time}
                </Text>
              </View>

              <Text style={styles.issue}>{rec.type}</Text>
              <Text style={styles.desc}>{rec.description}</Text>

              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>Doctor Response</Text>
                <Text style={styles.rx}>Rx: {rec.prescription}</Text>
                <Text style={styles.advice}>Advice: {rec.advice}</Text>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E293B",
  },

  recordArea: {
    padding: 20,
    paddingBottom: 40,
  },

  patientInfo: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  name: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E293B",
  },

  meta: {
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },

  noRecordBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  noRecordText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  recordCard: {
    backgroundColor: "#F8FAFC",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  recordType: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366F1",
    textTransform: "uppercase",
  },

  recordDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },

  issue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },

  desc: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },

  responseBox: {
    backgroundColor: "#EEF2FF",
    padding: 14,
    borderRadius: 16,
  },

  responseLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4F46E5",
    marginBottom: 6,
  },

  rx: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  advice: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
});
