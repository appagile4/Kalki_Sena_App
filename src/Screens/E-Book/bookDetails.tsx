import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BranchClinic, BranchMapView } from "../../components/BranchMapView";
import { apiService } from "../../services/api";
import { secureStorage } from "../../services/secureStorage";

WebBrowser.maybeCompleteAuthSession();

type TabType = "About" | "Chapters" | "Reviews";
type BookAppearance = "physical" | "digital";
type PaymentMethod = "esewa" | "khalti" | "qr" | "bank";
type ScreenStep = "details" | "pickup" | "payment" | "bank_form";

export default function BookDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("About");

  // Expandable description in top card
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);

  // Modals & Navigation steps
  const [currentStep, setCurrentStep] = useState<ScreenStep>("details");
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [showAppearanceModal, setShowAppearanceModal] =
    useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Selections
  const [bookAppearance, setBookAppearance] =
    useState<BookAppearance>("digital");
  const [selectedPickup, setSelectedPickup] = useState<string>("clinic_1");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");

  // Verified eSewa Payment & Ownership State
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [verifiedOrderId, setVerifiedOrderId] = useState<string>("");
  const [verifiedRefId, setVerifiedRefId] = useState<string>("");
  const [userHasPurchased, setUserHasPurchased] = useState<boolean>(false);
  const activeTxnUuidRef = useRef<string | null>(null);

  // Background/Foreground resumption listener to auto-verify status when returning from eSewa mobile app
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        nextAppState === "active" &&
        activeTxnUuidRef.current &&
        !userHasPurchased
      ) {
        try {
          const verifyRes = await apiService.verifyEsewaPayment({
            transactionUuid: activeTxnUuidRef.current,
          });
          if (verifyRes && verifyRes.success) {
            setVerifiedOrderId(verifyRes.orderId || "");
            setVerifiedRefId(verifyRes.refId || "VERIFIED");
            setUserHasPurchased(true);
            setShowSuccessModal(true);
            activeTxnUuidRef.current = null;
          }
        } catch {
          // If transaction is still awaiting confirmation or user toggled apps, no crash
        }
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [userHasPurchased]);

  // Bank Form State
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // User GPS Location & Clinic Search Filter
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 27.6915,
    longitude: 85.342,
  });
  const [clinicSearchQuery, setClinicSearchQuery] = useState<string>("");

  // Request user GPS location (safely guarded so it never crashes if native module is absent)
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        let LocationModule: any = null;
        try {
          LocationModule = require("expo-location");
        } catch {
          // Native module not registered
        }
        if (
          LocationModule &&
          LocationModule.requestForegroundPermissionsAsync
        ) {
          const { status } =
            await LocationModule.requestForegroundPermissionsAsync();
          if (status === "granted" && isMounted) {
            const pos = await LocationModule.getCurrentPositionAsync({
              accuracy: LocationModule.Accuracy?.Balanced,
            });
            if (isMounted && pos?.coords) {
              setUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            }
          }
        }
      } catch {
        // Fallback to Kathmandu center coordinates
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time backend book data
  const [bookData, setBookData] = useState<any>(null);
  const [loadingBook, setLoadingBook] = useState<boolean>(true);

  const fetchLiveBook = async () => {
    try {
      const res = await apiService.getBookDetails();
      if (res && res.success && res.data && res.data.length > 0) {
        setBookData(res.data[0]);
      }
    } catch {
      // offline fallback
    } finally {
      setLoadingBook(false);
    }
  };

  React.useEffect(() => {
    fetchLiveBook();
    checkUserOwnership();
    // Real-time synchronization polling every 5 seconds
    const interval = setInterval(() => {
      fetchLiveBook();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkUserOwnership = async () => {
    try {
      const token = await secureStorage.getAccessToken();
      if (token) {
        const purchaseRes = await apiService.getMyPurchaseStatus();
        if (purchaseRes && purchaseRes.hasPurchased) {
          setUserHasPurchased(true);
        }
      }
    } catch {
      // offline or unauthenticated
    }
  };

  // Dynamic Cover Image (Cloudinary or local asset fallback)
  const coverImageSource =
    bookData?.coverImage &&
    (bookData.coverImage.startsWith("http") ||
      bookData.coverImage.startsWith("data:"))
      ? { uri: bookData.coverImage }
      : require("../../../assets/images/bookcover.png");

  // Share action
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${bookData?.title || "Economic Revolution to make Nepal A World Leader"} by ${bookData?.author || "Jay Sah (MR. 666)"} - Buy on Kalki E-Book!`,
      });
    } catch (e) {
      // Ignored
    }
  };

  // Cart action
  const handleCartPress = () => {
    Alert.alert(
      "Cart",
      `Your cart has 1 book: ${bookData?.title || "Economic Revolution"} (${bookData?.currency || "NPR"} ${bookData?.price ? bookData.price.toLocaleString() : "1,000"}/-)`,
    );
  };

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    const pdfUrl = bookData?.pdfUrl;
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

  // Start checkout flow
  const handleBuyNowPress = async () => {
    if (userHasPurchased) {
      Alert.alert(
        "Already Purchased",
        "You have already purchased this book and have full verified access.",
        [
          {
            text: "Read in My Book",
            onPress: () => router.push("/Home/mybook" as any),
          },
          { text: "Dismiss", style: "cancel" },
        ],
      );
      return;
    }

    const token = await secureStorage.getAccessToken();
    if (!token) {
      Alert.alert(
        "Login Required",
        "Please sign in or create an account to purchase this book with eSewa.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => router.push("/Auth/login" as any),
          },
        ],
      );
      return;
    }

    setShowAppearanceModal(true);
  };

  // Continue from Appearance Modal
  const handleAppearanceContinue = () => {
    setShowAppearanceModal(false);
    if (bookAppearance === "physical") {
      setCurrentStep("pickup");
    } else {
      setCurrentStep("payment");
    }
  };

  // Complete Payment (eSewa Native/Web Intent or Bank Transfer)
  // const handleCompletePayment = async () => {
  //   const clinicMap: Record<string, string> = {
  //     clinic_1: "Kalki Clinic - Baneshwor Branch",
  //     clinic_2: "Kalki Sena Clinic - Baneshwor Branch",
  //     clinic_3: "Kalki Clinic - Maitighar Branch",
  //     clinic_4: "Kalki Clinic - Putalisadak Branch",
  //     clinic_5: "Kalki Clinic - Jawalakhel Branch",
  //   };

  //   if (bookData?.pickupClinics) {
  //     bookData.pickupClinics.forEach((c: any) => {
  //       clinicMap[c.id] = c.name;
  //     });
  //   }

  //   const pickupLocation =
  //     bookAppearance === "physical"
  //       ? clinicMap[selectedPickup] ||
  //         selectedPickup ||
  //         "Kalki Clinic - Baneshwor Branch"
  //       : "Digital In-App Access";

  //   // 1. Official eSewa Native Gateway Flow (Direct App-to-App Intent)
  //   if (paymentMethod === "esewa") {
  //     try {
  //       const token = await secureStorage.getAccessToken();
  //       if (!token) {
  //         Alert.alert(
  //           "Login Required",
  //           "Please sign in before completing your eSewa purchase.",
  //           [
  //             { text: "Cancel", style: "cancel" },
  //             {
  //               text: "Sign In",
  //               onPress: () => router.push("/Auth/login" as any),
  //             },
  //           ]
  //         );
  //         return;
  //       }

  //       setIsProcessingPayment(true);

  //       // A. Backend initiates pending order, pending payment, and returns signed eSewa payload
  //       const initRes = await apiService.initiateEsewaPayment({
  //         bookAppearance,
  //         pickupLocation,
  //       });

  //       if (!initRes || !initRes.success) {
  //         if (initRes?.alreadyPurchased) {
  //           Alert.alert(
  //             "Already Owned",
  //             "You already have verified digital access to this book.",
  //             [
  //               {
  //                 text: "Go to My Book",
  //                 onPress: () => router.push("/Home/mybook" as any),
  //               },
  //               { text: "OK", style: "cancel" },
  //             ]
  //           );
  //           return;
  //         }
  //         throw new Error(initRes?.message || "Failed to initiate eSewa payment");
  //       }

  //       const gatewayUrl =
  //         initRes.directBookingUrl || initRes.gatewayUrl || "";
  //       const txnUuid = initRes.transactionUuid || "";
  //       if (!txnUuid) {
  //         throw new Error("Invalid payment gateway response from server.");
  //       }

  //       // Store active transaction for background/foreground resumption checks
  //       activeTxnUuidRef.current = txnUuid;

  //       const amountVal = initRes.amount || initRes.esewaIntent?.totalAmount || "1000";
  //       const intentUrl =
  //         initRes.esewaIntent?.intentUrl ||
  //         `esewa://ea?amt=${amountVal}&txAmt=0&psc=0&pdc=0&scd=EPAYTEST&pid=${txnUuid}&su=${encodeURIComponent("kalkisenadrive://payment-success")}&fu=${encodeURIComponent("kalkisenadrive://payment-failure")}`;
  //       const intentV2Url = initRes.esewaIntent?.intentV2Url;
  //       const marketUrl =
  //         initRes.esewaIntent?.marketUrl || "market://details?id=com.f1soft.esewa";
  //       const appStoreUrl =
  //         initRes.esewaIntent?.appStoreUrl || "https://apps.apple.com/np/app/esewa/id1162483832";
  //       const playStoreUrl =
  //         initRes.esewaIntent?.playStoreUrl || "https://play.google.com/store/apps/details?id=com.f1soft.esewa";

  //       // B. Check if native eSewa application is installed on device
  //       let isAppInstalled = false;
  //       try {
  //         isAppInstalled = await Linking.canOpenURL("esewa://");
  //       } catch {
  //         isAppInstalled = false;
  //       }

  //       // Helper to run web checkout fallback
  //       const executeWebCheckout = async () => {
  //         try {
  //           setIsProcessingPayment(true);
  //           const returnUrl = "kalkisenadrive://payment-success";
  //           const webResult = await WebBrowser.openAuthSessionAsync(
  //             gatewayUrl,
  //             returnUrl
  //           );

  //           if (webResult.type === "success" && webResult.url) {
  //             const parsed = Linking.parse(webResult.url);
  //             const encodedData = (parsed.queryParams?.data as string) || undefined;
  //             const refId =
  //               (parsed.queryParams?.refId as string) ||
  //               (parsed.queryParams?.transaction_code as string) ||
  //               undefined;

  //             // Server-side verification
  //             const verifyRes = await apiService.verifyEsewaPayment({
  //               transactionUuid: txnUuid,
  //               encodedData,
  //               refId,
  //             });

  //             if (verifyRes && verifyRes.success) {
  //               activeTxnUuidRef.current = null;
  //               setVerifiedOrderId(verifyRes.orderId || initRes.orderId || "");
  //               setVerifiedRefId(verifyRes.refId || refId || "VERIFIED");
  //               setUserHasPurchased(true);
  //               setShowSuccessModal(true);
  //             } else {
  //               Alert.alert(
  //                 "eSewa Status Notice",
  //                 verifyRes?.message ||
  //                   "Payment was submitted but is currently awaiting gateway confirmation."
  //               );
  //             }
  //           } else if (webResult.type === "cancel" || webResult.type === "dismiss") {
  //             await apiService
  //               .verifyEsewaPayment({
  //                 transactionUuid: txnUuid,
  //                 failure: true,
  //                 status: "cancelled",
  //                 message: "User closed eSewa gateway before completion",
  //               })
  //               .catch(() => {});
  //             Alert.alert("Payment Cancelled", "eSewa payment window was closed.");
  //           }
  //         } catch (e: any) {
  //           Alert.alert("Payment Error", e.message || "Failed to complete eSewa web checkout.");
  //         } finally {
  //           setIsProcessingPayment(false);
  //         }
  //       };

  //       if (isAppInstalled) {
  //         // DIRECT APP-TO-APP PAYMENT: Launch installed eSewa app directly
  //         try {
  //           // Register deep link listener for return from eSewa app
  //           const sub = Linking.addEventListener("url", async (event) => {
  //             if (event.url.includes("payment-success") || event.url.includes("data=")) {
  //               sub.remove();
  //               const parsed = Linking.parse(event.url);
  //               const encodedData = (parsed.queryParams?.data as string) || undefined;
  //               const refId =
  //                 (parsed.queryParams?.refId as string) ||
  //                 (parsed.queryParams?.transaction_code as string) ||
  //                 undefined;

  //               const verifyRes = await apiService.verifyEsewaPayment({
  //                 transactionUuid: txnUuid,
  //                 encodedData,
  //                 refId,
  //               });

  //               if (verifyRes && verifyRes.success) {
  //                 activeTxnUuidRef.current = null;
  //                 setVerifiedOrderId(verifyRes.orderId || initRes.orderId || "");
  //                 setVerifiedRefId(verifyRes.refId || refId || "VERIFIED");
  //                 setUserHasPurchased(true);
  //                 setShowSuccessModal(true);
  //               }
  //             } else if (event.url.includes("payment-failure")) {
  //               sub.remove();
  //               await apiService
  //                 .verifyEsewaPayment({
  //                   transactionUuid: txnUuid,
  //                   failure: true,
  //                   status: "cancelled",
  //                   message: "Payment cancelled in eSewa mobile app",
  //                 })
  //                 .catch(() => {});
  //               Alert.alert("Payment Cancelled", "eSewa mobile transaction was cancelled.");
  //             }
  //           });

  //           // Open official eSewa mobile app directly via Native Intent
  //           await Linking.openURL(intentUrl);
  //         } catch (err: any) {
  //           // If primary intent URL fails, try v2 intent URL
  //           if (intentV2Url) {
  //             try {
  //               await Linking.openURL(intentV2Url);
  //             } catch {
  //               // If direct intent failed, fallback to web
  //               await executeWebCheckout();
  //             }
  //           } else {
  //             await executeWebCheckout();
  //           }
  //         }
  //       } else {
  //         // eSewa app is not installed: prompt user with choices
  //         Alert.alert(
  //           "eSewa App Not Installed",
  //           "The official eSewa mobile app was not detected on your device. Would you like to install eSewa from the app store for direct app payment, or continue via eSewa Web?",
  //           [
  //             {
  //               text: "Install eSewa",
  //               onPress: () => {
  //                 const targetStore =
  //                   Platform.OS === "android" ? marketUrl : appStoreUrl;
  //                 Linking.openURL(targetStore).catch(() => {
  //                   Linking.openURL(playStoreUrl);
  //                 });
  //               },
  //             },
  //             {
  //               text: "Pay via Web",
  //               onPress: executeWebCheckout,
  //             },
  //             {
  //               text: "Cancel",
  //               style: "cancel",
  //               onPress: () => {
  //                 apiService
  //                   .verifyEsewaPayment({
  //                     transactionUuid: txnUuid,
  //                     failure: true,
  //                     status: "cancelled",
  //                     message: "User declined to install eSewa or pay via web",
  //                   })
  //                   .catch(() => {});
  //               },
  //             },
  //           ]
  //         );
  //       }
  //     } catch (error: any) {
  //       Alert.alert(
  //         "Payment Failed",
  //         error.message || "Failed to process eSewa payment. Please try again."
  //       );
  //     } finally {
  //       setIsProcessingPayment(false);
  //     }
  //     return;
  //   }

  //   // 2. Bank transfer or alternate flow fallback
  //   try {
  //     setIsProcessingPayment(true);
  //     const payload = {
  //       customerName: "Kalki App Reader",
  //       bookAppearance,
  //       pickupLocation,
  //       paymentMethod,
  //       bankDetails:
  //         paymentMethod === "bank"
  //           ? {
  //               accountHolder,
  //               accountNumber,
  //               branchName,
  //               ifscCode,
  //             }
  //           : undefined,
  //       amount: bookData?.price || 1000,
  //       currency: bookData?.currency || "NPR",
  //     };

  //     const res = await apiService.createBookOrder(payload);
  //     setVerifiedOrderId(res?.data?.orderId || `KS-${Date.now()}`);
  //     setVerifiedRefId(`BANK-${Date.now().toString().slice(-6)}`);
  //     setShowSuccessModal(true);
  //   } catch (e: any) {
  //     Alert.alert("Order Error", e.message || "Failed to place order.");
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  const handleCompletePayment = () => {
    Alert.alert("Coming Soon", "Buying book coming soon.", [{ text: "OK" }]);
  };

  // Finish and return Home or My Book
  const handleSuccessBackHome = () => {
    setShowSuccessModal(false);
    router.replace("/Home" as any);
  };

  const handleSuccessGoToMyBook = () => {
    setShowSuccessModal(false);
    router.replace("/Home/mybook" as any);
  };

  // -------------------------------------------------------------
  // STEP: PICKUP LOCATION (For Physical Book)
  // -------------------------------------------------------------
  if (currentStep === "pickup") {
    const rawClinics: BranchClinic[] =
      bookData?.pickupClinics && bookData.pickupClinics.length > 0
        ? bookData.pickupClinics
        : [
            {
              id: "clinic_1",
              name: "Kalki Clinic - Baneshwor Branch",
              branch: "New Baneshwor",
              distance: "1.2 Km away",
              timing: "9 AM - 6 PM",
              address: "New Baneshwor Chowk, Kathmandu",
              phone: "+977-1-4782101",
              city: "Kathmandu",
              latitude: 27.6915,
              longitude: 85.342,
            },
            {
              id: "clinic_2",
              name: "Kalki Sena Clinic - Old Baneshwor Branch",
              branch: "Old Baneshwor",
              distance: "1.8 Km away",
              timing: "9 AM - 6 PM",
              address: "Purano Baneshwor, Kathmandu",
              phone: "+977-1-4782102",
              city: "Kathmandu",
              latitude: 27.7011,
              longitude: 85.3444,
            },
            {
              id: "clinic_3",
              name: "Kalki Clinic - Maitighar Branch",
              branch: "Maitighar",
              distance: "2.5 Km away",
              timing: "9 AM - 6 PM",
              address: "Maitighar Mandala, Kathmandu",
              phone: "+977-1-4265432",
              city: "Kathmandu",
              latitude: 27.6938,
              longitude: 85.3206,
            },
            {
              id: "clinic_4",
              name: "Kalki Clinic - Putalisadak Branch",
              branch: "Putalisadak",
              distance: "3.2 Km away",
              timing: "9 AM - 6 PM",
              address: "Putalisadak Plaza, Kathmandu",
              phone: "+977-1-4228911",
              city: "Kathmandu",
              latitude: 27.705,
              longitude: 85.32,
            },
            {
              id: "clinic_5",
              name: "Kalki Clinic - Jawalakhel Branch",
              branch: "Jawalakhel",
              distance: "4.5 Km away",
              timing: "9 AM - 6 PM",
              address: "Jawalakhel Roundabout, Lalitpur",
              phone: "+977-1-5541234",
              city: "Lalitpur",
              latitude: 27.6727,
              longitude: 85.3142,
            },
          ];

    const filteredClinics = rawClinics.filter((c: any) => {
      if (!clinicSearchQuery.trim()) return true;
      const q = clinicSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.branch && c.branch.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
      );
    });

    const displayClinics =
      filteredClinics.length > 0 ? filteredClinics : rawClinics;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep("details")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your Pickup Location</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#7A8D9E" />
            <TextInput
              placeholder="Search by area (Baneshwor, Maitighar, Lalitpur...)"
              placeholderTextColor="#7A8D9E"
              value={clinicSearchQuery}
              onChangeText={setClinicSearchQuery}
              style={styles.searchInput}
            />
            {clinicSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setClinicSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#7A8D9E" />
              </TouchableOpacity>
            )}
          </View>

          {/* Subheader */}
          <View style={styles.clinicSubheader}>
            <Ionicons name="navigate-circle" size={16} color="#00E5FF" />
            <Text style={styles.clinicSubheaderText}>
              Direct Route from Your Location to Selected Branch
            </Text>
          </View>

          {/* Real Interactive React Native Maps Branch View */}
          <BranchMapView
            clinics={displayClinics}
            selectedClinicId={selectedPickup}
            onSelectClinic={(id) => setSelectedPickup(id)}
            userLocation={userLocation}
          />

          {/* Clinic List Options Header */}
          <View style={styles.clinicListHeader}>
            <Text style={styles.clinicListTitle}>
              Kalki Sena Pickup Branches ({displayClinics.length})
            </Text>
            <Text style={styles.clinicListSubtitle}>
              Tap any branch to preview route
            </Text>
          </View>

          {/* Clinic List Options */}
          {displayClinics.map((clinic: any) => {
            const isSelected = selectedPickup === clinic.id;
            return (
              <TouchableOpacity
                key={clinic.id}
                style={[
                  styles.clinicOption,
                  isSelected && styles.clinicOptionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedPickup(clinic.id)}
              >
                <View
                  style={[
                    styles.clinicIconBox,
                    isSelected && styles.clinicIconBoxSelected,
                  ]}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={isSelected ? "#00E5FF" : "#7A8D9E"}
                  />
                </View>
                <View style={styles.clinicInfo}>
                  <Text
                    style={[
                      styles.clinicName,
                      isSelected && styles.clinicNameSelected,
                    ]}
                  >
                    {clinic.name}
                  </Text>
                  <Text style={styles.clinicDetails}>
                    {clinic.distance || "1.2 Km away"} •{" "}
                    {clinic.timing || "9 AM - 6 PM"}
                  </Text>
                  {clinic.address && (
                    <Text style={styles.clinicAddressSmall} numberOfLines={1}>
                      📍 {clinic.address}
                    </Text>
                  )}
                </View>

                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="radio-button-on"
                      size={22}
                      color="#00E5FF"
                    />
                  </View>
                ) : (
                  <Ionicons name="radio-button-off" size={20} color="#4A5D72" />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={() => setCurrentStep("payment")}
          >
            <Text style={styles.primaryActionButtonText}>
              Confirm Pickup Location
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STEP: BANK DETAILS FORM
  // -------------------------------------------------------------
  if (currentStep === "bank_form") {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep("payment")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter your Bank Details</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Dropdown: Pay from Bank */}
          <View style={styles.bankDropdown}>
            <Text style={styles.bankDropdownText}>Pay from Bank</Text>
            <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
          </View>

          {/* Input Fields */}
          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Account Holder Name"
              placeholderTextColor="#7A8D9E"
              value={accountHolder}
              onChangeText={setAccountHolder}
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Account Number"
              placeholderTextColor="#7A8D9E"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Branch Name"
              placeholderTextColor="#7A8D9E"
              value={branchName}
              onChangeText={setBranchName}
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="IFSC Code"
              placeholderTextColor="#7A8D9E"
              value={ifscCode}
              onChangeText={setIfscCode}
              autoCapitalize="characters"
              style={styles.bankInput}
            />
          </View>

          {/* Complete Payment Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, { marginTop: 24 }]}
            activeOpacity={0.85}
            onPress={handleCompletePayment}
          >
            <Text style={styles.primaryActionButtonText}>Complete Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryLinkButton}
            onPress={() =>
              Alert.alert("Saved", "Bank details saved for future.")
            }
          >
            <Text style={styles.secondaryLinkText}>Save Details</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        {renderSuccessModal()}
      </View>
    );
  }

  // -------------------------------------------------------------
  // STEP: CHOOSE PAYMENT OPTION
  // -------------------------------------------------------------
  if (currentStep === "payment") {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (bookAppearance === "physical") {
                setCurrentStep("pickup");
              } else {
                setCurrentStep("details");
              }
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Payment Option</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <Image
              source={coverImageSource}
              style={styles.orderBookThumbnail}
              contentFit="cover"
            />
            <View style={styles.orderSummaryTextCol}>
              <Text style={styles.orderBookTitle}>
                {bookData?.title ||
                  "Economic Revolution to make Nepal A World Leader"}
              </Text>
              <Text style={styles.orderBookAuthor}>
                by{" "}
                {bookData?.coAuthor ||
                  bookData?.author ||
                  "Dr. Uma Shankar Prasad (Economist, T.V.)"}
              </Text>
              <Text style={styles.orderDeliveryNote}>
                {bookAppearance === "physical"
                  ? "Your book will be sent to: Nepal Courier, Baneshwor Branch\nEstimated delivery: 3-5 business days"
                  : "You can read your book from the buy book section"}
              </Text>
            </View>
          </View>

          {/* Select Payment Method Header */}
          <View style={styles.paymentSectionHeader}>
            <Text style={styles.paymentSectionTitle}>
              Select Payment Method
            </Text>
            <TouchableOpacity onPress={() => setCurrentStep("details")}>
              <Ionicons name="close" size={20} color="#7A8D9E" />
            </TouchableOpacity>
          </View>

          {/* Payment Method 1: eSewa */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "esewa" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("esewa")}
          >
            <View style={styles.esewaIconBadge}>
              <Text style={styles.esewaIconText}>e</Text>
            </View>
            <Text style={styles.paymentOptionName}>eSewa Mobile Wallet</Text>
            <Ionicons
              name={
                paymentMethod === "esewa"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "esewa" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 2: Khalti */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "khalti" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("khalti")}
          >
            <View style={styles.khaltiIconBadge}>
              <Ionicons name="paper-plane" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentOptionName}>Khalti Mobile Wallet</Text>
            <Ionicons
              name={
                paymentMethod === "khalti"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "khalti" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 3: QR Code */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "qr" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("qr")}
          >
            <View style={styles.qrIconBadge}>
              <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentOptionName}>QR Code</Text>
            <Ionicons
              name={
                paymentMethod === "qr" ? "radio-button-on" : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "qr" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 4: Bank Details for Foreign Countries */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "bank" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("bank")}
          >
            <View style={styles.bankIconBadge}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.bankNameCol}>
              <Text style={styles.paymentOptionName}>
                Bank Detail For Foreign Countries
              </Text>
            </View>
            <Ionicons
              name={
                paymentMethod === "bank"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "bank" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Pay Now Button */}
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              { marginTop: 28 },
              isProcessingPayment && { opacity: 0.7 },
            ]}
            disabled={isProcessingPayment}
            activeOpacity={0.85}
            onPress={
              handleCompletePayment

              //   {
              //   if (paymentMethod === "bank") {
              //     setCurrentStep("bank_form");
              //   } else {
              //     handleCompletePayment();
              //   }
              // }
            }
          >
            {isProcessingPayment ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.primaryActionButtonText}>
                  Connecting to eSewa...
                </Text>
              </View>
            ) : (
              <Text style={styles.primaryActionButtonText}>
                {paymentMethod === "esewa" ? "Pay with eSewa" : "Pay Now"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        {renderSuccessModal()}
      </View>
    );
  }

  // -------------------------------------------------------------
  // SUCCESS MODAL HELPER
  // -------------------------------------------------------------
  function renderSuccessModal() {
    return (
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessBackHome}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={handleSuccessBackHome}
            >
              <Ionicons name="close" size={20} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Checkmark Badge */}
            <View style={[styles.successBadge, { backgroundColor: "#60BB46" }]}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Payment Verified</Text>
            <Text style={styles.successSubtitle}>
              Your eSewa transaction has been verified successfully.
            </Text>

            <View
              style={{
                width: "100%",
                backgroundColor: "#F7FAFC",
                borderRadius: 10,
                padding: 12,
                marginBottom: 18,
              }}
            >
              {verifiedOrderId ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#718096" }}>
                    Order ID
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#1A202C",
                    }}
                  >
                    {verifiedOrderId}
                  </Text>
                </View>
              ) : null}
              {verifiedRefId ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#718096" }}>
                    eSewa Ref ID
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#60BB46",
                    }}
                  >
                    {verifiedRefId}
                  </Text>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: "#718096" }}>
                  Amount Paid
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "800", color: "#1A202C" }}
                >
                  {bookData?.currency || "NPR"}{" "}
                  {bookData?.price ? bookData.price.toLocaleString() : "1,000"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.successButton,
                { backgroundColor: "#10B981", marginBottom: 10 },
              ]}
              activeOpacity={0.85}
              onPress={handleSuccessGoToMyBook}
            >
              <Text style={styles.successButtonText}>Read in My Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: "#EDF2F7" }]}
              activeOpacity={0.85}
              onPress={handleSuccessBackHome}
            >
              <Text style={[styles.successButtonText, { color: "#4A5568" }]}>
                Back Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: BOOK DETAILS SCREEN
  // -------------------------------------------------------------
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kalki E-Book</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionIcon}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionIcon}
            onPress={handleCartPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={21} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. "Why you will buy this Book?" Card */}
        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>
            {bookData?.whyBuy?.title || "Why you will buy this Book?"}
          </Text>
          <Text style={styles.whyBodyText}>
            {bookData?.whyBuy?.leadText ||
              "Buy the Book. Build a Gen Z Wave. If you live out side of valley, By buying this book, you help create a Gen Z wave of 1 lakh students who will receive free coaching in Kathmandu Valley."}{" "}
            {!isWhyExpanded && (
              <Text
                style={styles.readMoreLink}
                onPress={() => setIsWhyExpanded(true)}
              >
                read more
              </Text>
            )}
          </Text>

          {isWhyExpanded && (
            <View style={styles.whyExpandedSection}>
              {(
                bookData?.whyBuy?.points || [
                  "100% of book profit will be donated to the coaching center",
                  "1,000+ teachers will be employed to educate students for free",
                  "The goal is free healthcare, education, and legal services for life",
                  "After 10 lakh books are sold nationwide, within 30 days the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services to all 3 crore Nepalis.",
                ]
              ).map((point: string, idx: number) => (
                <Text key={idx} style={styles.whyExpandedItem}>
                  • {point}
                </Text>
              ))}
              <Text style={styles.whyExpandedHighlight}>
                {bookData?.whyBuy?.highlight ||
                  "One book. One movement. One future."}
              </Text>
              <TouchableOpacity
                onPress={() => setIsWhyExpanded(false)}
                style={styles.readLessButton}
              >
                <Text style={styles.readMoreLink}>read less</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 2. Book Info Card (Cover + Blurb + Rating) */}
        <TouchableOpacity
          style={styles.bookSummaryCard}
          activeOpacity={0.9}
          onPress={() => setShowCoverModal(true)}
        >
          <Image
            source={coverImageSource}
            style={styles.bookCoverImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.bookSummaryDetails}>
            <Text style={styles.bookSummaryTitle}>
              {bookData?.title ||
                "Economic Revolution to make Nepal A World Leader"}
            </Text>
            <Text style={styles.bookSummaryBlurb} numberOfLines={3}>
              {bookData?.aboutText ||
                "Economic Revolution to make Nepal A World Leader outlines systematic economic reforms, free universal healthcare, digital public infrastructure, and youth empowerment."}
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color="#22C55E"
                  style={styles.starIcon}
                />
              ))}
              <Text style={styles.ratingValueText}>
                ({bookData?.rating || 4.3}+)
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Author Card */}
        <View style={styles.authorCard}>
          <Image
            source={require("../../../assets/images/avatar.png")}
            style={styles.authorAvatar}
            contentFit="cover"
          />
          <View style={styles.authorTextCol}>
            <Text style={styles.authorLabel}>Author</Text>
            <Text style={styles.authorName}>
              {bookData?.author || "Jay Sah (MR. 666)"}
            </Text>
          </View>
        </View>

        {/* PDF Digital Edition Download Banner */}
        {bookData?.pdfUrl ? (
          <View style={styles.pdfDownloadBanner}>
            <View style={styles.pdfIconBox}>
              <Ionicons name="document-text" size={22} color="#EF4444" />
            </View>
            <View style={styles.pdfInfoCol}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.pdfBannerTitle}>Digital Edition PDF</Text>
                <View style={styles.pdfPill}>
                  <Text style={styles.pdfPillText}>PDF</Text>
                </View>
              </View>
              <Text style={styles.pdfBannerSubtext} numberOfLines={1}>
                {bookData.pdfFileName || "Economic_Revolution_to_make_Nepal_A_World_Leader.pdf"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              activeOpacity={0.8}
              onPress={handleDownloadPdf}
            >
              <Ionicons name="download-outline" size={15} color="#FFFFFF" />
              <Text style={styles.pdfDownloadBtnText}>Download</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 4. Tabs Row */}
        <View style={styles.tabsRow}>
          {(["About", "Chapters", "Reviews"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
                {isActive && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Tab Content */}
        {activeTab === "About" && (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionHeading}>About this Book</Text>
            <Text style={styles.bodyParagraph}>
              {bookData?.aboutText ||
                "Economic Revolution to make Nepal A World Leader outlines systematic economic reforms, free universal healthcare, digital public infrastructure, and life-changing education."}
            </Text>

            <Text style={[styles.sectionHeading, { marginTop: 22 }]}>
              Book Summary
            </Text>
            <Text style={styles.bodyParagraph}>
              {bookData?.summaryText ||
                "After 10 lakh books are sold nationwide, within 30 days the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services to all 3 crore Nepalis."}
            </Text>
          </View>
        )}

        {activeTab === "Chapters" && (
          <View style={styles.tabContentContainer}>
            <View style={styles.chaptersIntroRow}>
              <Text style={styles.sectionHeading}>
                Book Chapters ({bookData?.chapters?.length || 3})
              </Text>
              <Text style={styles.chaptersSubheading}>
                Preview excerpts from the book
              </Text>
            </View>

            {(bookData?.chapters && bookData.chapters.length > 0
              ? bookData.chapters.slice(0, 3)
              : [
                  {
                    chapterNumber: 1,
                    title: "Chapter 1 | The Hope",
                    pageRange: "Page No: 12 - 50",
                    excerpt:
                      "The fundamental blueprint for youth mobilization and nationwide education reform to foster homegrown innovation and self-reliance across Nepal.",
                  },
                  {
                    chapterNumber: 2,
                    title: "Chapter 2 | The Vision & Policy",
                    pageRange: "Page No: 51 - 98",
                    excerpt:
                      "Comprehensive architecture on monetary policies, healthcare infrastructure, free public legal aid, and generating 100,000+ skilled employment opportunities.",
                  },
                  {
                    chapterNumber: 3,
                    title: "Chapter 3 | Economic Revolution",
                    pageRange: "Page No: 99 - 145",
                    excerpt:
                      "The strategic masterplan towards making Nepal economically sovereign, eliminating foreign debt dependency, and establishing a Gen Z-led economic wave.",
                  },
                ]
            ).map((ch: any, idx: number) => (
              <View key={idx} style={styles.chapterCard}>
                <View style={styles.chapterHeaderRow}>
                  <View style={styles.chapterNumBadge}>
                    <Text style={styles.chapterNumText}>0{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.chapterTitle}>{ch.title}</Text>
                    <Text style={styles.chapterPageInfo}>{ch.pageRange}</Text>
                  </View>
                </View>

                {/* Excerpt lines */}
                {ch.excerpt ? (
                  <View style={styles.chapterExcerptBox}>
                    <View style={styles.excerptLabelRow}>
                      <Ionicons name="book-outline" size={13} color="#38BDF8" />
                      <Text style={styles.excerptLabel}>Chapter Preview Lines</Text>
                    </View>
                    <Text style={styles.chapterExcerpt}>
                      &ldquo;{ch.excerpt}&rdquo;
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}

            {/* Download PDF Option inside Chapters */}
            {bookData?.pdfUrl ? (
              <TouchableOpacity
                style={styles.chapterDownloadPdfBtn}
                activeOpacity={0.85}
                onPress={handleDownloadPdf}
              >
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.chapterDownloadPdfBtnText}>
                  Download Full Book PDF (3 Chapters)
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {activeTab === "Reviews" && (
          <View style={styles.tabContentContainer}>
            {(bookData?.reviews && bookData.reviews.length > 0
              ? bookData.reviews
              : [
                  {
                    reviewerName: "John Wattson",
                    rating: 4.3,
                    heading: "Amazing and Intellectual Book",
                    comment:
                      "A ground-breaking blueprint for education and public healthcare. Highly inspirational read for the youth.",
                  },
                ]
            ).map((rev: any, idx: number, arr: any[]) => (
              <React.Fragment key={idx}>
                <View style={styles.reviewItem}>
                  <Image
                    source={require("../../../assets/images/avatar.png")}
                    style={styles.reviewAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.reviewTextCol}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewHeading}>
                        {rev.heading || "Amazing and Intellectual Book"}
                      </Text>
                      <View style={styles.reviewRatingBadge}>
                        <Ionicons name="star" size={12} color="#22C55E" />
                        <Text style={styles.reviewRatingText}>
                          {rev.rating || 4.3}+
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewAuthor}>
                      by {rev.reviewerName}
                    </Text>
                    <Text style={styles.reviewBody}>{rev.comment}</Text>
                  </View>
                </View>
                {idx < arr.length - 1 && <View style={styles.tabSeparator} />}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar */}
      <View
        style={[
          styles.stickyBottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {userHasPurchased ? (
          <TouchableOpacity
            style={[
              styles.fullContinueButton,
              {
                backgroundColor: "#10B981",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push("/Home/mybook" as any)}
          >
            <Ionicons name="book-outline" size={20} color="#FFFFFF" />
            <Text style={styles.fullContinueButtonText}>
              Verified Owner • Read in My Book
            </Text>
          </TouchableOpacity>
        ) : activeTab === "About" ? (
          <View style={styles.aboutActionBarRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>
                {bookData?.currency || "NPR"}{" "}
                {bookData?.price ? bookData.price.toLocaleString() : "1,000"}
                /-
              </Text>
            </View>
            <TouchableOpacity
              style={styles.buyNowButton}
              activeOpacity={0.85}
              onPress={handleBuyNowPress}
            >
              <Text style={styles.buyNowButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.fullContinueButton}
            activeOpacity={0.85}
            onPress={handleBuyNowPress}
          >
            <Text style={styles.fullContinueButtonText}>
              Continue to Pay {bookData?.currency || "NPR"}{" "}
              {bookData?.price ? bookData.price.toLocaleString() : "1,000"}
              /-
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CHOOSE BOOK APPEARANCE                                  */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showAppearanceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppearanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.appearanceCard}>
            {/* Top Close icon */}
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={() => setShowAppearanceModal(false)}
            >
              <Ionicons name="close" size={22} color="#4A5D72" />
            </TouchableOpacity>

            {/* Book Mini Header */}
            <View style={styles.appearanceBookRow}>
              <Image
                source={coverImageSource}
                style={styles.appearanceThumbnail}
                contentFit="cover"
              />
              <View style={styles.appearanceTextCol}>
                <Text style={styles.appearanceBookTitle}>
                  {bookData?.title ||
                    "Economic Revolution to make Nepal A World Leader"}
                </Text>
                <Text style={styles.appearanceBookAuthor}>
                  by{" "}
                  {bookData?.coAuthor ||
                    bookData?.author ||
                    "Dr. Uma Shankar Prasad (Economist, T.V.)"}
                </Text>
              </View>
            </View>

            <Text style={styles.appearanceHeading}>
              Choose book appearance ?
            </Text>

            {/* Option 1: Physical Book */}
            <TouchableOpacity
              style={styles.appearanceOptionRow}
              activeOpacity={0.8}
              onPress={() => setBookAppearance("physical")}
            >
              <Ionicons
                name={
                  bookAppearance === "physical"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color={bookAppearance === "physical" ? "#3087E5" : "#8A9BA8"}
              />
              <Text style={styles.appearanceOptionText}>
                Want Physical Book
              </Text>
            </TouchableOpacity>

            {/* Option 2: Digital E-Book */}
            <TouchableOpacity
              style={styles.appearanceOptionRow}
              activeOpacity={0.8}
              onPress={() => setBookAppearance("digital")}
            >
              <Ionicons
                name={
                  bookAppearance === "digital"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color={bookAppearance === "digital" ? "#3087E5" : "#8A9BA8"}
              />
              <Text style={styles.appearanceOptionText}>
                Want Digital E-Book
              </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.appearanceContinueButton}
              activeOpacity={0.85}
              onPress={handleAppearanceContinue}
            >
              <Text style={styles.appearanceContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LARGE BOOK COVER PREVIEW                                */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showCoverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.coverPreviewCard}>
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={() => setShowCoverModal(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={coverImageSource}
              style={styles.largeCoverImage}
              contentFit="contain"
            />

            <Text style={styles.largeCoverTitle}>
              {bookData?.title ||
                "Economic Revolution to make Nepal A World Leader"}
            </Text>

            <View style={styles.coverAuthorRow}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.coverAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.coverAuthorLabel}>Author</Text>
                <Text style={styles.coverAuthorName}>Jay Sah (MR. 666)</Text>
              </View>
            </View>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 40,
    padding: 4,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
    flex: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minWidth: 50,
    justifyContent: "flex-end",
  },
  headerActionIcon: {
    padding: 2,
  },
  headerRightSpacer: {
    minWidth: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // 1. "Why you will buy this Book?"
  whyCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0F2E59",
  },
  whyTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  whyBodyText: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18.5,
  },
  readMoreLink: {
    color: "#3087E5",
    fontWeight: "600",
  },
  whyExpandedSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#0F2E59",
  },
  whyExpandedItem: {
    color: "#CADDF7",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  whyExpandedHighlight: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 6,
  },
  readLessButton: {
    alignSelf: "flex-end",
    marginTop: 6,
  },

  // 2. Book Info Card
  bookSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#061830",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0D2545",
  },
  bookCoverImage: {
    width: 82,
    height: 122,
    borderRadius: 6,
    backgroundColor: "#0A2242",
  },
  bookSummaryDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  bookSummaryTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 6,
  },
  bookSummaryBlurb: {
    color: "#8E9FA5",
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingValueText: {
    color: "#CADDF7",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  // 3. Author Card
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A36",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorTextCol: {
    marginLeft: 12,
  },
  authorLabel: {
    color: "#7B8D9F",
    fontSize: 11,
  },
  authorName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  // 4. Tabs Row
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0D2545",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    position: "relative",
  },
  tabButtonText: {
    color: "#7B8D9F",
    fontSize: 14.5,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    width: "70%",
    height: 3,
    backgroundColor: "#3087E5",
    borderRadius: 2,
  },

  // 5. Tab Content
  tabContentContainer: {
    paddingHorizontal: 2,
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  bodyParagraph: {
    color: "#CADDF7",
    fontSize: 12.8,
    lineHeight: 19,
    marginBottom: 10,
  },
  tabSeparator: {
    height: 1,
    backgroundColor: "#0F2644",
    marginVertical: 14,
  },

  // PDF Download Banner
  pdfDownloadBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 30, 56, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  pdfIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  pdfBannerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  pdfPill: {
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pdfPillText: {
    color: "#FCA5A5",
    fontSize: 9.5,
    fontWeight: "800",
  },
  pdfBannerSubtext: {
    color: "#7A8D9E",
    fontSize: 11,
    marginTop: 2,
  },
  pdfDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  pdfDownloadBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },

  // Chapters tab enhanced
  chaptersIntroRow: {
    marginBottom: 12,
  },
  chaptersSubheading: {
    color: "#7A8D9E",
    fontSize: 11.5,
    marginTop: 2,
  },
  chapterCard: {
    backgroundColor: "rgba(11, 30, 56, 0.65)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    marginBottom: 12,
  },
  chapterNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  chapterExcerptBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(2, 22, 49, 0.8)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
  },
  excerptLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  excerptLabel: {
    color: "#38BDF8",
    fontSize: 10.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chapterDownloadPdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0266B3",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  chapterDownloadPdfBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Chapters tab
  chapterItem: {
    marginBottom: 4,
  },
  chapterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chapterTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  chapterPageInfo: {
    color: "#7A8D9E",
    fontSize: 11.5,
  },
  chapterExcerpt: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // Reviews tab
  reviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  reviewTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewHeading: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    color: "#CADDF7",
    fontSize: 11.5,
    fontWeight: "600",
  },
  reviewAuthor: {
    color: "#7A8D9E",
    fontSize: 11.5,
    marginVertical: 3,
  },
  reviewBody: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // Sticky Bottom Bar
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#031124",
    borderTopWidth: 1,
    borderTopColor: "#0D2545",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  aboutActionBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    color: "#7B8D9F",
    fontSize: 11.5,
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  buyNowButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  buyNowButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  fullContinueButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  fullContinueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Primary Action Button (used in steps)
  primaryActionButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryLinkButton: {
    alignItems: "center",
    marginTop: 14,
    padding: 6,
  },
  secondaryLinkText: {
    color: "#CADDF7",
    fontSize: 13,
  },

  // -------------------------------------------------------------
  // MODAL STYLES
  // -------------------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCloseTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },

  // Appearance Modal
  appearanceCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    position: "relative",
  },
  appearanceBookRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 24,
    marginBottom: 16,
  },
  appearanceThumbnail: {
    width: 48,
    height: 68,
    borderRadius: 4,
    backgroundColor: "#EEE",
  },
  appearanceTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  appearanceBookTitle: {
    color: "#1A202C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  appearanceBookAuthor: {
    color: "#718096",
    fontSize: 11,
    marginTop: 4,
  },
  appearanceHeading: {
    color: "#1A202C",
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 14,
  },
  appearanceOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  appearanceOptionText: {
    color: "#2D3748",
    fontSize: 14,
    fontWeight: "500",
  },
  appearanceContinueButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
  },
  appearanceContinueText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },

  // Large Cover Modal
  coverPreviewCard: {
    width: "90%",
    backgroundColor: "#061A34",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  largeCoverImage: {
    width: 170,
    height: 250,
    borderRadius: 8,
    marginVertical: 12,
  },
  largeCoverTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  coverAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  coverAuthorLabel: {
    color: "#7A8D9E",
    fontSize: 11,
  },
  coverAuthorName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },

  // Pickup step styles
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  clinicSubheader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  clinicSubheaderText: {
    color: "#3087E5",
    fontSize: 13,
    fontWeight: "600",
  },
  clinicListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  clinicListTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  clinicListSubtitle: {
    color: "#00E5FF",
    fontSize: 10,
    fontWeight: "600",
  },
  clinicOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  clinicOptionSelected: {
    borderColor: "#00E5FF",
    backgroundColor: "#082548",
  },
  clinicIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(122, 141, 158, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  clinicIconBoxSelected: {
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clinicName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  clinicNameSelected: {
    color: "#00E5FF",
    fontWeight: "700",
  },
  clinicDetails: {
    color: "#9BB3CB",
    fontSize: 11.5,
    marginTop: 2,
  },
  clinicAddressSmall: {
    color: "#5E7793",
    fontSize: 10,
    marginTop: 2,
  },
  selectedBadge: {
    padding: 2,
  },

  // Payment Option step styles
  orderSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#061A34",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 20,
  },
  orderBookThumbnail: {
    width: 62,
    height: 90,
    borderRadius: 6,
  },
  orderSummaryTextCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  orderBookTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  orderBookAuthor: {
    color: "#7A8D9E",
    fontSize: 11,
    marginTop: 3,
  },
  orderDeliveryNote: {
    color: "#3087E5",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  paymentSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentSectionTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061830",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0F2644",
  },
  paymentOptionCardSelected: {
    borderColor: "#3087E5",
    backgroundColor: "#0A2446",
  },
  esewaIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#60BB46",
    alignItems: "center",
    justifyContent: "center",
  },
  esewaIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  khaltiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5C2D91",
    alignItems: "center",
    justifyContent: "center",
  },
  qrIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  bankIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  paymentOptionName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  bankNameCol: {
    flex: 1,
    marginLeft: 12,
  },

  // Bank Form step styles
  bankDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 14,
  },
  bankDropdownText: {
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  bankInputGroup: {
    marginBottom: 12,
  },
  bankInput: {
    backgroundColor: "#071B34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: "#102A4C",
  },

  // Success Modal
  successCard: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E78E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    color: "#1A202C",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  successSubtitle: {
    color: "#718096",
    fontSize: 12.5,
    textAlign: "center",
    marginBottom: 18,
  },
  successAmountBox: {
    alignItems: "center",
    marginBottom: 22,
  },
  successAmountLabel: {
    color: "#718096",
    fontSize: 12,
  },
  successAmountValue: {
    color: "#1A202C",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  successButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
