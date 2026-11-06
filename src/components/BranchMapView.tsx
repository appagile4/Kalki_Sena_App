import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

// Safe dynamic check for react-native-maps so top-level evaluation NEVER crashes
// when running in Expo Go or clients without RNMapsAirModule compiled in native binary.
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let PolylineComponent: any = null;
let CalloutComponent: any = null;
let PROVIDER_GOOGLE: any = null;
let isNativeMapsAvailable = false;

try {
  const Maps = require("react-native-maps");
  if (Maps && (Maps.default || Maps.MapView)) {
    MapViewComponent = Maps.default || Maps.MapView;
    MarkerComponent = Maps.Marker;
    PolylineComponent = Maps.Polyline;
    CalloutComponent = Maps.Callout;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    isNativeMapsAvailable = true;
  }
} catch {
  // react-native-maps native binary (RNMapsAirModule) not registered in current client
  isNativeMapsAvailable = false;
}

export interface BranchClinic {
  id: string;
  name: string;
  branch?: string;
  distance?: string;
  timing?: string;
  address?: string;
  phone?: string;
  city?: string;
  latitude: number;
  longitude: number;
}

interface BranchMapViewProps {
  clinics: BranchClinic[];
  selectedClinicId: string;
  onSelectClinic: (clinicId: string) => void;
  userLocation: { latitude: number; longitude: number } | null;
  onOpenDirections?: (clinic: BranchClinic) => void;
}

// Dark Sci-Fi / Modern Google Map Style matching Kalki Sena branding (#04142a)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#061830" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8fa8c6" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#04142a" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00E5FF" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f7294" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0a2647" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#102f54" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#071b33" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1a4675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0a223f" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b3d4f5" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0d2b4d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020B18" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3087e5" }],
  },
];

export const BranchMapView: React.FC<BranchMapViewProps> = ({
  clinics,
  selectedClinicId,
  onSelectClinic,
  userLocation,
  onOpenDirections,
}) => {
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [staticMapFailed, setStaticMapFailed] = useState(false);

  // Selected clinic object
  const activeClinic =
    clinics.find((c) => c.id === selectedClinicId) || clinics[0];

  // Default User Location (Kathmandu Valley Center)
  const effectiveUserLoc = useMemo(
    () =>
      userLocation || {
        latitude: 27.6915,
        longitude: 85.342,
      },
    [userLocation]
  );

  // Calculate Distance (Haversine formula) in kilometers
  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const directDistance = activeClinic
    ? calculateDistanceKm(
        effectiveUserLoc.latitude,
        effectiveUserLoc.longitude,
        activeClinic.latitude,
        activeClinic.longitude
      )
    : 1.2;

  // Estimated driving time (approx 22 km/h city traffic in Kathmandu)
  const estimatedMins = Math.max(3, Math.round((directDistance / 22) * 60));

  // Initial Region centered around Kathmandu
  const initialRegion = {
    latitude: activeClinic ? activeClinic.latitude : effectiveUserLoc.latitude,
    longitude: activeClinic
      ? activeClinic.longitude
      : effectiveUserLoc.longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  // Route Coordinates between user location and active clinic
  const routeCoordinates = useMemo(() => {
    if (!activeClinic) return [];
    return [
      {
        latitude: effectiveUserLoc.latitude,
        longitude: effectiveUserLoc.longitude,
      },
      {
        latitude: activeClinic.latitude,
        longitude: activeClinic.longitude,
      },
    ];
  }, [effectiveUserLoc, activeClinic]);

  // Fit map to show both user and active clinic whenever selection changes
  useEffect(() => {
    if (!isNativeMapsAvailable || !mapReady || !mapRef.current || !activeClinic)
      return;

    const coords = [
      {
        latitude: effectiveUserLoc.latitude,
        longitude: effectiveUserLoc.longitude,
      },
      {
        latitude: activeClinic.latitude,
        longitude: activeClinic.longitude,
      },
    ];

    try {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 70, right: 60, bottom: 70, left: 60 },
        animated: true,
      });
    } catch {
      mapRef.current.animateToRegion(
        {
          latitude: (effectiveUserLoc.latitude + activeClinic.latitude) / 2,
          longitude: (effectiveUserLoc.longitude + activeClinic.longitude) / 2,
          latitudeDelta: Math.max(
            0.03,
            Math.abs(effectiveUserLoc.latitude - activeClinic.latitude) * 1.8
          ),
          longitudeDelta: Math.max(
            0.03,
            Math.abs(effectiveUserLoc.longitude - activeClinic.longitude) * 1.8
          ),
        },
        700
      );
    }
  }, [selectedClinicId, effectiveUserLoc, mapReady, activeClinic]);

  // Recenter map button action
  const handleRecenter = () => {
    if (isNativeMapsAvailable && mapRef.current && activeClinic) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: effectiveUserLoc.latitude,
            longitude: effectiveUserLoc.longitude,
          },
          {
            latitude: activeClinic.latitude,
            longitude: activeClinic.longitude,
          },
        ],
        {
          edgePadding: { top: 70, right: 60, bottom: 70, left: 60 },
          animated: true,
        }
      );
    }
  };

  // Open external turn-by-turn navigation (Google Maps / Apple Maps)
  const handleGetDirections = () => {
    if (onOpenDirections && activeClinic) {
      onOpenDirections(activeClinic);
      return;
    }

    if (!activeClinic) return;
    const uLat = effectiveUserLoc.latitude;
    const uLng = effectiveUserLoc.longitude;
    const dLat = activeClinic.latitude;
    const dLng = activeClinic.longitude;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${dLat},${dLng}&travelmode=driving`;
    Linking.openURL(googleMapsUrl).catch(() => {});
  };

  // Dial clinic phone
  const handleCallClinic = () => {
    const phone = activeClinic?.phone || "+977-1-4782000";
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  // Google Maps Static API URL generator
  const googleApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBxnSInFpg3Ds3frC6HUBA9xOyBJ0ftx3U";

  const staticMapUrl = useMemo(() => {
    if (!activeClinic) return "";
    const cLat = (effectiveUserLoc.latitude + activeClinic.latitude) / 2;
    const cLng = (effectiveUserLoc.longitude + activeClinic.longitude) / 2;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${cLat},${cLng}&zoom=14&size=640x320&scale=2&maptype=roadmap&markers=color:0x00E5FF%7Clabel:U%7C${effectiveUserLoc.latitude},${effectiveUserLoc.longitude}&markers=color:0xFF3B30%7Clabel:B%7C${activeClinic.latitude},${activeClinic.longitude}&path=color:0x00E5FFff%7Cweight:4%7C${effectiveUserLoc.latitude},${effectiveUserLoc.longitude}%7C${activeClinic.latitude},${activeClinic.longitude}&key=${googleApiKey}`;
  }, [effectiveUserLoc, activeClinic, googleApiKey]);

  // Fallback for Web browser preview
  if (Platform.OS === "web") {
    return (
      <View style={styles.cardContainer}>
        {/* Header Bar */}
        <View style={styles.mapHeaderBar}>
          <View style={styles.branchStatusBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.branchStatusText}>
              {activeClinic ? activeClinic.name : "Kalki Branch"}
            </Text>
          </View>
          <View style={styles.recenterButton}>
            <Ionicons name="navigate" size={11} color="#00E5FF" />
            <Text style={styles.recenterButtonText}>Interactive Route</Text>
          </View>
        </View>

        {/* Web View Fallback */}
        <View style={styles.mapViewport}>
          <iframe
            src={`https://maps.google.com/maps?q=${
              activeClinic?.latitude || 27.6915
            },${activeClinic?.longitude || 85.342}&z=14&output=embed`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Kalki Sena Branch Map"
          />
        </View>

        {/* Directions Footer */}
        {activeClinic && (
          <View style={styles.directionFooter}>
            <View style={styles.directionInfoRow}>
              <View style={styles.routeIconWrapper}>
                <Ionicons name="navigate" size={16} color="#00E5FF" />
              </View>
              <View style={styles.routeDetails}>
                <View style={styles.destinationTitleRow}>
                  <Text style={styles.destinationClinicName} numberOfLines={1}>
                    {activeClinic.name}
                  </Text>
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>SELECTED</Text>
                  </View>
                </View>
                <Text style={styles.destinationDistanceText}>
                  {directDistance} km • ~{estimatedMins} mins drive away
                </Text>
                <Text style={styles.destinationAddressText} numberOfLines={1}>
                  {activeClinic.address || "Kathmandu Valley, Nepal"}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.directionsPrimaryButton}
                activeOpacity={0.8}
                onPress={handleGetDirections}
              >
                <Ionicons name="arrow-redo" size={15} color="#FFFFFF" />
                <Text style={styles.directionsPrimaryButtonText}>
                  Start Navigation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callClinicButton}
                activeOpacity={0.8}
                onPress={handleCallClinic}
              >
                <Ionicons name="call" size={15} color="#00E5FF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Bar */}
      <View style={styles.mapHeaderBar}>
        <View style={styles.branchStatusBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.branchStatusText} numberOfLines={1}>
            {activeClinic
              ? `${activeClinic.branch || activeClinic.name}`
              : "Branch Route"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.recenterButton}
          activeOpacity={0.7}
          onPress={handleRecenter}
        >
          <Ionicons name="scan" size={12} color="#00E5FF" />
          <Text style={styles.recenterButtonText}>Fit Route</Text>
        </TouchableOpacity>
      </View>

      {/* Map Viewport: Uses Native MapView if available; otherwise uses high-res Google Maps Static Route View */}
      <View style={styles.mapViewport}>
        {isNativeMapsAvailable && MapViewComponent ? (
          <MapViewComponent
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            initialRegion={initialRegion}
            customMapStyle={DARK_MAP_STYLE}
            showsUserLocation={false}
            showsCompass={true}
            showsMyLocationButton={false}
            showsScale={false}
            onMapReady={() => setMapReady(true)}
          >
            {/* Direct Route Polyline */}
            {PolylineComponent && routeCoordinates.length === 2 && (
              <PolylineComponent
                coordinates={routeCoordinates}
                strokeColor="#00E5FF"
                strokeWidth={3.5}
                lineDashPattern={[8, 5]}
              />
            )}

            {/* User Current Location Marker */}
            {MarkerComponent && (
              <MarkerComponent
                coordinate={{
                  latitude: effectiveUserLoc.latitude,
                  longitude: effectiveUserLoc.longitude,
                }}
                title="Your Location"
                description="Starting point for pickup"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.userMarkerBeacon}>
                  <View style={styles.userMarkerPulseRing} />
                  <View style={styles.userMarkerCenterDot}>
                    <Ionicons name="person" size={11} color="#FFFFFF" />
                  </View>
                </View>
              </MarkerComponent>
            )}

            {/* Branch Clinic Markers */}
            {MarkerComponent &&
              clinics.map((clinic) => {
                const isSelected = clinic.id === selectedClinicId;
                return (
                  <MarkerComponent
                    key={clinic.id}
                    coordinate={{
                      latitude: clinic.latitude,
                      longitude: clinic.longitude,
                    }}
                    title={clinic.name}
                    description={clinic.address || clinic.timing}
                    onPress={() => onSelectClinic(clinic.id)}
                    anchor={{ x: 0.5, y: 1 }}
                  >
                    <View style={styles.markerContainer}>
                      {isSelected && (
                        <View style={styles.activeMarkerCallout}>
                          <Text
                            style={styles.activeMarkerCalloutText}
                            numberOfLines={1}
                          >
                            {clinic.branch || clinic.name}
                          </Text>
                          <Ionicons
                            name="checkmark-circle"
                            size={10}
                            color="#00E5FF"
                            style={{ marginLeft: 3 }}
                          />
                        </View>
                      )}

                      <View
                        style={[
                          styles.clinicPinBase,
                          isSelected && styles.clinicPinActive,
                        ]}
                      >
                        <Ionicons
                          name="business"
                          size={isSelected ? 16 : 13}
                          color={isSelected ? "#00E5FF" : "#CADDF7"}
                        />
                      </View>
                      <View
                        style={[
                          styles.clinicPinTriangle,
                          isSelected && styles.clinicPinTriangleActive,
                        ]}
                      />
                    </View>

                    {CalloutComponent && (
                      <CalloutComponent tooltip>
                        <View style={styles.nativeCalloutCard}>
                          <Text style={styles.nativeCalloutTitle}>
                            {clinic.name}
                          </Text>
                          <Text style={styles.nativeCalloutSub}>
                            {clinic.address || "Kalki Sena Branch"}
                          </Text>
                        </View>
                      </CalloutComponent>
                    )}
                  </MarkerComponent>
                );
              })}
          </MapViewComponent>
        ) : (
          /* High-Resolution Google Maps Static Route View (Zero unlinked native binary crashes) */
          <View style={StyleSheet.absoluteFill}>
            <Image
              source={{ uri: staticMapUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              onError={() => setStaticMapFailed(true)}
            />

            {/* Dark Sci-Fi Overlay Tint */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(3, 14, 29, 0.25)" },
              ]}
              pointerEvents="none"
            />

            {/* Floating Live Trajectory Badge */}
            <View style={styles.staticRoutePill}>
              <View style={styles.staticRoutePillDot} />
              <Text style={styles.staticRoutePillText}>
                Route to {activeClinic?.branch || activeClinic?.name || "Branch"}
              </Text>
              <Text style={styles.staticRoutePillKm}>
                • {directDistance} km
              </Text>
            </View>

            {/* Touch overlay: tapping map opens Google Maps directly */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={0.9}
              onPress={handleGetDirections}
            />

            {/* Tap to Navigate Hint */}
            <View style={styles.tapToNavigatePill} pointerEvents="none">
              <Ionicons name="map" size={11} color="#00E5FF" />
              <Text style={styles.tapToNavigatePillText}>
                Tap map to open in Google Maps
              </Text>
            </View>

            {staticMapFailed && (
              <View style={styles.mapErrorFallback}>
                <Ionicons name="map-outline" size={32} color="#00E5FF" />
                <Text style={styles.mapErrorTitle}>
                  Kathmandu Branch Network
                </Text>
                <Text style={styles.mapErrorSub}>
                  {activeClinic?.name} • {directDistance} km away
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Selected Branch Route Details & Action Bottom Bar */}
      {activeClinic && (
        <View style={styles.directionFooter}>
          <View style={styles.directionInfoRow}>
            <View style={styles.routeIconWrapper}>
              <Ionicons name="navigate" size={16} color="#00E5FF" />
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.destinationTitleRow}>
                <Text style={styles.destinationClinicName} numberOfLines={1}>
                  {activeClinic.name}
                </Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>SELECTED</Text>
                </View>
              </View>

              <Text style={styles.destinationDistanceText}>
                {directDistance} km • ~{estimatedMins} mins direct drive
              </Text>
              <Text style={styles.destinationAddressText} numberOfLines={1}>
                {activeClinic.address || "Kathmandu Valley, Nepal"} •{" "}
                {activeClinic.timing || "Open: 9 AM - 6 PM"}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Navigate in Google Maps / Call Branch */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.directionsPrimaryButton}
              activeOpacity={0.8}
              onPress={handleGetDirections}
            >
              <Ionicons name="arrow-redo" size={15} color="#FFFFFF" />
              <Text style={styles.directionsPrimaryButtonText}>
                Start Turn-by-Turn Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callClinicButton}
              activeOpacity={0.8}
              onPress={handleCallClinic}
            >
              <Ionicons name="call" size={15} color="#00E5FF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#102A4C",
    backgroundColor: "#051A36",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  mapHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#071F3F",
    borderBottomWidth: 1,
    borderBottomColor: "#102A4C",
  },
  branchStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00E5FF",
  },
  branchStatusText: {
    color: "#9BB3CB",
    fontSize: 11,
    fontWeight: "600",
  },
  recenterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
  },
  recenterButtonText: {
    color: "#00E5FF",
    fontSize: 10,
    fontWeight: "700",
  },
  mapViewport: {
    width: "100%",
    height: 230,
    backgroundColor: "#04142a",
    position: "relative",
  },

  // Static Map Route Pills
  staticRoutePill: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(3, 20, 43, 0.88)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  staticRoutePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00E5FF",
    marginRight: 6,
  },
  staticRoutePillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  staticRoutePillKm: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  tapToNavigatePill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(3, 20, 43, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    zIndex: 10,
  },
  tapToNavigatePillText: {
    color: "#CADDF7",
    fontSize: 10,
    fontWeight: "600",
  },
  mapErrorFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#051A36",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 16,
  },
  mapErrorTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  mapErrorSub: {
    color: "#7A8D9E",
    fontSize: 11,
  },

  // User Marker
  userMarkerBeacon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerPulseRing: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 229, 255, 0.25)",
    borderWidth: 1.5,
    borderColor: "#00E5FF",
  },
  userMarkerCenterDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3087E5",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },

  // Clinic Marker Pin
  markerContainer: {
    alignItems: "center",
  },
  activeMarkerCallout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#03142B",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00E5FF",
    marginBottom: 3,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  activeMarkerCalloutText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    maxWidth: 120,
  },
  clinicPinBase: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#062247",
    borderWidth: 1.5,
    borderColor: "#184B82",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  clinicPinActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#082548",
    borderColor: "#00E5FF",
    borderWidth: 2,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  clinicPinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#184B82",
    marginTop: -1,
  },
  clinicPinTriangleActive: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderTopColor: "#00E5FF",
  },

  // Native Callout
  nativeCalloutCard: {
    backgroundColor: "#051A36",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#102A4C",
    minWidth: 120,
  },
  nativeCalloutTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  nativeCalloutSub: {
    color: "#9BB3CB",
    fontSize: 9,
    marginTop: 1,
  },

  // Directions Footer
  directionFooter: {
    padding: 12,
    backgroundColor: "#071B34",
    borderTopWidth: 1,
    borderTopColor: "#102A4C",
  },
  directionInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  routeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  routeDetails: {
    flex: 1,
  },
  destinationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  destinationClinicName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  activeTag: {
    backgroundColor: "rgba(48, 135, 229, 0.2)",
    borderWidth: 1,
    borderColor: "#3087E5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: {
    color: "#00E5FF",
    fontSize: 9,
    fontWeight: "800",
  },
  destinationDistanceText: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  destinationAddressText: {
    color: "#7A8D9E",
    fontSize: 10,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  directionsPrimaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#3087E5",
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: "#3087E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  callClinicButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#0B2648",
    borderWidth: 1,
    borderColor: "#3087E5",
    alignItems: "center",
    justifyContent: "center",
  },
});
