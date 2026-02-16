"use client";

import { useEffect } from "react";
import { getRepositoryBundle } from "@/core/storage";

const CHECK_INTERVAL_MS = 60 * 1000;
const LAST_SENT_KEY = "mind-journal-last-reminder-day";

export function ReminderScheduler() {
  useEffect(() => {
    async function tick() {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const preferences = await getRepositoryBundle().preferences.get();
      if (!preferences?.reminderEnabled || !preferences.reminderTime) return;

      const now = new Date();
      const [hoursText, minutesText] = preferences.reminderTime.split(":");
      const targetHours = Number(hoursText);
      const targetMinutes = Number(minutesText);
      const sameMinute = now.getHours() === targetHours && now.getMinutes() === targetMinutes;
      if (!sameMinute) return;

      const todayKey = now.toISOString().slice(0, 10);
      if (window.localStorage.getItem(LAST_SENT_KEY) === todayKey) return;

      new Notification("Inchecken", {
        body: "Neem een moment voor de 5 vragen.",
      });
      window.localStorage.setItem(LAST_SENT_KEY, todayKey);
    }

    tick();
    const timer = window.setInterval(tick, CHECK_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
