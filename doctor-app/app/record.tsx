import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

/* ================= MOCK DATA ================= */

const PATIENTS = [
    {
        patientId: "P-001",
        name: "Rahul Sharma",
        age: 28,
        phone: "+91 98765 43210",
        records: [
            {
                id: "R-101",
                origin: "appointment",
                date: "25/12/2025",
                time: "09:00 AM",
                type: "Cold",
                description: "Severe nasal congestion and mild fever.",
                prescription: "Cetirizine 10mg once daily",
                advice: "Steam inhalation twice daily",
            },
            {
                id: "R-102",
                origin: "chatbot",
                date: "02/11/2025",
                time: "08:40 PM",
                type: "Fever",
                description: "Mild fever and body pain.",
                prescription: "Paracetamol 650mg",
                advice: "Rest and hydration",
            },
        ],
    },
    {
        patientId: "P-002",
        name: "Sneha Kapoor",
        age: 31,
        phone: "+91 91234 56789",
        records: [
            {
                id: "R-201",
                origin: "appointment",
                date: "20/12/2025",
                time: "10:15 AM",
                type: "Injury",
                description: "Deep cut on right palm.",
                prescription: "Antibiotic ointment",
                advice: "Keep wound clean and dry",
            },
        ],
    },
    {
        patientId: "P-003",
        name: "Vikram Singh",
        age: 45,
        phone: "+91 99887 76655",
        records: [
            {
                id: "R-301",
                origin: "appointment",
                date: "18/12/2025",
                time: "11:30 AM",
                type: "Fever",
                description: "High fever with chills.",
                prescription: "Paracetamol + fluids",
                advice: "Monitor temperature",
            },
        ],
    },
];

/* ================= COMPONENT ================= */

export default function Record() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    React.useEffect(() => {
        if (params.phone) {
            const patient = PATIENTS.find((p) => p.phone === params.phone);
            if (patient) {
                setSelectedPatient(patient);
            }
        }
    }, [params.phone]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={["#F8FAFC", "#EEF2FF", "#FFFFFF"]}
                style={StyleSheet.absoluteFill}
            />

            {/* HEADER */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-left" size={24} color="#6366F1" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {selectedPatient ? "Patient Records" : "Patients"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* ================= PATIENT LIST ================= */}
            {!selectedPatient && (
                <ScrollView contentContainerStyle={styles.listArea}>
                    {PATIENTS.map((p) => (
                        <TouchableOpacity
                            key={p.patientId}
                            style={styles.patientCard}
                            onPress={() => setSelectedPatient(p)}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{p.name[0]}</Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.patientName}>{p.name}</Text>
                                <Text style={styles.patientMeta}>
                                    Age {p.age} • {p.records.length} records
                                </Text>
                            </View>

                            <Feather name="chevron-right" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* ================= PATIENT RECORDS ================= */}
            {selectedPatient && (
                <ScrollView contentContainerStyle={styles.recordArea}>
                    <View style={styles.patientInfoCard}>
                        <Text style={styles.patientNameBig}>{selectedPatient.name}</Text>
                        <Text style={styles.patientMeta}>
                            Age {selectedPatient.age} • {selectedPatient.phone}
                        </Text>
                    </View>

                    {selectedPatient.records.map((rec: any) => (
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

                            <Text style={styles.recordIssue}>{rec.type}</Text>
                            <Text style={styles.recordDesc}>{rec.description}</Text>

                            <View style={styles.responseBox}>
                                <Text style={styles.responseLabel}>Doctor Response</Text>
                                <Text style={styles.responseText}>Rx: {rec.prescription}</Text>
                                <Text style={styles.responseAdvice}>
                                    Advice: {rec.advice}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },

    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1E293B",
    },

    listArea: {
        padding: 20,
    },

    patientCard: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    avatarText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#6366F1",
    },

    patientName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1E293B",
    },

    patientMeta: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
        fontWeight: "600",
    },

    recordArea: {
        padding: 20,
        paddingBottom: 40,
    },

    patientInfoCard: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },

    patientNameBig: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1E293B",
    },

    recordCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 24,
        padding: 18,
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
        fontWeight: "600",
        color: "#94A3B8",
    },

    recordIssue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 4,
    },

    recordDesc: {
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

    responseText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1E293B",
    },

    responseAdvice: {
        fontSize: 13,
        color: "#475569",
        marginTop: 4,
    },
});
