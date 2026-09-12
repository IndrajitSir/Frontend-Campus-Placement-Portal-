// Shared framer-motion presets — single source of truth for app-wide motion.
// Brand easing: fast-out, long settle (matches the landing page feel).

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE },
  },
};

export const staggerContainer = (stagger = 0.07, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Wrap motion children with variants={item} inside a staggerContainer parent.
export const item = fadeUp;

// Dialog / popover spring
export const popSpring = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

// Micro-interaction props for interactive elements that are not Buttons
export const tapScale = {
  whileTap: { scale: 0.97 },
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: EASE },
};

export const viewportOnce = { once: true, margin: "-60px" };
