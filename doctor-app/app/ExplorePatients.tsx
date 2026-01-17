import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Modal,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "./services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions
} from "expo-camera";
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser'; // Added import
// Inside ExplorePatients.tsx
const { width, height } = Dimensions.get("window");

/**
 * BACKEND DEVELOPER NOTE:
 * Ensure your API returns 'date' and 'time' fields for appointments.
 * These are mapped to "Preferred Date" and "Preferred Time" in the UI.
 */
export default function ExplorePatients() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("appointment");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [prescription, setPrescription] = useState("");

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // State for fetched data
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any>(null); // Added state

  // Filtered List based on active tab
  const [filteredList, setFilteredList] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'appointment') {
      setFilteredList(appointments);
    } else {
      setFilteredList(records);
    }
  }, [activeTab, appointments, records]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Doctor Profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data.ok) {
          setDoctorProfile(meRes.data.user);
        }
      } catch (e) {
        console.log("Failed to load profile", e);
      }

      const [apptRes, recordRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/records')
      ]);

      if (apptRes.data.ok) {
        // Map backend appointment data to UI format
        const mappedAppts = apptRes.data.appointments.map((a: any) => ({
          id: a._id,
          time: a.preferredTime || 'N/A',
          date: new Date(a.preferredDate).toLocaleDateString(),
          name: a.fullName || 'Unknown',
          phone: a.mobile || 'N/A',
          age: a.age ? String(a.age) : 'N/A',
          type: 'General', // Backend doesn't have type yet, defaulting
          problem: a.problem,
          urgency: a.status === 'pending' ? 'Urgent' : 'Routine', // Logic for urgency
          origin: 'appointment',
          status: a.status
        }));
        setAppointments(mappedAppts);
      }

      if (recordRes.data.ok) {
        // Map backend record data to UI format
        const mappedRecords = recordRes.data.records.map((r: any) => ({
          id: r._id,
          queryId: r.queryNumber || r._id.substring(0, 8),
          time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(r.createdAt).toLocaleDateString(),
          name: 'Anonymous User', // Records might not have names if generic
          phone: r.phone || 'N/A',
          type: 'Query',
          summary: r.summary,
          details: r.details,
          urgency: r.status === 'pending' ? 'Urgent' : 'Routine',
          origin: 'chatbot',
          hasVoice: false, // Update if backend supports voice
          images: r.attachments?.map((att: any) => att.url) || [],
          status: r.status
        }));
        setRecords(mappedRecords);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      // Fallback to empty lists or show alert
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (patient: any) => {
    setSelectedPatient(patient);
    setIsResponding(false);
    setModalVisible(true);
  };

  const startVideoRecording = async () => {
    const camStatus = await requestPermission();
    const micStatus = await requestMicPermission();

    if (!camStatus.granted || !micStatus.granted) {
      Alert.alert("Permission Required", "Camera and Mic access are needed.");
      return;
    }
    setShowCamera(true);
  };

  const handleRecord = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync();
        console.log("Local Video URI:", video.uri);
        Alert.alert("Success", "Video advice recorded.");
        setShowCamera(false);
      } catch (e) {
        console.error("Recording Error:", e);
      } finally {
        setIsRecording(false);
      }
    } else {
      cameraRef.current?.stopRecording();
    }
  };

  const handlePrimaryAction = async () => {
    if (!selectedPatient) return;

    if (activeTab === 'appointment') {
      try {
        const res = await api.patch(`/appointments/${selectedPatient.id}/status`, {
          status: 'completed'
        });
        if (res.data.ok) {
          Alert.alert("Success", "Patient marked as attended.");
          setModalVisible(false);
          fetchData();
        }
      } catch (err) {
        Alert.alert("Error", "Failed to update appointment.");
      }
    } else {
      if (isResponding) {
        if (!prescription.trim()) {
          Alert.alert("Required", "Please write a prescription or note.");
          return;
        }
        try {
          const res = await api.patch(`/records/${selectedPatient.id}/status`, {
            status: 'resolved',
            doctorResponse: prescription,
            doctorName: doctorProfile?.fullName || "Doctor",
            doctorDetails: "MBBS, MD - General Physician"
          });

          if (res.data.ok) {
            Alert.alert("Sent", "Prescription sent and query resolved.");
            setModalVisible(false);
            fetchData();
          }
        } catch (err) {
          Alert.alert("Error", "Failed to send response.");
        }
      } else {
        setIsResponding(true);
      }
    }
  };

  const getUrgencyColor = (u: string) => {
    switch (u) {
      case 'Emergency': return '#EF4444';
      case 'Urgent': return '#F59E0B';
      default: return '#10B981';
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#F8FAFC", "#EEF2FF", "#FFFFFF"]} style={StyleSheet.absoluteFill} />

      <View style={styles.auraBlue} />
      <View style={styles.auraPurple} />

      <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.navTitle}>Medical Registry</Text>
          <Text style={styles.navSubtitle}>{filteredList.length} cases found today</Text>
        </View>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => router.replace("/dashboard")}
        >
          <Feather name="home" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabOuter}>
        <View style={styles.tabInner}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'appointment' && styles.activeTab]}
            onPress={() => setActiveTab('appointment')}
          >
            <Text style={[styles.tabText, activeTab === 'appointment' && styles.activeTabText]}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chatbot' && styles.activeTab]}
            onPress={() => setActiveTab('chatbot')}
          >
            <Text style={[styles.tabText, activeTab === 'chatbot' && styles.activeTabText]}>Chatbot Queries</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listArea} showsVerticalScrollIndicator={false}>
        {filteredList.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={styles.patientCard}
            onPress={() => handleOpenDetails(item)}
          >
            <View style={styles.cardInfo}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {activeTab === 'appointment' ? item.name.charAt(0) : '#'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pName}>
                  {activeTab === 'appointment' ? item.name : `Query ID: ${item.queryId}`}
                </Text>
                <Text style={styles.pSubInfo}>{item.type} • {item.time}</Text>
              </View>
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) + '15' }]}>
                <Text style={[styles.urgencyText, { color: getUrgencyColor(item.urgency) }]}>{item.urgency}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.caseContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.caseHeader}>
              <TouchableOpacity
                onPress={() => isResponding ? setIsResponding(false) : setModalVisible(false)}
                style={styles.backBtn}
              >
                <Feather name={isResponding ? "chevron-left" : "x"} size={22} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {isResponding ? "Digital Prescription" : "Case Review"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!isResponding ? (
                <>
                  {/* Primary Info Grid */}
                  <View style={styles.infoGrid}>
                    <View style={[styles.infoTile, { flex: 2.5 }]}>
                      <Text style={styles.infoLabel}>CONTACT</Text>
                      <Text style={styles.infoValueText} numberOfLines={1}>{selectedPatient?.phone}</Text>
                    </View>
                    <View style={[styles.infoTile, { flex: 1, marginLeft: 10 }]}>
                      <Text style={styles.infoLabel}>AGE</Text>
                      <Text style={styles.infoValueText}>{selectedPatient?.age || 'N/A'} Yrs</Text>
                    </View>
                  </View>

                  {/* Scheduling Details */}
                  <View style={styles.infoGrid}>
                    <View style={[styles.infoTile, { flex: 1 }]}>
                      <Text style={styles.infoLabel}>PREFERRED DATE</Text>
                      <Text style={styles.infoValueText}>{selectedPatient?.date}</Text>
                    </View>
                    <View style={[styles.infoTile, { flex: 1, marginLeft: 10 }]}>
                      <Text style={styles.infoLabel}>PREFERRED TIME</Text>
                      <Text style={styles.infoValueText}>{selectedPatient?.time}</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionHeading}>HEALTH PROBLEM / SUMMARY</Text>
                  <View style={styles.problemBox}>
                    <Text style={styles.problemText}>
                      {selectedPatient?.summary || selectedPatient?.problem}
                    </Text>
                  </View>



                  {selectedPatient?.origin === 'chatbot' && (
                    <>
                      <Text style={styles.sectionHeading}>SUBMITTED EVIDENCE</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                        {selectedPatient?.images?.map((url: string, i: number) => {
                          const isVideo = url.match(/\.(mp4|mov|webm)$/i) || url.includes('/video/');

                          return (
                            <TouchableOpacity
                              key={i}
                              style={styles.mediaContainer}
                              onPress={() => WebBrowser.openBrowserAsync(url)}
                            >
                              {isVideo ? (
                                <View style={[styles.mediaImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
                                  <Feather name="play-circle" size={40} color="#FFF" />
                                </View>
                              ) : (
                                <Image source={{ uri: url }} style={styles.mediaImage} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.sectionHeading}>ADVICE & MEDICATIONS (Rx)</Text>
                  <View style={styles.prescriptionContainer}>
                    <TextInput
                      style={styles.prescriptionInput}
                      placeholder="Type medications or dosage instructions here..."
                      multiline
                      value={prescription}
                      onChangeText={setPrescription}
                    />

                    <View style={styles.signaturePad}>
                      <View style={styles.signatureLine} />
                      <Text style={styles.signatureScript}>{doctorProfile?.fullName || "Doctor"}</Text>
                      <Text style={styles.doctorMeta}>MBBS, MD - General Physician</Text>
                      <Text style={styles.doctorMeta}>Reg No: #8821-2025</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionHeading}>VIDEO CONSULTATION</Text>
                  <TouchableOpacity style={styles.videoRecordBtn} onPress={startVideoRecording}>
                    <LinearGradient colors={["#6366F1", "#4F46E5"]} style={styles.videoGradient}>
                      <Feather name="video" size={20} color="#FFF" />
                      <Text style={styles.videoBtnText}>Record Clinical Advice</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.primaryAction,
                activeTab === 'appointment' && { backgroundColor: '#10B981' },
                activeTab === 'chatbot' && !isResponding && { backgroundColor: '#6366F1' },
                isResponding && { backgroundColor: '#4F46E5' }
              ]}
              onPress={handlePrimaryAction}
            >
              <Text style={styles.primaryActionText}>
                {activeTab === 'appointment'
                  ? "Attend Patient"
                  : (isResponding ? "Send Rx to Patient" : "Review & Respond")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showCamera} animationType="fade">
          <CameraView style={styles.camera} ref={cameraRef} mode="video">
            <View style={styles.cameraOverlay}>
              <TouchableOpacity style={styles.closeCamera} onPress={() => setShowCamera(false)}>
                <Feather name="x" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recordBtn, isRecording && { borderColor: '#EF4444' }]}
                onPress={handleRecord}
              >
                <View style={[styles.recordInner, isRecording && { backgroundColor: '#EF4444' }]} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </Modal>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  auraBlue: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.05)'
  },
  auraPurple: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168, 85, 247, 0.05)'
  },
  navHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.8
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8'
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  tabOuter: {
    paddingHorizontal: 24,
    marginBottom: 18
  },
  tabInner: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 5,
    borderRadius: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#FFF',
    elevation: 4
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8'
  },
  activeTabText: {
    color: '#1E293B'
  },
  listArea: {
    paddingHorizontal: 24,
    paddingBottom: 60
  },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    elevation: 3
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#6366F1'
  },
  pName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B'
  },
  pSubInfo: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600'
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end'
  },
  caseContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    padding: 26,
    height: height * 0.88
  },
  modalHandle: {
    width: 42,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B'
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 12
  },
  infoTile: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 6
  },
  infoValueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B'
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  problemBox: {
    backgroundColor: '#F0F9FF',
    padding: 22,
    borderRadius: 26,
    borderLeftWidth: 6,
    borderLeftColor: '#6366F1'
  },
  problemText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500'
  },
  mediaScroll: {
    flexDirection: 'row'
  },
  mediaContainer: {
    width: 115,
    height: 115,
    borderRadius: 22,
    marginRight: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9'
  },
  mediaImage: {
    width: '100%',
    height: '100%'
  },
  voiceTile: {
    width: 115,
    height: 115,
    backgroundColor: '#F5F3FF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  voiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 10
  },
  prescriptionContainer: {
    backgroundColor: '#FDFCFB',
    borderRadius: 26,
    padding: 22,
    minHeight: 320,
    borderWidth: 2,
    borderColor: '#F1F5F9'
  },
  prescriptionInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top'
  },
  signaturePad: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    marginTop: 20
  },
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: '#94A3B8',
    marginBottom: 8
  },
  signatureScript: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '700',
    fontStyle: 'italic'
  },
  doctorMeta: {
    fontSize: 12,
    color: '#64748B'
  },
  videoRecordBtn: {
    marginTop: 15,
    borderRadius: 26,
    overflow: 'hidden'
  },
  videoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12
  },
  videoBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16
  },
  primaryAction: {
    padding: 22,
    borderRadius: 26,
    alignItems: 'center',
    marginTop: 28
  },
  primaryActionText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18
  },
  camera: {
    flex: 1
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 65
  },
  closeCamera: {
    position: 'absolute',
    top: 55,
    right: 35
  },
  recordBtn: {
    width: 85,
    height: 85,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FFF'
  }
});