import {
  BODY_PART_IDS,
  EMOTION_OPTIONS,
  type BehaviorMeta,
  type CheckInFormState,
} from "@/types/checkin";

const ALLOWED_EMOTIONS = new Set<string>(EMOTION_OPTIONS.map((entry) => entry.id));
const ALLOWED_BODY_PARTS = new Set<string>(BODY_PART_IDS);
const MAX_THOUGHTS_LENGTH = 3000;
const MAX_TEXT_FIELD_LENGTH = 600;

function sanitizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function sanitizeBehaviorMeta(meta: BehaviorMeta): BehaviorMeta {
  return {
    bewust_autonoom:
      meta.bewust_autonoom === "Bewust" || meta.bewust_autonoom === "Autonoom"
        ? meta.bewust_autonoom
        : undefined,
    waarden_check:
      typeof meta.waarden_check === "boolean" ? meta.waarden_check : undefined,
    body_sensations: sanitizeText(meta.body_sensations ?? "", MAX_TEXT_FIELD_LENGTH) || undefined,
    activity_now: sanitizeText(meta.activity_now ?? "", MAX_TEXT_FIELD_LENGTH) || undefined,
    values_reason: sanitizeText(meta.values_reason ?? "", MAX_TEXT_FIELD_LENGTH) || undefined,
    behavior_next: sanitizeText(meta.behavior_next ?? "", MAX_TEXT_FIELD_LENGTH) || undefined,
  };
}

export function sanitizeCheckInPayload(data: CheckInFormState): CheckInFormState {
  const emotions = [...new Set(data.emotions.filter((emotion) => ALLOWED_EMOTIONS.has(emotion)))];
  const bodyParts = [
    ...new Set(data.bodyParts.filter((bodyPart) => ALLOWED_BODY_PARTS.has(bodyPart))),
  ];
  const energyLevel = Number.isFinite(data.energyLevel)
    ? Math.min(100, Math.max(0, Math.round(data.energyLevel)))
    : 0;

  return {
    thoughts: sanitizeText(data.thoughts, MAX_THOUGHTS_LENGTH),
    emotions,
    bodyParts,
    energyLevel,
    behaviorMeta: sanitizeBehaviorMeta(data.behaviorMeta),
  };
}
