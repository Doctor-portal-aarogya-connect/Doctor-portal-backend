import React, { useState, useEffect } from "react";
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
import api from "./services/api";

const { width, height } = Dimensions.get("window");



/* ================= COMPONENT ================= */

export default function Record() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientsList, setPatientsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const [apptRes, recordRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/records')
            ]);

            const patientMap = new Map();

            // Process Appointments
            if (apptRes.data.ok) {
                apptRes.data.appointments.forEach((a: any) => {
                    if (!a.userId) return; // Skip if no user linked
                    const pId = a.userId._id;

                    if (!patientMap.has(pId)) {
                        patientMap.set(pId, {
                            patientId: pId,
                            name: a.userId.fullName || 'Unknown',
                            age: a.userId.age || 'N/A',
                            phone: a.userId.mobile || a.mobile || 'N/A',
                            records: []
                        });
                    }

                    patientMap.get(pId).records.push({
                        id: a._id,
                        origin: "appointment",
                        date: new Date(a.preferredDate || a.createdAt).toLocaleDateString(),
                        time: a.preferredTime || 'N/A',
                        type: a.problem || 'Consulation',
                        description: a.problem,
                        prescription: a.status === 'completed' ? 'View details' : 'Pending',
                        advice: "Check details in history",
                        status: a.status,
                        createdAt: new Date(a.createdAt)
                    });
                });
            }

            // Process Records (Chatbot/Queries)
            if (recordRes.data.ok) {
                recordRes.data.records.forEach((r: any) => {
                    if (!r.userId) return;
                    const pId = r.userId._id;

                    if (!patientMap.has(pId)) {
                        patientMap.set(pId, {
                            patientId: pId,
                            name: r.userId.fullName || 'Unknown',
                            age: r.userId.age || 'N/A',
                            phone: r.userId.mobile || r.phone || 'N/A',
                            records: []
                        });
                    }

                    patientMap.get(pId).records.push({
                        id: r._id,
                        origin: "chatbot",
                        date: new Date(r.createdAt).toLocaleDateString(),
                        time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: r.summary || "Query",
                        description: r.details,
                        prescription: r.doctorResponse || "Pending",
                        advice: r.doctorResponse ? "Resolved" : "Waiting",
                        status: r.status,
                        createdAt: new Date(r.createdAt)
                    });
                });
            }

            // Convert Map to Array and Sort records by date
            const pList = Array.from(patientMap.values()).map(p => {
                p.records.sort((a: any, b: any) => b.createdAt - a.createdAt);
                return p;
            });

            setPatientsList(pList);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={["#F8FAFC", "#EEF2FF", "#FFFFFF"]}
                style={StyleSheet.absoluteFill}
            />

            {/* HEADER */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => selectedPatient ? setSelectedPatient(null) : router.back()}>
                    <Feather name="chevron-left" size={24} color="#6366F1" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {selectedPatient ? "Patient Records" : "Patients Archive"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* ================= PATIENT LIST ================= */}
            {!selectedPatient && (
                <ScrollView contentContainerStyle={styles.listArea}>
                    {loading ? (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#94A3B8' }}>Loading history...</Text>
                    ) : (
                        patientsList.map((p) => (
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
                        ))
                    )}
                    {!loading && patientsList.length === 0 && (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#94A3B8' }}>No patient history found.</Text>
                    )}
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
