import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Toast
import { toast, ToastContainer } from "react-toastify";
// Icons
import { FaGoogle, FaGithub } from "react-icons/fa";
import { GraduationCap, Eye, EyeOff, Building2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
// Framer Motion
import { AnimatePresence, motion } from "framer-motion";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Render's free tier sleeps after ~15 min without traffic; the first request
// after a cold start is often dropped at the network level ("Failed to fetch" /
// net::ERR_INTERNET_DISCONNECTED). Retrying a few times rides out the wake-up
// window. Only network-level throws are retried; HTTP responses (400/409/500)
// pass through untouched.
const fetchWithRetry = async (url, options, retries = 4) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      const delay = attempt * 2500; // 2.5s, 5s, 7.5s
      console.warn(`Network error on ${url} (attempt ${attempt}/${retries}), retrying in ${delay / 1000}s`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Auth() {
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const [signupInfo, setSignupInfo] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isLogin, setIsLogin] = useState(isLoginPage);
  const { role, setRole, setAccessToken, setRefreshToken, setUserInfo } = useUserData();

  const redirectAfterAuth = (userRole) => {
    if (userRole === "student") {
      navigate("/home");
    } else {
      navigate("/home/dashboard");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginInfo.email || !loginInfo.password) {
      toast.warning("Please enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchWithRetry(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });
      const response = await res.json();
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong!");
        setSubmitting(false);
        return;
      }
      const user = response?.data?.user;
      setRole(user?.role);
      setAccessToken(response?.data?.accessToken);
      setRefreshToken(response?.data?.refreshToken);
      setUserInfo({ user });
      toast.success("Login successful!");
      redirectAfterAuth(user?.role);
    } catch (error) {
      console.error(error);
      toast.error("Login failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!signupInfo.name || !signupInfo.email || !signupInfo.password) {
      toast.warning("Please fill in all the fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchWithRetry(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupInfo),
      });
      const response = await res.json();
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong!");
        setSubmitting(false);
        return;
      }
      const user = response?.data?.user;
      setRole(user?.role);
      setAccessToken(response?.data?.accessToken);
      setRefreshToken(response?.data?.refreshToken);
      setUserInfo({ user });
      toast.success("Registration successful!");
      redirectAfterAuth(user?.role);
    } catch (error) {
      console.error(error);
      toast.error("Registration failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  }

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/github`;
  }

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  const handleToggle = (login) => {
    setIsLogin(login);
    navigate(login ? "/login" : "/register");
  };

  const handleChangeSignup = (e) => {
    setSignupInfo({ ...signupInfo, [e.target.name]: e.target.value });
  };
  const handleChangeLogin = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };
  const handleRoleChange = (e) => {
    setSignupInfo({ ...signupInfo, role: e.target.value });
  };

  const isAdmin = role === "admin" || role === "super_admin";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#0a0e1f]">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* ---------- Animated background ---------- */}
      <div className="absolute inset-0 bg-spotlight" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />

      {/* Floating 3D orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-[110px] animate-float-slow" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-fuchsia-600/25 blur-[100px] animate-float-slower" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-sky-500/20 blur-[110px] animate-float-slow" />

      {/* 3D rotating ring + orbiting node (pure CSS, degrades to static on low-power) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-[-10rem] hidden lg:block preserve-3d">
        <div className="relative h-[30rem] w-[30rem] animate-spin-slow" style={{ transformStyle: "preserve-3d", transform: "rotateX(72deg)" }}>
          <div className="absolute inset-0 rounded-full border border-indigo-400/25" />
          <div className="absolute inset-10 rounded-full border border-fuchsia-400/20" />
          <div className="absolute inset-24 rounded-full border border-sky-400/15" />
          <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_18px_4px_rgba(129,140,248,0.7)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* ---------- Brand panel (desktop) ---------- */}
          <div className="hidden text-white lg:block">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">CampusPlace</span>
            </motion.div>

            <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mt-12 font-display text-5xl font-extrabold leading-[1.1] tracking-tight">
              Connect talent
              <br />
              with <span className="text-gradient-light">opportunity.</span>
            </motion.h1>

            <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
              The campus placement platform where students, companies and placement offices
              come together to build careers.
            </motion.p>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-10 space-y-4">
              {[
                { icon: <Building2 className="h-4 w-4" />, text: "Apply to placement drives in one click" },
                { icon: <ShieldCheck className="h-4 w-4" />, text: "Track every stage — applied to placed" },
                { icon: <Sparkles className="h-4 w-4" />, text: "Verified students, transparent recruitment" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-indigo-300">{f.icon}</span>
                  <span className="text-sm">{f.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ---------- Auth card ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="glass-dark relative w-full rounded-3xl p-8 shadow-2xl shadow-indigo-950/40 sm:p-10">
              {/* Mobile brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-white">CampusPlace</span>
              </div>

              {/* Toggle */}
              <div className="relative mb-8 flex rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10">
                {(["login", "signup"]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleToggle(mode === "login")}
                    className={`relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                      isLogin === (mode === "login") ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30"
                  style={{ left: isLogin ? "0.375rem" : "50%" }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <h2 className="font-display text-2xl font-bold text-white">
                    {isLogin ? (
                      <>
                        Welcome <span className="text-gradient-light">back</span>
                      </>
                    ) : (
                      <>
                        Begin your <span className="text-gradient-light">future</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-400">
                    {isLogin ? "Log in to continue your placement journey" : "Create your account in under a minute"}
                  </p>

                  <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-7 space-y-4">
                    {!isLogin && (
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Full name
                        </label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={signupInfo.name}
                          placeholder="e.g. Ananya Sharma"
                          className={inputClass}
                          onChange={handleChangeSignup}
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={isLogin ? loginInfo.email : signupInfo.email}
                        placeholder="you@college.edu"
                        className={inputClass}
                        onChange={isLogin ? handleChangeLogin : handleChangeSignup}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={isLogin ? loginInfo.password : signupInfo.password}
                          placeholder="••••••••"
                          className={`${inputClass} pr-11`}
                          onChange={isLogin ? handleChangeLogin : handleChangeSignup}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-200"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {!isLogin && (
                      <div>
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">I am a</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleRoleChange({ target: { value: "student" } })}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all cursor-pointer ${
                              signupInfo.role === "student"
                                ? "border-indigo-400/70 bg-indigo-500/15 text-indigo-200 ring-2 ring-indigo-500/25"
                                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                            }`}
                          >
                            <GraduationCap className="h-5 w-5" />
                            Student
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRoleChange({ target: { value: "placement_staff" } })}
                              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all cursor-pointer ${
                                signupInfo.role === "placement_staff"
                                  ? "border-indigo-400/70 bg-indigo-500/15 text-indigo-200 ring-2 ring-indigo-500/25"
                                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                              }`}
                            >
                              <Building2 className="h-5 w-5" />
                              Placement Staff
                            </button>
                          )}
                        </div>
                        {!isAdmin && (
                          <p className="mt-2 text-[11px] text-slate-500">
                            Placement staff accounts are created by administrators.
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <>
                          {isLogin ? "Log in" : "Create account"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">or continue with</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin("google")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <FaGoogle className="h-4 w-4" /> Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGithubLogin("github")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <FaGithub className="h-4 w-4" /> GitHub
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              CampusPlace · Campus Placement &amp; Recruitment System
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
