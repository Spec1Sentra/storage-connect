import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Replicating the color palette from the original Tailwind CSS
const colors = {
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  navy600: "#4F46E5",
  navy700: "#4338CA",
  navy800: "#3730A3",
  navy900: "#312E81",
  gold500: "#F59E0B",
  gold400: "#FBBF24",
  white: "#FFFFFF",
  black: "#000000",
};

export default function StorageConnectHomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
  };



  const handleUpload = () => {
    console.log("Uploading unit photo...");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>StorageConnect</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search photos or storage IDs..."
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Feather name="search" size={16} color={colors.white} style={styles.icon} />
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
              <Feather name="upload-cloud" size={16} color={colors.black} style={styles.icon} />
              <Text style={[styles.buttonText, { color: colors.black }]}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ROLE SELECTION */}
        <View style={styles.mainContent}>
          <RoleCard
            title="I’m the New Owner"
            description="Upload unit photos, tag items, or list non-sentimental belongings."
            actions={["Upload a Unit Photo", "Tag Items", "List Non-Sentimental Items"]}
          />
          <RoleCard
            title="I’m the Previous Owner"
            description="Find your sentimental belongings or reconnect with found items."
            actions={["Search for My Items", "Request an Item", "Message the New Owner"]}
          />
          <RoleCard
            title="I’m the Storage Facility"
            description="Manage and verify uploaded storage units and their contents."
            actions={["Upload Unit Photo", "Verify Listing"]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleCard({ title, description, actions }) {
  return (
    <View style={styles.roleCard}>
      <Text style={styles.roleCardTitle}>{title}</Text>
      <Text style={styles.roleCardDescription}>{description}</Text>
      <View style={styles.actionsContainer}>
        {actions.map((action, idx) => (
          <TouchableOpacity key={idx} style={styles.actionButton}>
            <Text style={styles.buttonText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray200,
  },
  container: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.navy800,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    gap: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray400,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    fontSize: 16,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: colors.navy800,
    padding: 12,
    borderRadius: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: colors.gold500,
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  },
  mainContent: {
    gap: 24,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleCardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.navy800,
    marginBottom: 8,
  },
  roleCardDescription: {
    color: colors.gray600,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 8,
  },
  actionButton: {
    backgroundColor: colors.navy700,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});