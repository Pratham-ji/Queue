const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/home/HomeScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add Socket.io listening in useEffect
// First, import io
if (!code.includes("import { io }")) {
  code = code.replace('import { api } from "../../services/api";', 'import { api } from "../../services/api";\nimport { io } from "socket.io-client";\nconst SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://13.201.230.245:5001";');
}

// 2. Modify useEffect
const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/;
const newUseEffect = `useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOfflineStatus(!state.isConnected);
    });

    const fetchData = async () => {
      try {
        const clinicRes = await api.get("/hospital/clinics");
        if (clinicRes.data.success) {
          setClinics(clinicRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Listen for live updates
    const socket = io(SOCKET_URL);
    // Since we want live updates for all clinics on the home screen, 
    // ideally the backend would broadcast to a global 'marketplace' room. 
    // We'll listen to a generic 'clinics_updated' event here and re-fetch.
    socket.on("clinics_updated", () => {
      fetchData();
    });

    return () => {
      unsubscribe();
      socket.disconnect();
    };
  }, []);`;
code = code.replace(useEffectRegex, newUseEffect);

// 3. Modify renderClinicCard
const renderCardRegex = /const renderClinicCard = \(clinic: any\) => \{[\s\S]*?return \([\s\S]*?<\/Pressable>\);\n  \};/;

const newRenderCard = `const renderClinicCard = (clinic: any) => {
    // Live metrics
    const queueCount = clinic._count?.patients || 0;
    // Avg 5 mins per patient logic
    const estWait = queueCount * 5;
    const doctorsCount = clinic.doctors?.length || 0;
    const isOnline = clinic.isOnline ?? true;

    return (
      <Pressable
        key={clinic.id}
        style={({ pressed }: { pressed: boolean }) => [styles.clinicCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        onPress={() => navigation.navigate("HospitalDetails", { id: clinic.id, clinicName: clinic.name })}
      >
        <Image 
          source={{ uri: clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} 
          style={styles.clinicImage} 
        />
        
        <View style={styles.clinicInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.clinicName} numberOfLines={1}>{clinic.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{clinic.rating || "4.9"}</Text>
              <Ionicons name="star" size={10} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.clinicAddress} numberOfLines={1}>
            {clinic.address}, {clinic.city}
          </Text>

          <View style={styles.badgeRow}>
            {!isOnline ? (
              <View style={[styles.badge, { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }]}>
                <View style={[styles.dot, { backgroundColor: "#9CA3AF" }]} />
                <Text style={[styles.badgeText, { color: "#4B5563" }]}>Offline / Closed</Text>
              </View>
            ) : clinic.isEmergencyPause ? (
              <View style={[styles.badge, clinic.emergencyMessage === 'EMERGENCY' ? { backgroundColor: "#FEF2F2", borderColor: "#FECACA" } : { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                <View style={[styles.dot, clinic.emergencyMessage === 'EMERGENCY' ? { backgroundColor: "#EF4444" } : { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.badgeText, clinic.emergencyMessage === 'EMERGENCY' ? { color: "#B91C1C" } : { color: "#92400E" }]}>
                  {clinic.emergencyMessage === 'EMERGENCY' ? "Paused (Emergency)" : "Paused (Doctor on Break)"}
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>Live ({queueCount} in queue)</Text>
              </View>
            )}
            
            {isOnline && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⏱️ ~{estWait} mins</Text>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.doctorCount}>👨‍⚕️ {doctorsCount} {doctorsCount === 1 ? 'Doctor' : 'Doctors'} Available</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </View>
      </Pressable>
    );
  };`;

code = code.replace(renderCardRegex, newRenderCard);
fs.writeFileSync(file, code);
