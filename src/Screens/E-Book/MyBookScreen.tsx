import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiService } from "../../services/api";
import { secureStorage } from "../../services/secureStorage";

interface ChapterItem {
  chapterNumber: number;
  title: string;
  pageRange: string;
  excerpt?: string;
  keyTakeaways?: string[];
}

const DEFAULT_CHAPTERS: ChapterItem[] = [
  {
    chapterNumber: 1,
    title: "Chapter 1 | The Hope",
    pageRange: "pp. 12-50",
    excerpt:
      "The fundamental blueprint for youth mobilization and nationwide education reform to foster homegrown innovation and self-reliance across Nepal.",
    keyTakeaways: [
      "Replacing import dependency with local production hubs",
      "Harnessing digital public goods for economic sovereignty",
      "Deploying sovereign wealth allocations for critical infrastructure",
    ],
  },
  {
    chapterNumber: 2,
    title: "Chapter 2 | The Vision & Policy",
    pageRange: "pp. 51-98",
    excerpt:
      "Comprehensive architecture on monetary policies, healthcare infrastructure, free public legal aid, and generating 100,000+ skilled employment opportunities.",
    keyTakeaways: [
      "Phased rollout of subsidized neighborhood health outposts",
      "Emergency drone logistics for remote mountainous regions",
      "Zero out-of-pocket costs for essential treatments",
    ],
  },
  {
    chapterNumber: 3,
    title: "Chapter 3 | Economic Revolution",
    pageRange: "pp. 99-145",
    excerpt:
      "The strategic masterplan towards making Nepal economically sovereign, eliminating foreign debt dependency, and establishing a Gen Z-led economic wave.",
    keyTakeaways: [
      "100% scholarship frameworks funded by sovereign bonds",
      "Vocational certification matched directly with green industries",
      "Elimination of youth brain drain via technological innovation hubs",
    ],
  },
];

export default function MyBookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [liveBook, setLiveBook] = useState<any>(null);

  // Chapter Reader Modal
  const [activeChapter, setActiveChapter] = useState<ChapterItem | null>(null);
  const [showReaderModal, setShowReaderModal] = useState<boolean>(false);
  const [readerFontSize, setReaderFontSize] = useState<number>(16);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setLoading(true);
    try {
      const token = await secureStorage.getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setHasPurchased(false);
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);

      const [res, bookRes] = await Promise.all([
        apiService.getMyPurchaseStatus(),
        apiService.getBookDetails().catch(() => null),
      ]);

      if (bookRes && bookRes.data && bookRes.data.length > 0) {
        setLiveBook(bookRes.data[0]);
      }

      if (res && res.hasPurchased) {
        setHasPurchased(true);
        setPurchaseData(res.data);
      } else {
        setHasPurchased(false);
        setPurchaseData(null);
      }
    } catch {
      setHasPurchased(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const pdfUrl = liveBook?.pdfUrl || purchaseData?.book?.pdfUrl;
    if (!pdfUrl) {
      Alert.alert(
        "PDF Document",
        "The official digital edition PDF has not been uploaded yet.",
        [{ text: "OK" }]
      );
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) {
        await Linking.openURL(pdfUrl);
      } else {
        await WebBrowser.openBrowserAsync(pdfUrl);
      }
    } catch {
      await WebBrowser.openBrowserAsync(pdfUrl);
    }
  };

  const handleOpenChapter = (chap: ChapterItem) => {
    setActiveChapter(chap);
    setShowReaderModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42"]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#3087E5" />
        <Text style={styles.loadingText}>Checking digital ownership...</Text>
      </View>
    );
  }

  // Case 1: User not logged in
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Book</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconWrapper}>
            <Ionicons name="lock-closed" size={44} color="#3087E5" />
          </View>
          <Text style={styles.lockedTitle}>Sign In Required</Text>
          <Text style={styles.lockedSubtitle}>
            Please sign in to view your verified purchases and read your Kalki
            digital book.
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            activeOpacity={0.85}
            onPress={() => router.push("/Auth/login" as any)}
          >
            <Text style={styles.unlockButtonText}>Sign In to Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Case 2: User is logged in, but hasn't purchased the book yet
  if (!hasPurchased) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Book</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lockedCard}>
            <Image
              source={require("../../../assets/images/bookcover.png")}
              style={styles.lockedBookImage}
              contentFit="contain"
            />
            <View style={styles.lockBadgeOverlay}>
              <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.lockedBookTitle}>
              Economic Revolution to make Nepal A World Leader
            </Text>
            <Text style={styles.lockedAuthor}>Jay Sah (MR. 666)</Text>

            <View style={styles.noticeBox}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={20}
                color="#FBBF24"
              />
              <Text style={styles.noticeText}>
                Full digital chapters and audio access are unlocked immediately
                upon verified eSewa payment confirmation.
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Access Fee:</Text>
              <Text style={styles.priceAmount}>NPR 1,000</Text>
            </View>

            <TouchableOpacity
              style={styles.unlockButton}
              activeOpacity={0.85}
              onPress={() => router.push("/Home/bookdetails" as any)}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={styles.unlockButtonText}>
                Unlock with eSewa Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={checkAccess}
            >
              <Ionicons name="refresh" size={16} color="#8EA4BE" />
              <Text style={styles.refreshButtonText}>
                Already paid? Tap to check status
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Case 3: Verified Purchase - Full In-App Reader & Chapter Access
  const chapters: ChapterItem[] =
    liveBook?.chapters && liveBook.chapters.length > 0
      ? liveBook.chapters.slice(0, 3)
      : purchaseData?.book?.chapters && purchaseData.book.chapters.length > 0
        ? purchaseData.book.chapters.slice(0, 3)
        : DEFAULT_CHAPTERS.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Digital Library</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={checkAccess}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Verified Ownership Hero Card */}
        <View style={styles.ownershipCard}>
          <View style={styles.verifiedHeaderRow}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
              <Text style={styles.verifiedBadgeText}>VERIFIED OWNER</Text>
            </View>
            <Text style={styles.verifiedFormat}>
              {purchaseData?.bookAppearance === "physical"
                ? "Physical Copy + Digital Access"
                : "Digital Edition"}
            </Text>
          </View>

          <View style={styles.bookHeaderRow}>
            <Image
              source={require("../../../assets/images/bookcover.png")}
              style={styles.ownedBookImage}
              contentFit="contain"
            />
            <View style={styles.ownedBookMeta}>
              <Text style={styles.ownedBookTitle}>
                {purchaseData?.book?.title ||
                  "Economic Revolution to make Nepal A World Leader"}
              </Text>
              <Text style={styles.ownedAuthor}>
                By {purchaseData?.book?.author || "Jay Sah (MR. 666)"}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Order ID:</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {purchaseData?.orderId || "Verified"}
                </Text>
              </View>

              {purchaseData?.esewaTransactionCode && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>eSewa Ref:</Text>
                  <Text style={styles.metaValueHighlight} numberOfLines={1}>
                    {purchaseData.esewaTransactionCode}
                  </Text>
                </View>
              )}

              {purchaseData?.pickupLocation && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Pickup:</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {purchaseData.pickupLocation}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* PDF Download Button for Verified Buyers */}
        <TouchableOpacity
          style={styles.downloadPdfBanner}
          activeOpacity={0.85}
          onPress={handleDownloadPdf}
        >
          <View style={styles.downloadPdfIconBox}>
            <Ionicons name="document-text" size={24} color="#EF4444" />
          </View>
          <View style={styles.downloadPdfTextBox}>
            <Text style={styles.downloadPdfTitle}>Download Official Book PDF</Text>
            <Text style={styles.downloadPdfSubtext} numberOfLines={1}>
              {liveBook?.pdfFileName || "Economic_Revolution_to_make_Nepal_A_World_Leader.pdf"}
            </Text>
          </View>
          <View style={styles.downloadPdfActionBadge}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.downloadPdfActionText}>Download</Text>
          </View>
        </TouchableOpacity>

        {/* Chapters Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Table of Contents</Text>
          <Text style={styles.sectionBadge}>
            {chapters.length} Chapters Available
          </Text>
        </View>

        {/* Chapters List */}
        {chapters.map((chap: ChapterItem, idx: number) => (
          <TouchableOpacity
            key={`chap-${idx}`}
            style={styles.chapterCard}
            activeOpacity={0.8}
            onPress={() => handleOpenChapter(chap)}
          >
            <View style={styles.chapterNumBox}>
              <Text style={styles.chapterNumText}>
                {chap.chapterNumber < 10
                  ? `0${chap.chapterNumber}`
                  : chap.chapterNumber}
              </Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>{chap.title}</Text>
              <Text style={styles.chapterPages}>{chap.pageRange}</Text>
              {chap.excerpt ? (
                <Text style={styles.chapterExcerpt} numberOfLines={2}>
                  {chap.excerpt}
                </Text>
              ) : null}
            </View>
            <View style={styles.chapterArrow}>
              <Ionicons name="book-outline" size={20} color="#3087E5" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chapter Reader Modal */}
      <Modal
        visible={showReaderModal}
        animationType="slide"
        onRequestClose={() => setShowReaderModal(false)}
      >
        <View style={styles.readerContainer}>
          <StatusBar style="light" />
          <LinearGradient
            colors={["#06152B", "#0B1E38", "#07172C"]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.readerHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.readerCloseBtn}
              onPress={() => setShowReaderModal(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.readerHeaderTitleCol}>
              <Text style={styles.readerHeaderNumber}>
                CHAPTER {activeChapter?.chapterNumber}
              </Text>
              <Text style={styles.readerHeaderTitle} numberOfLines={1}>
                {activeChapter?.title}
              </Text>
            </View>

            {/* Font size toggles */}
            <View style={styles.fontSizeControls}>
              <TouchableOpacity
                onPress={() =>
                  setReaderFontSize((prev) => Math.max(14, prev - 2))
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setReaderFontSize((prev) => Math.min(24, prev + 2))
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.readerScroll,
              { paddingBottom: insets.bottom + 40 },
            ]}
          >
            <View style={styles.readerTitleBox}>
              <Text style={styles.readerBigChapter}>
                Chapter {activeChapter?.chapterNumber}
              </Text>
              <Text style={styles.readerBigTitle}>{activeChapter?.title}</Text>
              <Text style={styles.readerPageRange}>
                {activeChapter?.pageRange}
              </Text>
            </View>

            <View style={styles.readerDivider} />

            <Text style={[styles.readerBodyText, { fontSize: readerFontSize }]}>
              {activeChapter?.excerpt}
            </Text>

            {activeChapter?.keyTakeaways &&
              activeChapter.keyTakeaways.length > 0 && (
                <View style={styles.takeawaysCard}>
                  <Text style={styles.takeawaysTitle}>
                    Key Transformative Tenets:
                  </Text>
                  {activeChapter.keyTakeaways.map((point, pIdx) => (
                    <View key={`pt-${pIdx}`} style={styles.takeawayRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#4ADE80"
                        style={{ marginTop: 2 }}
                      />
                      <Text
                        style={[
                          styles.takeawayText,
                          { fontSize: readerFontSize - 1 },
                        ]}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            <View style={styles.readerFooterNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#60BB46"
              />
              <Text style={styles.readerFooterText}>
                Verified Digital Reader • Kalki Sena Research and Training
                Center
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020b18",
  },
  loadingText: {
    color: "#8EA4BE",
    marginTop: 14,
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
  },
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  lockedIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(48, 135, 229, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(48, 135, 229, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  lockedSubtitle: {
    fontSize: 14,
    color: "#8EA4BE",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3087E5",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  lockedCard: {
    backgroundColor: "#081E38",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#183359",
    padding: 20,
    alignItems: "center",
  },
  lockedBookImage: {
    width: 150,
    height: 220,
    borderRadius: 10,
    marginBottom: 16,
  },
  lockBadgeOverlay: {
    position: "absolute",
    top: 105,
    backgroundColor: "rgba(2, 11, 24, 0.85)",
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#3087E5",
  },
  lockedBookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  lockedAuthor: {
    fontSize: 14,
    color: "#3087E5",
    fontWeight: "600",
    marginBottom: 16,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.25)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  noticeText: {
    flex: 1,
    color: "#FBBF24",
    fontSize: 12.5,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  priceLabel: {
    color: "#8EA4BE",
    fontSize: 14,
  },
  priceAmount: {
    color: "#4ADE80",
    fontSize: 20,
    fontWeight: "800",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  refreshButtonText: {
    color: "#8EA4BE",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  ownershipCard: {
    backgroundColor: "#0A2446",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#204B7B",
    padding: 16,
    marginBottom: 16,
  },
  downloadPdfBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 36, 70, 0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  downloadPdfIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadPdfTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  downloadPdfTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  downloadPdfSubtext: {
    color: "#7A8D9E",
    fontSize: 11,
    marginTop: 2,
  },
  downloadPdfActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  downloadPdfActionText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  verifiedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  verifiedFormat: {
    color: "#8EA4BE",
    fontSize: 11.5,
  },
  bookHeaderRow: {
    flexDirection: "row",
    gap: 14,
  },
  ownedBookImage: {
    width: 80,
    height: 115,
    borderRadius: 8,
  },
  ownedBookMeta: {
    flex: 1,
    justifyContent: "center",
  },
  ownedBookTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 3,
  },
  ownedAuthor: {
    color: "#3087E5",
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 3,
  },
  metaLabel: {
    color: "#8EA4BE",
    fontSize: 11.5,
    width: 60,
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 11.5,
    flex: 1,
  },
  metaValueHighlight: {
    color: "#60BB46",
    fontSize: 11.5,
    fontWeight: "700",
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  sectionBadge: {
    color: "#8EA4BE",
    fontSize: 12,
  },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071B33",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#163152",
    padding: 14,
    marginBottom: 12,
  },
  chapterNumBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(48, 135, 229, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chapterNumText: {
    color: "#3087E5",
    fontSize: 15,
    fontWeight: "800",
  },
  chapterInfo: {
    flex: 1,
    marginRight: 8,
  },
  chapterTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 2,
  },
  chapterPages: {
    color: "#8EA4BE",
    fontSize: 11.5,
    marginBottom: 4,
  },
  chapterExcerpt: {
    color: "#6882A0",
    fontSize: 12,
    lineHeight: 16,
  },
  chapterArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  readerContainer: {
    flex: 1,
    backgroundColor: "#06152B",
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  readerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  readerHeaderTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  readerHeaderNumber: {
    color: "#3087E5",
    fontSize: 11,
    fontWeight: "800",
  },
  readerHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fontSizeControls: {
    flexDirection: "row",
    gap: 6,
  },
  fontBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  fontBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  readerScroll: {
    padding: 20,
  },
  readerTitleBox: {
    marginBottom: 16,
  },
  readerBigChapter: {
    color: "#3087E5",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  readerBigTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 6,
  },
  readerPageRange: {
    color: "#8EA4BE",
    fontSize: 13,
  },
  readerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  readerBodyText: {
    color: "#D4DFEE",
    lineHeight: 26,
    marginBottom: 24,
  },
  takeawaysCard: {
    backgroundColor: "#0B2240",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E426F",
    padding: 16,
    marginBottom: 24,
  },
  takeawaysTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  takeawayRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  takeawayText: {
    color: "#C2D3E8",
    flex: 1,
    lineHeight: 20,
  },
  readerFooterNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
  },
  readerFooterText: {
    color: "#6882A0",
    fontSize: 11.5,
  },
});
