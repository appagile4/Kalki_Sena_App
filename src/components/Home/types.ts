export interface QuickActionItem {
  id: string;
  label: string;
  iconName: string;
  onPress?: () => void;
}

export interface CommunityProgramItem {
  id: string;
  title: string;
  type: "doctor" | "driver" | "clinic" | "coaching";
  imageSource?: any;
  onPress?: () => void;
}

export interface ServiceItem {
  id: string;
  title: string;
  iconName: string;
  iconFamily?: "ionicons" | "material" | "community" | "font-awesome";
  onPress?: () => void;
}

export interface SocialLinkItem {
  id: string;
  name: "whatsapp" | "instagram" | "facebook" | "youtube";
  url?: string;
  onPress?: () => void;
}
