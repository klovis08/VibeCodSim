/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        void: "#080808",
        surface: "#111111",
        "surface-light": "#1A1A1A",
        overlay: "#252526",
        "neon-blue": "#00D4FF",
        "neon-green": "#39FF14",
        "neon-purple": "#C586C0",
        "neon-red": "#FF073A",
        "neon-yellow": "#F3F315",
        "neon-teal": "#4EC9B0",
        "accent-blue": "#4FC1FF",
        "border-subtle": "#1e1e1e",
        "border-default": "#333333",
        "text-primary": "#e4e4e4",
        "text-secondary": "#a0a0a0",
        "text-muted": "#666666",
      },
    },
  },
  plugins: [],
};
