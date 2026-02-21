import type { CheckInRow } from "@/types/checkin";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

export const MOCK_CHECKINS: CheckInRow[] = [
  {
    id: "mock-1",
    user_id: "dev-user",
    created_at: daysAgo(0),
    thoughts: "Vandaag goed geslapen, energiek begonnen. Werk verliep soepel.",
    emotions: ["Blij", "Neutraal"],
    body_parts: ["chest"],
    energy_level: 82,
    behavior_meta: {
      bewust_autonoom: "Bewust",
      waarden_check: true,
      activity_now: "Werken aan project",
      values_reason: "Groei en focus",
      behavior_next: "Pauze nemen na lunch",
    },
  },
  {
    id: "mock-2",
    user_id: "dev-user",
    created_at: daysAgo(1),
    thoughts: "Drukke dag, veel meetings. Moe maar voldaan.",
    emotions: ["Neutraal"],
    body_parts: ["head", "neck"],
    energy_level: 55,
    behavior_meta: {
      bewust_autonoom: "Autonoom",
      waarden_check: false,
      activity_now: "Vergaderingen",
    },
  },
  {
    id: "mock-3",
    user_id: "dev-user",
    created_at: daysAgo(2),
    thoughts: "Rustige ochtend, wandeling gemaakt. Helder hoofd.",
    emotions: ["Blij"],
    body_parts: [],
    energy_level: 90,
    behavior_meta: {
      bewust_autonoom: "Bewust",
      waarden_check: true,
      activity_now: "Wandelen",
      values_reason: "Gezondheid en rust",
    },
  },
  {
    id: "mock-4",
    user_id: "dev-user",
    created_at: daysAgo(3),
    thoughts: null,
    emotions: ["Bedroefd", "Bang"],
    body_parts: ["stomach", "chest"],
    energy_level: 32,
    behavior_meta: {
      bewust_autonoom: "Autonoom",
      waarden_check: false,
    },
  },
  {
    id: "mock-5",
    user_id: "dev-user",
    created_at: daysAgo(4),
    thoughts: "Productieve werkdag, goed team-overleg gehad.",
    emotions: ["Blij", "Neutraal"],
    body_parts: ["shoulder_left"],
    energy_level: 71,
    behavior_meta: {
      bewust_autonoom: "Bewust",
      waarden_check: true,
      activity_now: "Teamwork",
      values_reason: "Samenwerking",
      behavior_next: "Feedback geven",
    },
  },
  {
    id: "mock-6",
    user_id: "dev-user",
    created_at: daysAgo(5),
    thoughts: "Slecht geslapen, prikkelbaar. Avond was beter.",
    emotions: ["Boos", "Neutraal"],
    body_parts: ["head"],
    energy_level: 40,
    behavior_meta: {
      bewust_autonoom: "Autonoom",
      waarden_check: false,
      activity_now: "Routine",
    },
  },
  {
    id: "mock-7",
    user_id: "dev-user",
    created_at: daysAgo(6),
    thoughts: "Weekend, uitgerust. Tijd met familie doorgebracht.",
    emotions: ["Blij"],
    body_parts: [],
    energy_level: 88,
    behavior_meta: {
      bewust_autonoom: "Bewust",
      waarden_check: true,
      activity_now: "Familie",
      values_reason: "Verbinding",
    },
  },
];
