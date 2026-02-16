export type BewustAutonoom = "Bewust" | "Autonoom";

export interface BehaviorMeta {
  bewust_autonoom?: BewustAutonoom;
  waarden_check?: boolean;
  body_sensations?: string;
  activity_now?: string;
  values_reason?: string;
  behavior_next?: string;
}

export interface CheckInFormState {
  thoughts: string;
  emotions: string[];
  bodyParts: string[];
  energyLevel: number;
  behaviorMeta: BehaviorMeta;
}

export interface CheckInRow {
  id: string;
  user_id: string;
  created_at: string;
  thoughts: string | null;
  emotions: string[];
  body_parts: string[];
  energy_level: number | null;
  behavior_meta: BehaviorMeta | null;
}

export type SaveResult =
  | { ok: true }
  | { ok: false; offline: true }
  | { ok: false; error: string };

export const EMOTION_OPTIONS = [
  { id: "Blij", label: "Blij", emoji: "😊" },
  { id: "Bang", label: "Bang", emoji: "😨" },
  { id: "Bedroefd", label: "Bedroefd", emoji: "😢" },
  { id: "Boos", label: "Boos", emoji: "😠" },
  { id: "Neutraal", label: "Neutraal", emoji: "😐" },
] as const;

export const BODY_PART_IDS = [
  "head",
  "neck",
  "chest",
  "shoulder_left",
  "shoulder_right",
  "arm_left",
  "arm_right",
  "stomach",
  "hip_left",
  "hip_right",
  "leg_left",
  "leg_right",
] as const;

export type BodyPartId = (typeof BODY_PART_IDS)[number];
