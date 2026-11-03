import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export interface CountryItem {
  name: string;
  code: string;
  iso: string;
  flag: string;
}

// Comprehensive Countries list with Nepal and neighboring/popular destinations prioritized
export const COUNTRIES: CountryItem[] = [
  { name: "Nepal", code: "+977", iso: "NP", flag: "🇳🇵" },
  { name: "India", code: "+91", iso: "IN", flag: "🇮🇳" },
  { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
  { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
  { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
  { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪" },
  { name: "Qatar", code: "+974", iso: "QA", flag: "🇶🇦" },
  { name: "Saudi Arabia", code: "+966", iso: "SA", flag: "🇸🇦" },
  { name: "Kuwait", code: "+965", iso: "KW", flag: "🇰🇼" },
  { name: "Bahrain", code: "+973", iso: "BH", flag: "🇧🇭" },
  { name: "Oman", code: "+968", iso: "OM", flag: "🇴🇲" },
  { name: "Malaysia", code: "+60", iso: "MY", flag: "🇲🇾" },
  { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
  { name: "South Korea", code: "+82", iso: "KR", flag: "🇰🇷" },
  { name: "Singapore", code: "+65", iso: "SG", flag: "🇸🇬" },
  { name: "China", code: "+86", iso: "CN", flag: "🇨🇳" },
  { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪" },
  { name: "France", code: "+33", iso: "FR", flag: "🇫🇷" },
  { name: "Italy", code: "+39", iso: "IT", flag: "🇮🇹" },
  { name: "Spain", code: "+34", iso: "ES", flag: "🇪🇸" },
  { name: "Portugal", code: "+351", iso: "PT", flag: "🇵🇹" },
  { name: "Netherlands", code: "+31", iso: "NL", flag: "🇳🇱" },
  { name: "Switzerland", code: "+41", iso: "CH", flag: "🇨🇭" },
  { name: "Sweden", code: "+46", iso: "SE", flag: "🇸🇪" },
  { name: "Norway", code: "+47", iso: "NO", flag: "🇳🇴" },
  { name: "Denmark", code: "+45", iso: "DK", flag: "🇩🇰" },
  { name: "Poland", code: "+48", iso: "PL", flag: "🇵🇱" },
  { name: "Ireland", code: "+353", iso: "IE", flag: "🇮🇪" },
  { name: "Bangladesh", code: "+880", iso: "BD", flag: "🇧🇩" },
  { name: "Pakistan", code: "+92", iso: "PK", flag: "🇵🇰" },
  { name: "Sri Lanka", code: "+94", iso: "LK", flag: "🇱🇰" },
  { name: "Bhutan", code: "+975", iso: "BT", flag: "🇧🇹" },
  { name: "Maldives", code: "+960", iso: "MV", flag: "🇲🇻" },
  { name: "Philippines", code: "+63", iso: "PH", flag: "🇵🇭" },
  { name: "Thailand", code: "+66", iso: "TH", flag: "🇹🇭" },
  { name: "Indonesia", code: "+62", iso: "ID", flag: "🇮🇩" },
  { name: "Vietnam", code: "+84", iso: "VN", flag: "🇻🇳" },
  { name: "New Zealand", code: "+64", iso: "NZ", flag: "🇳🇿" },
  { name: "Turkey", code: "+90", iso: "TR", flag: "🇹🇷" },
  { name: "Russia", code: "+7", iso: "RU", flag: "🇷🇺" },
  { name: "South Africa", code: "+27", iso: "ZA", flag: "🇿🇦" },
  { name: "Nigeria", code: "+234", iso: "NG", flag: "🇳🇬" },
  { name: "Kenya", code: "+254", iso: "KE", flag: "🇰🇪" },
  { name: "Egypt", code: "+20", iso: "EG", flag: "🇪🇬" },
  { name: "Brazil", code: "+55", iso: "BR", flag: "🇧🇷" },
  { name: "Argentina", code: "+54", iso: "AR", flag: "🇦🇷" },
  { name: "Mexico", code: "+52", iso: "MX", flag: "🇲🇽" },
  { name: "Colombia", code: "+57", iso: "CO", flag: "🇨🇴" },
  { name: "Chile", code: "+56", iso: "CL", flag: "🇨🇱" },
  { name: "Israel", code: "+972", iso: "IL", flag: "🇮🇱" },
  { name: "Hong Kong", code: "+852", iso: "HK", flag: "🇭🇰" },
  { name: "Taiwan", code: "+886", iso: "TW", flag: "🇹🇼" },
];

interface CountryCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryItem) => void;
  selectedCode?: string;
}

export default function CountryCodeModal({
  visible,
  onClose,
  onSelect,
  selectedCode = "+977",
}: CountryCodeModalProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.includes(query) ||
        c.iso.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (item: CountryItem) => {
    onSelect(item);
    setSearchQuery("");
    onClose();
  };

  const renderItem = ({ item }: { item: CountryItem }) => {
    const isSelected = item.code === selectedCode;
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.countryItemSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.flagText}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.countryIso}>({item.iso})</Text>
        </View>
        <Text style={styles.countryCode}>{item.code}</Text>
        <View style={styles.checkWrapper}>
          {isSelected && (
            <Ionicons name="checkmark" size={18} color="#2079F2" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          {/* Top handle pill */}
          <View style={styles.handleContainer}>
            <View style={styles.handlePill} />
          </View>

          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#8EA5C0" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#7D98B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country or code..."
                placeholderTextColor="#6884A4"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && Platform.OS !== "ios" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close" size={18} color="#8EA5C0" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => `${item.iso}-${item.code}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 12 },
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No country found</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: "82%",
    minHeight: "55%",
    backgroundColor: "#03142B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "#173864",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: "#2B4D77",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    backgroundColor: "#020B18",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#183863",
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 14.5,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  countryItemSelected: {
    backgroundColor: "rgba(32, 121, 242, 0.12)",
  },
  flagText: {
    fontSize: 22,
    marginRight: 14,
  },
  countryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countryName: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "500",
  },
  countryIso: {
    color: "#6884A4",
    fontSize: 12.5,
  },
  countryCode: {
    color: "#9BBBDC",
    fontSize: 14.5,
    fontWeight: "600",
    marginRight: 8,
  },
  checkWrapper: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#6884A4",
    fontSize: 14,
  },
});
