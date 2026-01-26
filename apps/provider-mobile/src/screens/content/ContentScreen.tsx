import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  type: string;
  updatedAt: string;
}

interface ContentScreenProps {
  route: {
    params: {
      slug: string;
      title?: string;
      role?: "PROVIDER" | "ADMIN" | "STAFF";
    };
  };
  navigation: any;
}

export default function ContentScreen({
  route,
  navigation,
}: ContentScreenProps) {
  const { slug, title, role = "PROVIDER" } = route.params;
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

      const response = await fetch(
        `${API_URL}/api/pages/${slug}?role=${role}`
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404 ? "Page not found" : "Failed to load page"
        );
      }

      const data = await response.json();
      setPage(data.page);

      // Update navigation title
      if (navigation?.setOptions) {
        navigation.setOptions({
          title: data.page.title,
        });
      }
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

        {/* Render content */}
        {page?.content && (
          <Text style={styles.body}>{page.content}</Text>
        )}

        <Text style={styles.lastUpdated}>
          Last updated: {new Date(page?.updatedAt || "").toLocaleDateString()}
        </Text>

        {/* Debug info */}
        <Text style={styles.debugText}>Page Type: {page?.type}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
  debugText: {
    fontSize: 10,
    color: "#ccc",
  },
});
