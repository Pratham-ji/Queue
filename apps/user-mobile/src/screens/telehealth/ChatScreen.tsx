import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../services/api";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  bubbleMe: "#10B981",
  bubbleThem: "#E2E8F0",
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { threadId, profile, isActive } = route.params;

  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    api.get("/auth/me").then((res: any) => setUserId(res.data.data?.id));
    
    // In a real app, you would set up socket listeners here for real-time messages.
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000); // Polling for now
    
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get(`/chat/threads/${threadId}/messages`);
      setMessages(res.data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post("/chat/messages", {
        threadId,
        content: content.trim()
      });
      setContent("");
      fetchMessages(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === userId;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && <Image source={{ uri: profile?.image }} style={styles.msgAvatar} />}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.msgText, isMe ? { color: "#FFF" } : { color: COLORS.text }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Image source={{ uri: profile?.image }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{profile?.name}</Text>
          <Text style={styles.headerStatus}>{isActive ? "Active Consultation" : "Closed"}</Text>
        </View>
      </View>

      {/* MESSAGES */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* INPUT */}
        {isActive ? (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.subText}
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !content.trim() && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!content.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.closedArea}>
            <Ionicons name="lock-closed" size={20} color={COLORS.subText} />
            <Text style={styles.closedText}>This consultation thread is closed.</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { marginRight: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  headerStatus: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },
  msgLeft: { justifyContent: "flex-start" },
  msgRight: { justifyContent: "flex-end" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: { backgroundColor: COLORS.bubbleMe, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: COLORS.bubbleThem, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  closedArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  closedText: { color: COLORS.subText, fontSize: 14, fontWeight: "500" },
});
