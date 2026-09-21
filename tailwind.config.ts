import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { boxing: "#c52229" } } },
  plugins: [],
} satisfies Config;
