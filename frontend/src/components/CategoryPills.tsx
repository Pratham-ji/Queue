import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";

// Define what props this component accepts
interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onCategoryPress: (category: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategory,
  onCategoryPress,
}) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((category, index) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.pill, isActive && styles.activePill]}
              onPress={() => onCategoryPress(category)}
              activeOpacity={0.7}
            >
              <Text style={[styles.text, isActive && styles.activeText]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, // Parent handles padding
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Light grey default
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activePill: {
    backgroundColor: "#047857", // Brand Green
    borderColor: "#047857",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default CategoryPills;
