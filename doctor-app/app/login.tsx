import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import api from "./services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Lang = "en" | "hi" | "pa";

const STRINGS: Record<Lang, any> = {
  en: {
    loginTitle: "Login to Your Account",
    subtitle: "Access your Aarogya Connect Doctor profile",
    username: "Doctor Name",
    usernamePh: "Enter your Name",
    password: "Password",
    passwordPh: "Enter your password",
    button: "Login",
    forgot: "Forgot Password?",
    create: "New user? Create Account",
    english: "English",
    hindi: "हिंदी",
    punjabi: "ਪੰਜਾਬੀ",
    buildLabel: "Build:",
    slogan: "स्वास्थ्य ही सबसे बड़ी पूंजी है",
    errors: {
      usernameRequired: "Please enter your Doctor ID",
      passwordRequired: "Please enter your password",
    },
  },
  hi: {
    loginTitle: "अपने खाते में लॉगिन करें",
    subtitle: "अपनी आरोग्य कनेक्ट प्रोफ़ाइल तक पहुंचें",
    username: "डॉक्टर आईडी",
    usernamePh: "डॉक्टर आईडी दर्ज करें",
    password: "पासवर्ड",
    passwordPh: "पासवर्ड दर्ज करें",
    button: "लॉगिन",
    forgot: "पासवर्ड भूल गए?",
    create: "नया उपयोगकर्ता? खाता बनाएँ",
    english: "English",
    hindi: "हिंदी",
    punjabi: "ਪੰਜਾਬੀ",
    buildLabel: "बिल्ड:",
    slogan: "स्वास्थ्य ही सबसे बड़ी पूंजी है",
    errors: {
      usernameRequired: "कृपया उपयोगकर्ता नाम दर्ज करें",
      passwordRequired: "कृपया पासवर्ड दर्ज करें",
    },
  },
  pa: {
    loginTitle: "ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ",
    subtitle: "ਆਪਣੀ ਆਰੋਗਿਆ ਕਨੈਕਟ ਪ੍ਰੋਫ਼ਾਈਲ ਐਕਸੈੱਸ ਕਰੋ",
    username: "ਡਾਕਟਰ ਆਈਡੀ",
    usernamePh: "ਡਾਕਟਰ ਆਈਡੀ ਦਾਖਲ ਕਰੋ",
    password: "ਪਾਸਵਰਡ",
    passwordPh: "ਪਾਸਵਰਡ ਲਿਖੋ",
    button: "ਲਾਗਇਨ",
    forgot: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
    create: "ਨਵਾਂ ਯੂਜ਼ਰ? ਖਾਤਾ ਬਣਾਓ",
    english: "English",
    hindi: "हिंदी",
    punjabi: "ਪੰਜਾਬੀ",
    buildLabel: "ਬਿਲਡ:",
    slogan: "ਸਿਹਤ ਹੀ ਸਭ ਤੋਂ ਵੱਡੀ ਦੌਲਤ ਹੈ",
    errors: {
      usernameRequired: "ਯੂਜ਼ਰਨੇਮ ਦਾਖਲ ਕਰੋ",
      passwordRequired: "ਪਾਸਵਰਡ ਦਾਖਲ ਕਰੋ",
    },
  },
};

export default function LoginScreen() {

  /**
   * STATE
   * BACKEND: use `username` and `password` for authentication
   */

  const [language, setLanguage] = useState<Lang>("en");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const insets = useSafeAreaInsets();
  const t = STRINGS[language];

  // Animations (UNCHANGED)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  /**
   * FRONTEND VALIDATION
   * BACKEND: must re-validate on server
   */

  const validate = () => {
    let e: any = {};
    if (!username.trim()) e.username = t.errors.usernameRequired;
    if (!password.trim()) e.password = t.errors.passwordRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  /**
  * LOGIN HANDLER
  * BACKEND WORK REQUIRED HERE
  * - Call login API
  * - Verify username & password
  * - Return token + user data
  */


  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data.ok) {
        await AsyncStorage.setItem('doctor_session_token', response.data.token);
        await AsyncStorage.setItem('doctor_user', JSON.stringify(response.data.user));

        // Reset state
        setUsername("");
        setPassword("");
        setErrors({});

        router.replace({ pathname: "/dashboard", params: { username: response.data.user.username } });
      } else {
        Alert.alert("Login Failed", response.data.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("Login Error", err);
      const msg = err.response?.data?.error || "Network error. Is backend running?";
      Alert.alert("Login Failed", msg);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F6F7FB"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.mainContent}>

              {/* ===== HEADER (UNCHANGED) ===== */}
              <View style={styles.headerOuter}>
                <View style={styles.headerRow}>
                  <Image
                    source={require("../assets/images/app-logo.png")}
                    style={styles.logoPrimary}
                    resizeMode="contain"
                  />

                  {/* LANGUAGE DROPDOWN
                      BACKEND (optional):
                      - Save user language preference
                      - Load preference after login
                  */}

                  <View style={styles.langDropdownWrapper}>
                    <TouchableOpacity
                      onPress={() => setIsLangOpen((prev) => !prev)}
                      style={styles.langDropdownButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.langDropdownText}>
                        {language === "en"
                          ? t.english
                          : language === "hi"
                            ? t.hindi
                            : t.punjabi}
                      </Text>
                      <Text style={styles.langDropdownArrow}>
                        {isLangOpen ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {isLangOpen && (
                      <View style={styles.langDropdownMenu}>
                        <LangOption label={t.english} selected={language === "en"} onPress={() => { setLanguage("en"); setIsLangOpen(false); }} />
                        <LangOption label={t.hindi} selected={language === "hi"} onPress={() => { setLanguage("hi"); setIsLangOpen(false); }} />
                        <LangOption label={t.punjabi} selected={language === "pa"} onPress={() => { setLanguage("pa"); setIsLangOpen(false); }} />
                      </View>
                    )}
                  </View>

                  {/* 🔴 THIS WAS MISSING IN NEW CODE */}
                  <View style={styles.centerLogoContainer}>
                    <Image
                      source={require("../assets/images/partner-logo.png")}
                      style={styles.logoSecondary}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <View style={styles.tricolourStrip}>
                  <View style={[styles.triBlock, { backgroundColor: "#FF9933" }]} />
                  <View style={[styles.triBlock, { backgroundColor: "#FFFFFF" }]} />
                  <View style={[styles.triBlock, { backgroundColor: "#138808" }]} />
                </View>
              </View>

              {/* LOGIN CARD
                  BACKEND:
                  - Accept username & password
              */}


              {/* ===== LOGIN CARD ===== */}
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={styles.centerWrapper}>
                  <LinearGradient
                    colors={["#FF9933", "#FFFFFF", "#138808"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}

                    style={styles.cardGlowWrapper}>
                    <View style={styles.cardWrapper}>
                      <BlurView intensity={25} tint="light" style={styles.card}>
                        <Text style={styles.title}>{t.loginTitle}</Text>
                        <Text style={styles.subtitle}>{t.subtitle}</Text>


                        {/* USERNAME INPUT
                            BACKEND: map to login request
                        */}

                        {/* Username */}
                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t.username}</Text>
                          <TextInput
                            style={[styles.input, errors.username && styles.inputError]}
                            placeholder={t.usernamePh}
                            value={username}
                            onChangeText={setUsername}
                          />
                        </View>

                        {/* PASSWORD INPUT
                            BACKEND: map to login request
                        */}

                        {/* Password (same UI style) */}
                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t.password}</Text>
                          <View style={[styles.input, styles.passwordRow, errors.password && styles.inputError]}>
                            <TextInput
                              style={{ flex: 1 }}
                              placeholder={t.passwordPh}
                              secureTextEntry={!showPassword}
                              value={password}
                              onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                              <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* LOGIN BUTTON
                            BACKEND:
                            - Trigger authentication API
                        */}

                        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                          <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>{t.button}</Text>
                          </TouchableOpacity>
                        </Animated.View>

                        {/* LINKS
                            BACKEND:
                            - Forgot password API
                            - Signup / registration API
                        */}

                        {/* spacing wrapper */}
                        <View style={styles.linkGroup}>
                          <TouchableOpacity onPress={() =>
                            // @ts-ignore
                            router.push("/reset-password")
                          }>
                            <Text style={styles.link}>{t.forgot}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() =>
                            // @ts-ignore
                            router.push("/signup")
                          }>
                            <Text style={styles.link}>{t.create}</Text>
                          </TouchableOpacity>
                        </View>


                      </BlurView>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* ===== FOOTER (UNCHANGED) ===== */}
              <View style={styles.footerOuter}>
                <View style={styles.footerInner}>
                  <Text style={styles.footerBuild}>{t.buildLabel} 08 Dec 2025</Text>
                  <Text style={styles.footerSlogan}>{t.slogan}</Text>
                </View>

                <View style={styles.tricolourStripFooter}>
                  <View style={[styles.triBlock, { backgroundColor: "#FF9933" }]} />
                  <View style={[styles.triBlock, { backgroundColor: "#FFFFFF" }]} />
                  <View style={[styles.triBlock, { backgroundColor: "#138808" }]} />
                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}


// ---------------- LANGUAGE OPTION ----------------
interface LangOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const LangOption = ({ label, selected, onPress }: LangOptionProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.langOptionRow, selected && { backgroundColor: "rgba(37,99,235,0.08)" }]}>
    <Text style={[styles.langOptionText, selected && { color: "#2563EB", fontWeight: "700" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  /* =====================================================
     GLOBAL LAYOUT
     ===================================================== */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  mainContent: {
    flex: 1,
    justifyContent: "space-between",
  },

  /* =====================================================
     HEADER CONTAINER (Top box with shadow)
     ===================================================== */
  headerOuter: {
    marginHorizontal: -16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,

    // Box shadow (old design look)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,

    position: "relative",
    zIndex: 100,
  },

  /* =====================================================
     HEADER ROW (Logos + Language selector)
     ===================================================== */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56, // keeps center logo vertically aligned
  },

  /* Left App Logo */
  logoPrimary: {
    width: 100,
    height: 44,
  },

  /* Center Partner Logo (absolute centered) */
  centerLogoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // allows dropdown clicks
  },

  logoSecondary: {
    width: 90,
    height: 40,
  },

  /* =====================================================
     LANGUAGE DROPDOWN
     ===================================================== */
  langDropdownWrapper: {
    position: "relative",
  },

  langDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#F9FAFB",
  },

  langDropdownText: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },

  langDropdownArrow: {
    fontSize: 10,
    color: "#64748B",
  },

  langDropdownMenu: {
    position: "absolute",
    right: 0,
    top: 34,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 120,

    // 🔒 FORCE ALWAYS ON TOP
    zIndex: 9999,
    elevation: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },


  langOptionRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  langOptionText: {
    fontSize: 14,
    color: "#334155",
  },

  /* =====================================================
     TRICOLOUR STRIP (Header & Footer)
     ===================================================== */
  tricolourStrip: {
    flexDirection: "row",
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },

  tricolourStripFooter: {
    flexDirection: "row",
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },

  triBlock: {
    flex: 1,
  },

  /* =====================================================
     LOGIN CARD WRAPPER
     ===================================================== */
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },

  cardGlowWrapper: {
    width: "92%",
    maxWidth: 380,
    borderRadius: 30,
    padding: 2,

    // glowing shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },

  cardWrapper: {
    borderRadius: 26,
    overflow: "hidden",
  },

  card: {
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* =====================================================
     CARD TEXT
     ===================================================== */
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
  },

  /* =====================================================
     FORM FIELDS
     ===================================================== */
  fieldGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  inputError: {
    borderColor: "#DC2626",
  },

  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#DC2626",
  },

  /* =====================================================
     LOGIN BUTTON
     ===================================================== */
  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* =====================================================
     LINKS BELOW BUTTON
     ===================================================== */
  linkGroup: {
    marginTop: 14, // space after button
    gap: 6,        // space between links
  },

  link: {
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "center",
  },

  /* =====================================================
     FOOTER (Bottom box with shadow)
     ===================================================== */
  footerOuter: {
    marginHorizontal: -16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,

    // box shadow from top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  footerInner: {
    alignItems: "center",
    gap: 4,
  },

  footerBuild: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  footerSlogan: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    fontStyle: "italic",
  },
});