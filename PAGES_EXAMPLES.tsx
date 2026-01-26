/**
 * QUICK START: Page Navigation Examples
 * 
 * This file shows real-world examples of how to use the content page system
 * in both user-mobile and provider-mobile apps.
 */

// ============================================
// USER MOBILE APP EXAMPLES
// ============================================

// Example 1: Settings Screen with Help Links
import React from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useContentNavigation } from "../hooks/useContentNavigation";

export function UserSettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <ScrollView>
      {/* Account Settings */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Account</Text>
        <TouchableOpacity>
          <Text>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Help & Support Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Help & Support</Text>
        
        <TouchableOpacity 
          onPress={() => navigateToPage("how-it-works", "How It Works")}
        >
          <Text>📖 How Queue Works</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage("faq", "FAQ")}
        >
          <Text>❓ Frequently Asked Questions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage("support")}
        >
          <Text>🆘 Get Support</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Legal</Text>
        
        <TouchableOpacity 
          onPress={() => navigateToPage("privacy-policy", "Privacy Policy")}
        >
          <Text>🔒 Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage("terms-of-service", "Terms")}
        >
          <Text>⚖️ Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================
// PROVIDER MOBILE APP EXAMPLES
// ============================================

// Example 2: Provider Settings Screen
export function ProviderSettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <ScrollView>
      {/* Clinic Settings */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Clinic</Text>
        <TouchableOpacity>
          <Text>Edit Clinic Details</Text>
        </TouchableOpacity>
      </View>

      {/* Documentation */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Documentation</Text>
        
        <TouchableOpacity 
          onPress={() => navigateToPage(
            "provider-guide", 
            "Provider Guide",
            "PROVIDER"
          )}
        >
          <Text>📘 Provider User Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage(
            "queue-management",
            "Queue Management",
            "PROVIDER"
          )}
        >
          <Text>📊 Queue Management Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage(
            "analytics-help",
            "Analytics",
            "PROVIDER"
          )}
        >
          <Text>📈 Understanding Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Support</Text>
        
        <TouchableOpacity 
          onPress={() => navigateToPage("support", "Technical Support", "PROVIDER")}
        >
          <Text>🆘 Get Technical Support</Text>
        </TouchableOpacity>
      </View>

      {/* Legal - Same for both */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Legal</Text>
        
        <TouchableOpacity 
          onPress={() => navigateToPage("privacy-policy")}
        >
          <Text>🔒 Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateToPage("terms-of-service")}
        >
          <Text>⚖️ Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================
// ADDING A LINK IN ANY COMPONENT
// ============================================

// Simply import and use the hook:
import { useContentNavigation } from "../hooks/useContentNavigation";

function MyComponent() {
  const { navigateToPage } = useContentNavigation();

  return (
    <TouchableOpacity onPress={() => navigateToPage("faq")}>
      <Text>Need help? Check our FAQ</Text>
    </TouchableOpacity>
  );
}

// ============================================
// API USAGE (BACKEND TESTING)
// ============================================

/*
Test these endpoints in Postman or curl:

1. Get all pages for a user:
   GET http://localhost:3000/api/pages?role=USER

2. Get a specific page:
   GET http://localhost:3000/api/pages/faq?role=USER

3. Get provider pages:
   GET http://localhost:3000/api/pages?role=PROVIDER
   GET http://localhost:3000/api/pages/provider-guide?role=PROVIDER

4. Create a new page (admin):
   POST http://localhost:3000/api/pages/admin
   Body: {
     "slug": "my-custom-page",
     "title": "My Custom Page",
     "content": "This is my custom page content",
     "type": "GUIDE",
     "userRole": ["USER", "PROVIDER"]
   }

5. Delete a page (admin):
   DELETE http://localhost:3000/api/pages/admin/my-custom-page
*/

// ============================================
// ADDING A NEW PAGE STEP-BY-STEP
// ============================================

/*
Step 1: Add content to database (via API or seed)
  {
    "slug": "onboarding",
    "title": "Getting Started",
    "content": "Welcome to Queue Pro...",
    "type": "GUIDE",
    "userRole": ["USER"]
  }

Step 2: Add navigation link in a screen component
  const { navigateToPage } = useContentNavigation();
  <TouchableOpacity onPress={() => navigateToPage("onboarding")}>
    <Text>Learn More</Text>
  </TouchableOpacity>

Step 3: User can now view the page!
  - Clicking the link navigates to ContentScreen
  - ContentScreen fetches from API
  - Content displays with proper formatting
*/

export { UserSettingsScreen, ProviderSettingsScreen };
