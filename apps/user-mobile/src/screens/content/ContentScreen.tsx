import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Props = NativeStackScreenProps<any, "ContentPage">;

interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  type: string;
  updatedAt: string;
}

export default function ContentScreen({ route, navigation }: Props) {
  const { slug, title } = route.params;
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);

      // USER role - adjust if needed
      const response = await fetch(
        `${API_URL}/api/pages/${slug}?role=USER`
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404 ? "Page not found" : "Failed to load page"
        );
      }

      const data = await response.json();
      setPage(data.page);

      // Update navigation title
      navigation.setOptions({
        title: data.page.title,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{page?.title}</Text>

        {/* Render content - parse if JSON, otherwise render as HTML */}
        {page?.content && (
          <Text style={styles.body}>{page.content}</Text>
        )}

        <Text style={styles.lastUpdated}>
          Last updated: {new Date(page?.updatedAt || "").toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
});
