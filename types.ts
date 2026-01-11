
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type Quality = "Standard" | "High" | "Ultra";
export type DeviceType = "Mobile" | "Desktop" | "Mixed";

export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  base64: string;
  isFavorite?: boolean;
}

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  quality: Quality;
  deviceType: DeviceType;
}
