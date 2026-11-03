import React from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Reusable Components
import HomeHeader from "../../components/Home/HomeHeader";
import HeroBanner from "../../components/Home/HeroBanner";
import CategoryGrid from "../../components/Home/CategoryGrid";
import PromoCards from "../../components/Home/PromoCards";
import ServiceList from "../../components/Home/ServiceList";
import SocialLinks from "../../components/Home/SocialLinks";
import {
  QuickActionItem,
  CommunityProgramItem,
  ServiceItem,
} from "../../components/Home/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Handlers for interactions
  const handleProfilePress = () => {
    router.push("/Home/profile" as any);
  };

  const handleScannerPress = () => {
    router.push("/Home/donate" as any);
  };

  const handleNotificationPress = () => {
    router.push("/Home/notifications" as any);
  };

  const handleLogoutPress = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/Auth/login"),
      },
    ]);
  };

  const handleQuickAction = (item: QuickActionItem) => {
    switch (item.id) {
      case "bike":
        router.push("/Home/bikeservice");
        break;
      case "car":
        router.push("/Home/carservice");
        break;
      case "food":
        router.push("/Home/foodservice");
        break;
      case "parcel":
        router.push("/Home/parcelservice");
        break;
      default:
        router.push("/Home/bikeservice");
        break;
    }
  };

  const handleCommunityProgram = (program: CommunityProgramItem) => {
    const titleClean = program.title.replace(/\n/g, " ");
    if (program.id === "doctors" || titleClean.toLowerCase().includes("doctor")) {
      router.push("/Home/donate" as any);
    } else if (
      program.id === "driver" ||
      titleClean.toLowerCase().includes("driver")
    ) {
      router.push("/Home/becomedriver" as any);
    } else if (
      program.id === "clinic" ||
      titleClean.toLowerCase().includes("clinic") ||
      titleClean.toLowerCase().includes("kalki")
    ) {
      router.push("/Home/joinkalki" as any);
    } else if (
      program.id === "coaching" ||
      titleClean.toLowerCase().includes("coach")
    ) {
      router.push("/Home/coaching" as any);
    } else {
      router.push({
        pathname: "/Home/checkout" as any,
        params: { title: `Donate to ${titleClean.toLowerCase()}:` },
      });
    }
  };

  const handlePlayVideo = () => {
    Alert.alert("Video Message", "Playing message from MR.666...");
  };

  const handleBuyBook = () => {
    router.push("/Home/bookdetails" as any);
  };

  const handleServicePress = (service: ServiceItem) => {
    switch (service.id) {
      case "1": // Find Hostel, Room, Apartment, Rent & Safe
        router.push("/Home/hostel" as any);
        break;
      case "2": // सत्ययुग समाज पार्टी को भोट किन्नु होस् ।
        router.push("/Home/samajparty" as any);
        break;
      case "3": // Free treatment for life
        router.push("/Home/freetreatment" as any);
        break;
      case "5": // Find a Job
        router.push("/Home/findjob" as any);
        break;
      case "6": // Do Online Shopping
        router.push("/Home/onlineshopping" as any);
        break;
      case "7": // $Sewa & E-Sapati
        router.push("/Home/sewa" as any);
        break;
      case "8": // Rent Car, Bus, Truck, Helicopter, Driver
        router.push("/Home/rentvehicle" as any);
        break;
      case "9": // Buy Health, Car and Bike insurance
        router.push("/Home/insurance" as any);
        break;
      case "10": // Send Money
      case "sendmoney":
        router.push("/Home/sendmoney" as any);
        break;
      default: {
        const titleLower = service.title.toLowerCase();
        if (titleLower.includes("hostel") || titleLower.includes("room") || titleLower.includes("apartment")) {
          router.push("/Home/hostel" as any);
        } else if (titleLower.includes("पार्टी") || titleLower.includes("samaj")) {
          router.push("/Home/samajparty" as any);
        } else if (titleLower.includes("treatment")) {
          router.push("/Home/freetreatment" as any);
        } else if (titleLower.includes("job")) {
          router.push("/Home/findjob" as any);
        } else if (titleLower.includes("shopping")) {
          router.push("/Home/onlineshopping" as any);
        } else if (titleLower.includes("sewa")) {
          router.push("/Home/sewa" as any);
        } else if (titleLower.includes("rent")) {
          router.push("/Home/rentvehicle" as any);
        } else if (titleLower.includes("insurance")) {
          router.push("/Home/insurance" as any);
        } else if (titleLower.includes("send money") || titleLower.includes("money")) {
          router.push("/Home/sendmoney" as any);
        } else {
          Alert.alert(
            "Coming Soon",
            `${service.title} will be active after 4-6 months.`
          );
        }
        break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 6,
            paddingBottom: Math.max(insets.bottom, 20) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header (User profile, Greeting, Notifications & Logout) */}
        <HomeHeader
          userName="Subhodip"
          greeting="Namaste"
          onProfilePress={handleProfilePress}
          onScannerPress={handleScannerPress}
          onNotificationPress={handleNotificationPress}
          onLogoutPress={handleLogoutPress}
        />

        {/* 2. Hero / Mission Banner */}
        <HeroBanner
          bulletPoints={[
            "To save country from Pandamic bigger than Covid",
            "To make 1 NRS = 25 INR",
          ]}
        />

        {/* 3. Category & Program Grid */}
        <CategoryGrid
          onActionPress={handleQuickAction}
          onProgramPress={handleCommunityProgram}
        />

        {/* 4. Promotional Cards (Video message & Buy book) */}
        <PromoCards
          videoTitle="Message form MR.666"
          bookTitle="Buy book to support Gen Z free education"
          onPlayPress={handlePlayVideo}
          onBuyBookPress={handleBuyBook}
        />

        {/* 5. Our Services List */}
        <ServiceList onServicePress={handleServicePress} />

        {/* 6. Social Media & SOS Channels */}
        <SocialLinks
          onSosPress={() => router.push("/Home/emergencySOS" as any)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
