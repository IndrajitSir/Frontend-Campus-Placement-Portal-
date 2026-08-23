import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import html2canvas from "html2canvas";
import debounce from 'lodash.debounce';
import { motion } from 'framer-motion';
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
import { Play, Send, Terminal, LoaderCircle } from 'lucide-react';

const CodeEditor = ({ onFinalSubmit, userId, interviewId, language, setLanguage }) => {
  const [code, setCode] = useState(defaultCodeByLanguage.javascript);
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showExplainStep, setShowExplainStep] = useState(false);
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const { socket, isSocketReady } = useSocket();
  const { role } = useUserData();

  // Sync language from parent
  useEffect(() => {
    if (language && defaultCodeByLanguage[language]) {
      setCode(defaultCodeByLanguage[language]);
    }
  }, [language]);

  // Receive code updates from other participants
  useEffect(() => {
    if (!socket) return;
    socket.on("codeUpdate", (data) => {
      if (data !== code) { setCode(data); }
    });
    return () => {
      socket.off("codeUpdate");
    };
  }, [socket, interviewId]);

  // Receive language changes from other participants
  useEffect(() => {
    if (!socket) return;
    socket.on("interview:languageChange", ({ language: newLang }) => {
      if (newLang && newLang !== language) {
        setLanguage(newLang);
      }
    });
    return () => {
      socket.off("interview:languageChange");
    };
  }, [socket, language]);

  const debouncedEmitCodeUpdate = useCallback(
    debounce((updatedCode) => {
      if (socket) {
        socket.emit("codeUpdate", { interviewId, code: updatedCode });
      }
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
    if (socket) {
      socket.emit("interview:languageChange", { roomId: interviewId, language: newLang });
    }
  };

  const handleRunCode = () => {
    setRunning(true);
    setShowOutput(true);
    // Simulate code execution output
    setTimeout(() => {
      setOutput(`[${language.toUpperCase()}] Code execution is simulated in this environment.\nOutput would appear here with a code execution backend.\n\nYour code:\n${code.slice(0, 200)}${code.length > 200 ? "..." : ""}`);
      setRunning(false);
    }, 800);
  };

  const handleFinalSubmit = () => {
    onFinalSubmit({ snapshot, explanation, language, userId, interviewId });
    setShowExplainStep(false);
  };

  const takeSnapshot = async () => {
    if (!editorRef.current) return "";
    try {
      const canvas = await html2canvas(editorRef.current, {
        useCORS: true,
        backgroundColor: null
      });
      return canvas.toDataURL("image/png");
    } catch {
      return "";
    }
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

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-[#252526] px-4 py-2.5">
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white outline-none transition hover:border-indigo-500 focus:border-indigo-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
          <span className="hidden text-[10px] text-slate-500 sm:inline">
            {languages.find(l => l.id === language)?.label || language}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={running}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {running ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Run
          </button>

          <button
            onClick={() => setShowOutput(!showOutput)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <Terminal className="h-3 w-3" /> Output
          </button>

          {role === "student" && (
            <>
              <button
                onClick={() => setShowExplainStep(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
              >
                <Send className="h-3 w-3" /> Submit
              </button>
              <IntervieweePanel roomId={interviewId} />
            </>
          )}
          {role === "placement_staff" && (
            <InterviewerPanel roomId={interviewId} />
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="h-[60vh] min-h-[400px]">
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
            fontSize: 14,
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
            padding: { top: 12 },
          }}
        />
      </div>

      {/* Output panel */}
      {showOutput && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-700 bg-[#1e1e1e]"
        >
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Output</span>
            </div>
            <button onClick={() => setShowOutput(false)} className="cursor-pointer text-slate-500 hover:text-slate-300 text-xs">Close</button>
          </div>
          <pre className="max-h-40 overflow-auto px-4 pb-3 font-mono text-xs text-emerald-400">
            {output || "No output yet. Click Run to execute."}
          </pre>
        </motion.div>
      )}

      {/* Explanation Modal */}
      <Dialog open={showExplainStep} onOpenChange={setShowExplainStep}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">Submit Your Solution</h3>
            <p className="text-sm text-gray-500">Explain your approach and solution:</p>
          </DialogHeader>
          <div className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3">
            <pre className="text-xs text-slate-300">{code}</pre>
          </div>
          <textarea
            rows={5}
            className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Explain your code, approach, and time/space complexity..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
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
