import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./services/api";

const { width, height } = Dimensions.get("window");

export default function DoctorDashboard() {
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadAvailabilityStatus();
  }, []);

  const loadAvailabilityStatus = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem("doctor_availability");
      if (savedStatus !== null) {
        setIsAvailable(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error("Failed to load availability status", error);
    }
  };

  const saveAvailabilityStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem("doctor_availability", JSON.stringify(status));
    } catch (error) {
      console.error("Failed to save availability status", error);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    /** * BACKEND: Clear User Tokens, Session, and local Storage 
     * (e.g. AsyncStorage.clear()) before redirecting to Login.
     */
    router.replace("/login"); // Navigates to the root (Login Page)
  };

  const [stats, setStats] = useState({
    totalAppointments: 0,
    chatbotQueries: 0,
    attendedToday: 0,
    dailyTarget: 10
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [apptRes, recordRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/records')
      ]);

      if (apptRes.data.ok && recordRes.data.ok) {
        setStats({
          totalAppointments: apptRes.data.appointments.length,
          chatbotQueries: recordRes.data.records.length,
          attendedToday: 0, // Logic for this would require more backend work
          dailyTarget: 10
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const navigateToExplore = (targetTab: "appointment" | "chatbot") => {
    router.push({
      pathname: "/ExplorePatients",
      params: { activeTab: targetTab }
    });
  };

  const toggleAvailability = () => {
    const newState = !isAvailable;
    setIsAvailable(newState);
    saveAvailabilityStatus(newState);

    Alert.alert(
      "Status Updated",
      newState
        ? "You are now marked as AVAILABLE for patient consultations."
        : "You are now marked as NOT AVAILABLE. Patient queue is paused."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={["#E0F2FE", "#F0FDFA", "#FFFFFF"]} style={{ flex: 1 }} />
        <View style={styles.auraCircle} />
      </View>

      {/* HEADER SECTION */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <View style={styles.profileBox}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <LinearGradient colors={["#3B82F6", "#2DD4BF"]} style={styles.avatar}>
                <Text style={styles.avatarText}>{(username as string)?.[0] || "D"}</Text>
              </LinearGradient>
              <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? "#10B981" : "#F43F5E" }]} />
            </TouchableOpacity>

            <View>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <View style={styles.row}>
                <Text style={styles.doctorName}>Dr. {username || "Specialist"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isAvailable ? "#DCFCE7" : "#FFE4E6" }]}>
                  <Text style={[styles.statusBadgeText, { color: isAvailable ? "#10B981" : "#F43F5E" }]}>
                    {isAvailable ? "Available" : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* REPLACED BELL WITH LOGOUT BUTTON */}
          <TouchableOpacity style={styles.logoutHeaderBtn} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search history or queries..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>

        <View style={styles.metricsContainer}>
          <View style={styles.statsRow}>
            <StatItem
              value={stats.totalAppointments}
              label="Appointments"
              icon="calendar-check"
              color="#3B82F6"
              onPress={() => navigateToExplore('appointment')}
            />
            <StatItem
              value={stats.chatbotQueries}
              label="Bot Queries"
              icon="robot-outline"
              color="#8B5CF6"
              onPress={() => navigateToExplore('chatbot')}
            />
          </View>

          <View style={[styles.statsRow, { marginTop: 15 }]}>
            <StatItem
              value={stats.attendedToday}
              label="Attended Today"
              icon="check-decagram"
              color="#10B981"
              onPress={() => navigateToExplore('appointment')}
            />
            <StatItem
              value={`${stats.attendedToday}/${stats.dailyTarget}`}
              label="Daily Target"
              icon="target"
              color="#F59E0B"
            />
          </View>
        </View>

        <View style={styles.targetProgressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Daily Goal Progress</Text>
            <Text style={styles.progressPercent}>{Math.round((stats.attendedToday / stats.dailyTarget) * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(stats.attendedToday / stats.dailyTarget) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>CORE SERVICES</Text>
        <View style={styles.servicesGrid}>
          <ServiceBtn
            icon="account-search"
            label="Explore"
            color="#3B82F6"
            onPress={() => router.push("/ExplorePatients")}
          />
          <ServiceBtn 
            icon="folder-account" 
            label="Records" 
            color="#8B5CF6" 
            onPress={() => router.push("/record")}/>
          <ServiceBtn icon="clipboard-text" label="Labs" color="#10B981" />
          <ServiceBtn icon="chat-processing" label="Messages" color="#F59E0B" />
        </View>

        <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.helpCard}>
          <MaterialCommunityIcons name="hospital-building" size={40} color="rgba(255,255,255,0.3)" style={styles.helpIcon} />
          <View>
            <Text style={styles.helpTitle}>Hospital Support</Text>
            <Text style={styles.helpSub}>Contact management for assistance</Text>
          </View>
          <TouchableOpacity style={styles.helpBtn} onPress={() => router.push("/settings")}>
            <Text style={styles.helpBtnText}>Connect</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 15 }]}>
        <NavIcon name="grid" active />
        <NavIcon name="users" route="/ExplorePatients" />

        <TouchableOpacity style={styles.fab} onPress={toggleAvailability} activeOpacity={0.8}>
          <LinearGradient
            colors={isAvailable ? ["#10B981", "#059669"] : ["#F43F5E", "#BE123C"]}
            style={[styles.fabGradient, !isAvailable && styles.fabInactive]}
          >
            <MaterialCommunityIcons
              name={isAvailable ? "stethoscope" : "close-circle"}
              size={28}
              color="#FFF"
            />
          </LinearGradient>
          <Text style={[styles.fabLabel, { color: isAvailable ? "#10B981" : "#F43F5E" }]}>
            {isAvailable ? "Available" : "Not Available"}
          </Text>
        </TouchableOpacity>

        <NavIcon name="file-text" route="/ExplorePatients" />
        <NavIcon name="settings" route="/settings" />
      </View>
    </View>
  );
}

/* ================= COMPONENTS ================= */

const NavIcon = ({ name, active, route }: any) => (
  <TouchableOpacity
    style={styles.navItem}
    onPress={() => route && router.push(route)}
  >
    <Feather name={name} size={22} color={active ? "#3B82F6" : "#94A3B8"} />
  </TouchableOpacity>
);

const StatItem = ({ value, label, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.statBox} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={[styles.statIconBox, { backgroundColor: color + "15" }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const ServiceBtn = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.serviceBtn} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
    </View>
    <Text style={styles.serviceLabel}>{label}</Text>
  </TouchableOpacity>
);

/* ================= LINE-BY-LINE STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: 'uppercase'
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  auraCircle: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: '#3B82F610'
  },
  header: {
    paddingHorizontal: 20
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800"
  },
  greetingText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500"
  },
  doctorName: {
    color: "#1E293B",
    fontSize: 18,
    fontWeight: "800"
  },
  logoutHeaderBtn: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  searchContainer: {
    marginBottom: 15
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: '500'
  },
  scrollArea: {
    padding: 20,
    paddingBottom: 120
  },
  metricsContainer: {
    marginBottom: 20
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statBox: {
    width: (width - 55) / 2,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B"
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2
  },
  targetProgressCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569'
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  sectionTitle: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 15,
    letterSpacing: 1
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30
  },
  serviceBtn: {
    width: (width - 64) / 4,
    alignItems: "center"
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  serviceLabel: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 11
  },
  helpCard: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  helpIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10
  },
  helpTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800'
  },
  helpSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500'
  },
  helpBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  helpBtnText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 13
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    top: -20,
    alignItems: 'center'
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  fabInactive: {
    shadowColor: "#F43F5E"
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 0.5
  },
});