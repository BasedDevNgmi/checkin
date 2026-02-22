import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BackupPayload } from "@/core/storage/models";
import { SettingsPanel } from "@/features/settings/components/SettingsPanel";

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div>theme-toggle</div>,
}));

vi.mock("@/core/theme/useThemePreference", () => ({
  useThemePreference: () => ({
    preference: "system",
    setPreference: vi.fn(),
  }),
}));

describe("SettingsPanel", () => {
  let isValid = true;
  const onSavePreferences = vi.fn(async () => {});
  const onExport = vi.fn(
    async (): Promise<BackupPayload> => ({
      version: 1,
      exportedAt: new Date().toISOString(),
      checkins: [],
      userPreferences: null,
    })
  );
  const onImport = vi.fn(async () => {});
  const isValidBackupPayload = (
    _data: unknown
  ): _data is BackupPayload => isValid;
  const listCheckIns = vi.fn(async () => []);
  const restoreCheckIns = vi.fn(async () => {});

  beforeEach(() => {
    vi.clearAllMocks();
    isValid = true;
  });

  it("saves preferences", async () => {
    render(
      <SettingsPanel
        preferences={null}
        onSavePreferences={onSavePreferences}
        onExport={onExport}
        onImport={onImport}
        isValidBackupPayload={isValidBackupPayload}
        listCheckIns={listCheckIns}
        restoreCheckIns={restoreCheckIns}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Instellingen opslaan" }));
    await waitFor(() => expect(onSavePreferences).toHaveBeenCalled());
  });

  it("shows invalid backup message on failed import validation", async () => {
    isValid = false;
    render(
      <SettingsPanel
        preferences={null}
        onSavePreferences={onSavePreferences}
        onExport={onExport}
        onImport={onImport}
        isValidBackupPayload={isValidBackupPayload}
      />
    );

    const file = new File(["{}"], "backup.json", { type: "application/json" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText("Ongeldig backupbestand.")).toBeInTheDocument());
  });
});
