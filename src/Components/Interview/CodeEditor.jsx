import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import html2canvas from "html2canvas";
import debounce from 'lodash.debounce';
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn components
import { Button } from '../../Components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '../../Components/ui/dialog';
// Components
import { InterviewerPanel } from '../../Components/Interview/InterviewerPanel';
import { IntervieweePanel } from './IntervieweePanel';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Constants
import { languages, defaultCodeByLanguage } from '../../constants/constants.js';
// Icons
import { toast } from 'react-toastify';
import { Play, Send, Terminal, LoaderCircle, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';

// Piston API language mappings
const PISTON_LANG_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
  php: { language: "php", version: "8.2.3" },
  kotlin: { language: "kotlin", version: "1.8.20" },
  rust: { language: "rust", version: "1.68.2" },
  go: { language: "go", version: "1.16.2" },
  dart: { language: "dart", version: "3.0.1" },
  sql: { language: "sqlite3", version: "3.36.0" },
};

const API_URL = import.meta.env.VITE_API_URL;

const CodeEditor = ({ onFinalSubmit, userId, interviewId, language, setLanguage }) => {
  const [code, setCode] = useState(defaultCodeByLanguage.javascript);
  const [output, setOutput] = useState("");
  const [outputError, setOutputError] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [running, setRunning] = useState(false);
  const [outputHeight, setOutputHeight] = useState(160);
  const [snapshot, setSnapshot] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showExplainStep, setShowExplainStep] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const { socket, isSocketReady } = useSocket();
  const { role, accessToken } = useUserData();

  useEffect(() => {
    if (language && defaultCodeByLanguage[language]) {
      setCode(defaultCodeByLanguage[language]);
    }
  }, [language]);

  useEffect(() => {
    if (!socket) return;
    socket.on("codeUpdate", (data) => { if (data !== code) setCode(data); });
    return () => { socket.off("codeUpdate"); };
  }, [socket, interviewId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("interview:languageChange", ({ language: newLang }) => {
      if (newLang && newLang !== language) setLanguage(newLang);
    });
    return () => { socket.off("interview:languageChange"); };
  }, [socket, language]);

  const debouncedEmitCodeUpdate = useCallback(
    debounce((updatedCode) => {
      if (socket) socket.emit("codeUpdate", { interviewId, code: updatedCode });
    }, 300), [socket, interviewId, isSocketReady]
  );

  const handleCodeChange = (value) => {
    if (value === undefined) return;
    setCode(value);
    debouncedEmitCodeUpdate(value);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(defaultCodeByLanguage[newLang] || `// ${newLang}`);
    if (socket) socket.emit("interview:languageChange", { roomId: interviewId, language: newLang });
  };

  // Real code execution via backend proxy
  const handleRunCode = async () => {
    if (!code.trim()) { toast.warning("Write some code first"); return; }
    setRunning(true);
    setShowOutput(true);
    setOutputError(false);
    setOutput("Compiling and running...");

    try {
      const response = await fetch(`${API_URL}/api/v1/code-execution/execute`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ language, code }),
      });

      const result = await response.json();

      if (!response.ok || !result?.data?.success) {
        const errMsg = result?.data?.compileError || result?.data?.stderr || result?.message || "Execution failed";
        setOutputError(true);
        setOutput(errMsg);
      } else {
        const { stdout, stderr, compileError } = result.data;
        if (compileError) {
          setOutputError(true);
          setOutput(compileError);
        } else if (stderr) {
          setOutputError(true);
          setOutput(stdout ? `${stdout}\n\n${stderr}` : stderr);
        } else {
          setOutputError(false);
          setOutput(stdout || "(no output)");
        }
      }
    } catch (err) {
      setOutputError(true);
      setOutput(`Network error: could not reach code execution service.\n${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleFinalSubmit = () => {
    onFinalSubmit({ snapshot, explanation, language, userId, interviewId });
    setShowExplainStep(false);
  };

  const takeSnapshot = async () => {
    if (!editorRef.current) return "";
    try {
      const canvas = await html2canvas(editorRef.current, { useCORS: true, backgroundColor: null });
      return canvas.toDataURL("image/png");
    } catch { return ""; }
  };

  const handleSubmitWithExplanation = async () => {
    const snap = await takeSnapshot();
    setSnapshot(snap);
    onFinalSubmit({ fullCode: code, explanation, snapshot: snap, language, userId, interviewId });
    setShowExplainStep(false);
    toast.success("Submitted successfully!");
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorWillMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-2">
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
            className="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-medium text-white outline-none transition hover:border-indigo-500 focus:border-indigo-500">
            {languages.map((lang) => (<option key={lang.id} value={lang.id}>{lang.label}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleRunCode} disabled={running}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">
            {running ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Run
          </button>
          <button onClick={() => setShowOutput(!showOutput)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:border-slate-500 hover:text-white">
            <Terminal className="h-3 w-3" /> Console
          </button>
          {role === "student" && (
            <>
              <button onClick={() => setShowExplainStep(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110">
                <Send className="h-3 w-3" /> Submit
              </button>
              <IntervieweePanel roomId={interviewId} />
            </>
          )}
          {role === "placement_staff" && <InterviewerPanel roomId={interviewId} />}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="min-h-0 flex-1">
        <Editor
          key={language}
          height="100%"
          width="100%"
          language={languages.find(l => l.id === language)?.monaco || language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            automaticLayout: true,
            fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            wordWrap: "on",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: "gutter",
          }}
        />
      </div>

      {/* ── Output panel ── */}
      <AnimatePresence>
        {showOutput && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: outputHeight, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-t border-slate-700 bg-[#1a1a2e]">
            {/* Resize handle */}
            <div className="group flex h-5 cursor-ns-resize items-center justify-center bg-[#252526] transition hover:bg-slate-700"
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startH = outputHeight;
                const onMove = (ev) => { setOutputHeight(Math.max(80, Math.min(400, startH - (ev.clientY - startY)))); };
                const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}>
              <div className="h-0.5 w-8 rounded-full bg-slate-600 transition group-hover:bg-slate-400" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5">
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-slate-500" />
                <span className="text-[11px] font-semibold text-slate-400">Output</span>
                {running && <LoaderCircle className="h-3 w-3 animate-spin text-indigo-400" />}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleCopyOutput} className="cursor-pointer rounded p-0.5 text-slate-500 transition hover:text-slate-300" title="Copy output">
                  {copiedOutput ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
                <button onClick={() => setShowOutput(false)} className="cursor-pointer rounded p-0.5 text-slate-500 transition hover:text-slate-300">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
            {/* Content */}
            <pre className={`max-h-[calc(100%-2rem)] overflow-auto px-3 pb-2 font-mono text-xs leading-relaxed ${outputError ? 'text-red-400' : 'text-emerald-400'}`}>
              {output || "No output yet. Click Run to execute."}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Explanation Modal ── */}
      <Dialog open={showExplainStep} onOpenChange={setShowExplainStep}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">Submit Your Solution</h3>
            <p className="text-sm text-gray-500">Explain your approach and solution:</p>
          </DialogHeader>
          <div className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3">
            <pre className="text-xs text-slate-300">{code}</pre>
          </div>
          <textarea rows={5}
            className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Explain your code, approach, and time/space complexity..."
            value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExplainStep(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmitWithExplanation} className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600">Submit Solution</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;
