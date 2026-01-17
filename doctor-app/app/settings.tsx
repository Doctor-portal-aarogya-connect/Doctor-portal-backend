import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Modal,
  Dimensions,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import api from "./services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DoctorSettings() {
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams();

  // --- MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string>("");

  // --- TOGGLE STATES ---
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);

  // --- MODAL CONTENT CONFIGURATION ---
  const getModalContent = () => {
    switch (modalType) {
      case "Specialization":
        return {
          title: "Degrees & Specialization",
          icon: "certificate",
          content: [
            "• MBBS - AIIMS, New Delhi",
            "• MD (Cardiology) - Harvard Medical",
            "• Fellow of the American College of Cardiology (FACC)",
            "• Board Certified Interventional Cardiologist",
          ],
        };
      case "Signature":
        return {
          title: "Digital Signature",
          icon: "draw",
          content: ["Your encrypted digital signature is verified."],
          isSignature: true,
        };
      case "Affiliation":
        return {
          title: "Hospital Affiliations",
          icon: "hospital-building",
          content: [
            "• City General Hospital (Primary)",
            "• St. Mary's Surgical Center (Consultant)",
            "• Aarogya Virtual Clinic (Telemedicine)",
          ],
        };
      case "Activity":
        return {
          title: "Login Activity",
          icon: "shield-account",
          content: [
            "• iPhone 15 Pro - New Delhi (Active Now)",
            "• MacBook Pro - Dec 22, 2025 at 08:45 PM",
            "• iPad Air - Dec 20, 2025 at 10:15 AM",
          ],
        };
      case "Feedback":
        return {
          title: "Help & Feedback",
          icon: "message-draw",
          isInput: true,
        };
      default:
        return {
          title: "Legal Information",
          icon: "file-document",
          content: [
            "• HIPAA Compliance Verified.",
            "• Data Encrypted via AES-256.",
            "• Terms updated Dec 2025.",
          ],
        };
    }
  };

  const activeModal = getModalContent();

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log('Logout API failed, clearing local session anyway', err);
    }
    await AsyncStorage.removeItem('doctor_session_token');
    await AsyncStorage.removeItem('doctor_user');
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>

        {/* PROFILE SECTION */}
        <View style={styles.profileCard}>
          <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.largeAvatar}>
            <Text style={styles.avatarText}>{(username as string)?.[0] || "D"}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>Dr. {username || "Specialist"}</Text>
          <Text style={styles.profileId}>Reg ID: #88291-PRO</Text>
        </View>

        {/* CLINICAL OPTIONS */}
        <Text style={styles.groupLabel}>Clinical & Identity</Text>
        <View style={styles.settingGroup}>
          <SettingItem icon="certificate-outline" label="Specialization & Degrees" type="link" onPress={() => handleOpenModal("Specialization")} />
          <SettingItem icon="draw" label="Digital Signature & Stamp" type="link" onPress={() => handleOpenModal("Signature")} />
          <SettingItem icon="hospital-building" label="Hospital Affiliations" type="link" onPress={() => handleOpenModal("Affiliation")} />
        </View>

        {/* SECURITY OPTIONS */}
        <Text style={styles.groupLabel}>Security & Privacy</Text>
        <View style={styles.settingGroup}>
          <SettingItem icon="fingerprint" label="Biometric Authentication" type="toggle" value={isBiometricEnabled} onValueChange={setIsBiometricEnabled} />
          <SettingItem icon="history" label="Login Activity" type="link" onPress={() => handleOpenModal("Activity")} />
        </View>

        {/* SUPPORT OPTIONS */}
        <Text style={styles.groupLabel}>Support & Legal</Text>
        <View style={styles.settingGroup}>
          <SettingItem icon="help-circle-outline" label="Help & Feedback" type="link" onPress={() => handleOpenModal("Feedback")} />
          <SettingItem icon="information-outline" label="Terms & Privacy Audit" type="link" onPress={() => handleOpenModal("Legal")} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out from Server</Text>
          <Feather name="log-out" size={18} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>

      {/* ================= DYNAMIC MODAL ================= */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <MaterialCommunityIcons name={activeModal.icon as any} size={32} color="#3B82F6" />
            </View>

            <Text style={styles.modalTitle}>{activeModal.title}</Text>
            <View style={styles.modalDivider} />

            <ScrollView style={styles.modalScroll}>
              {activeModal.content?.map((text, i) => (
                <Text key={i} style={styles.modalItemText}>{text}</Text>
              ))}

              {activeModal.isSignature && (
                <View style={styles.signaturePad}>
                  <Text style={styles.signText}>Dr. {username}</Text>
                  <View style={styles.signLine} />
                  <Text style={styles.signSub}>Electronically Verified</Text>
                </View>
              )}

              {activeModal.isInput && (
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="How can we improve your workflow?"
                  multiline
                  numberOfLines={4}
                />
              )}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= COMPONENTS ================= */

const SettingItem = ({ icon, label, type, value, onValueChange, onPress }: any) => (
  <TouchableOpacity style={styles.itemRow} activeOpacity={type === 'toggle' ? 1 : 0.6} onPress={onPress}>
    <View style={styles.itemLeft}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={20} color="#3B82F6" />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    {type === "toggle" ? (
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }} thumbColor={value ? "#2563EB" : "#F1F5F9"} />
    ) : (
      <Feather name="chevron-right" size={16} color="#94A3B8" />
    )}
  </TouchableOpacity>
);

/* ================= LINE BY LINE STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B"
  },
  scrollArea: {
    paddingHorizontal: 24
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 25,
    alignItems: "center",
    marginBottom: 30
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  avatarText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800"
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B"
  },
  profileId: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4
  },
  settingGroup: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 8,
    marginBottom: 25
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center"
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155"
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2"
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 15
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 24
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center"
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
    borderWidth: 5,
    borderColor: "#FFF"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 12
  },
  modalDivider: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginVertical: 15
  },
  modalScroll: {
    width: "100%",
    maxHeight: 250
  },
  modalItemText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 8
  },
  signaturePad: {
    height: 100,
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  signText: {
    fontSize: 24,
    fontStyle: "italic",
    color: "#1E293B"
  },
  signLine: {
    width: "60%",
    height: 1,
    backgroundColor: "#94A3B8",
    marginTop: 5
  },
  signSub: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 5
  },
  feedbackInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    textAlignVertical: "top",
    color: "#1E293B"
  },
  modalCloseBtn: {
    width: "100%",
    padding: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20
  },
  modalCloseBtnText: {
    color: "#FFF",
    fontWeight: "800"
  },
});