import "dotenv/config";
import db, { themesTable } from "@repo/database";

const DEFAULT_THEMES = [
  {
    name: "Classic Minimal",
    description: "Clean white background with indigo accents",
    config: {
      primaryColor: "#6366f1",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
      buttonStyle: "solid",
      questionSpacing: "normal",
    },
    isDefault: true,
  },
  {
    name: "Dark Mode",
    description: "Sleek dark theme for modern forms",
    config: {
      primaryColor: "#818cf8",
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
      buttonStyle: "solid",
      questionSpacing: "normal",
    },
    isDefault: true,
  },
  {
    name: "Warm Sunset",
    description: "Warm orange and amber tones",
    config: {
      primaryColor: "#f97316",
      backgroundColor: "#fffbeb",
      textColor: "#1c1917",
      fontFamily: "Georgia, serif",
      borderRadius: "12px",
      buttonStyle: "solid",
      questionSpacing: "spacious",
    },
    isDefault: true,
  },
  {
    name: "Ocean Breeze",
    description: "Calm blue tones inspired by the sea",
    config: {
      primaryColor: "#0ea5e9",
      backgroundColor: "#f0f9ff",
      textColor: "#0c4a6e",
      fontFamily: "Inter, sans-serif",
      borderRadius: "6px",
      buttonStyle: "outline",
      questionSpacing: "normal",
    },
    isDefault: true,
  },
  {
    name: "Anime Neon",
    description: "Vibrant neon colors for fun surveys",
    config: {
      primaryColor: "#ec4899",
      backgroundColor: "#0d0d1a",
      textColor: "#f0abfc",
      fontFamily: "Inter, sans-serif",
      borderRadius: "16px",
      buttonStyle: "solid",
      questionSpacing: "normal",
    },
    isDefault: true,
  },
];

export async function seedThemes(): Promise<Map<string, string>> {
  console.log("🎨 Seeding themes...");

  const themeIdMap = new Map<string, string>();

  for (const theme of DEFAULT_THEMES) {
    const existing = await db.query.themesTable.findFirst({
      where: (t, { eq }) => eq(t.name, theme.name),
    });

    if (existing) {
      themeIdMap.set(theme.name, existing.id);
      console.log(`  ✓ Theme "${theme.name}" already exists`);
      continue;
    }

    const [inserted] = await db
      .insert(themesTable)
      .values(theme)
      .returning({ id: themesTable.id });

    if (inserted) {
      themeIdMap.set(theme.name, inserted.id);
      console.log(`  ✓ Created theme "${theme.name}"`);
    }
  }

  return themeIdMap;
}
