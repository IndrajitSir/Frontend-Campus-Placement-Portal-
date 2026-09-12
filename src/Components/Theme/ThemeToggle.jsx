import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "campusplace-theme";

const isDark = () => document.documentElement.classList.contains("dark");

const ThemeToggle = ({ className = "" }) => {
  const [dark, setDark] = useState(() => isDark());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch (e) {
      /* private mode — ignore */
    }
  }, [dark]);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={() => setDark((v) => !v)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white ${className}`}
    >
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex"
      >
        {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </motion.span>
    </motion.button>
  );
};

export default ThemeToggle;
