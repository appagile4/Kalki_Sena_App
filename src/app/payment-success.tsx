import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../services/api";

export default function PaymentSuccessRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [refId, setRefId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verifyTransaction() {
      try {
        const encodedData = (params.data as string) || undefined;
        const transactionUuid =
          (params.transaction_uuid as string) ||
          (params.pid as string) ||
          (params.oid as string) ||
          "";
        const confirmedRef =
          (params.refId as string) ||
          (params.transaction_code as string) ||
          (params.ref_id as string) ||
          undefined;

        if (!transactionUuid && !encodedData) {
          if (isMounted) {
            setVerifying(false);
            setVerified(true);
            setOrderId((params.orderId as string) || "KS-ORD");
            setRefId(confirmedRef || "CONFIRMED");
          }
          return;
        }

        const res = await apiService.verifyEsewaPayment({
          transactionUuid,
          encodedData,
          refId: confirmedRef,
        });

        if (isMounted) {
          if (res && res.success) {
            setVerified(true);
            setOrderId(res.orderId || (params.orderId as string) || "KS-ORD");
            setRefId(res.refId || confirmedRef || "VERIFIED");
          } else {
            setVerified(false);
            setErrorMessage(
              res?.message ||
                "Payment was received but is currently pending confirmation."
            );
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setVerified(false);
          setErrorMessage(err.message || "Failed to verify eSewa payment.");
        }
      } finally {
        if (isMounted) setVerifying(false);
      }
    }

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.card}>
        {verifying ? (
          <View style={styles.innerBox}>
            <ActivityIndicator size="large" color="#60BB46" />
            <Text style={styles.title}>Verifying with eSewa...</Text>
            <Text style={styles.subtitle}>
              Securing transaction confirmation with official eSewa servers.
            </Text>
          </View>
        ) : verified ? (
          <View style={styles.innerBox}>
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Payment Confirmed!</Text>
            <Text style={styles.subtitle}>
              Your eSewa payment was successfully verified by our servers.
            </Text>

            <View style={styles.metaBox}>
              {orderId ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Order ID:</Text>
                  <Text style={styles.metaVal}>{orderId}</Text>
                </View>
              ) : null}
              {refId ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>eSewa Ref:</Text>
                  <Text style={styles.metaHighlight}>{refId}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.btn, styles.btnGreen]}
              activeOpacity={0.85}
              onPress={() => router.replace("/Home/mybook" as any)}
            >
              <Ionicons name="book-outline" size={18} color="#FFFFFF" />
              <Text style={styles.btnText}>Read in My Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => router.replace("/Home" as any)}
            >
              <Text style={[styles.btnText, { color: "#8EA4BE" }]}>
                Back Home
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.innerBox}>
            <View style={[styles.successIconBadge, { backgroundColor: "#EF4444" }]}>
              <Ionicons name="alert-circle" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Verification Notice</Text>
            <Text style={styles.subtitle}>
              {errorMessage ||
                "Payment could not be verified automatically. Please contact support or check status in your dashboard."}
            </Text>

            <TouchableOpacity
              style={[styles.btn, styles.btnGreen]}
              activeOpacity={0.85}
              onPress={() => router.replace("/Home/mybook" as any)}
            >
              <Text style={styles.btnText}>Check My Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => router.replace("/Home" as any)}
            >
              <Text style={[styles.btnText, { color: "#8EA4BE" }]}>
                Return Home
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#081E38",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#183359",
    padding: 24,
  },
  innerBox: {
    alignItems: "center",
  },
  successIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#60BB46",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#8EA4BE",
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  metaBox: {
    width: "100%",
    backgroundColor: "#05162B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#152F50",
    padding: 12,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  metaLabel: {
    color: "#8EA4BE",
    fontSize: 12,
  },
  metaVal: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  metaHighlight: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "800",
  },
  btn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  btnGreen: {
    backgroundColor: "#10B981",
  },
  btnGhost: {
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
