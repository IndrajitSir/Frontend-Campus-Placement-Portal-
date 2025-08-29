import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor, {/* useMonaco */ } from '@monaco-editor/react';
import html2canvas from "html2canvas";
import debounce from 'lodash.debounce';
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
import { languages } from '../../constants/constants.js';
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

const CodeEditor = ({ onFinalSubmit, userId, interviewId, defaultCode }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding here");
  const [output, setOutput] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showExplainStep, setShowExplainStep] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // const monacoRef = useMonaco();
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const { socket, isSocketReady } = useSocket();
  const { role } = useUserData();
  useEffect(() => {
    setCode(defaultCode);
  }, [defaultCode]);

  useEffect(() => {
    if (!socket) return;
    socket.on("codeUpdate", (data) => {
      if (data !== code) { setCode(data); }
    });

    return () => {
      socket.off("codeUpdate");
    };
  }, [socket, interviewId]);

  const debouncedEmitCodeUpdate = useCallback(
    debounce((updatedCode) => {
      if (socket) {
        socket.emit("codeUpdate", { interviewId, code: updatedCode });
      } else { console.warn("Socket is not ready!"); }
    }, 300), [socket, interviewId, isSocketReady]
  );
  const handleCodeChange = (value) => {
    if (value === undefined) return;
    setCode(value);
    setIsTyping(true);
    debouncedEmitCodeUpdate(value);
  }

  const handleFinalSubmit = () => {
    onFinalSubmit({ snapshot, explanation });
    setShowExplainStep(false);
  };
  const takeSnapshot = async () => {
    const canvas = await html2canvas(editorRef.current, {
      useCORS: true,
      backgroundColor: null
    });
    return canvas.toDataURL("image/png");
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }
  const handleEditorWillMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }
  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2 rounded bg-gray-800 text-white cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>

        <div className="flex gap-4 justify-end mt-4">
          <Button variant="outline" className="cursor-pointer">Run Code</Button>
          {
            role === "student" &&
            <>
              <Button className="cursor-pointer bg-green-600 hover:bg-green-500">Submit Final</Button>
              <IntervieweePanel roomId={interviewId} />
            </>
          }
          {
            role === "placement_staff" &&
            <InterviewerPanel roomId={interviewId} />
          }
        </div>
      </div>

      <div className="w-full h-full border rounded-lg shadow-lg overflow-hidden">
        <Editor
          key={language}
          height="80vh"
          width="200vw"
          defaultLanguage="javascript"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => handleCodeChange(value)}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            wordWrap: "on",
            cursorSmoothCaretAnimation: true,
          }}
        />
      </div>

      {output && (
        <div className="bg-black text-white p-3 rounded">
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      )}

      {/* Explanation Modal */}
      <Dialog open={showExplainStep} onOpenChange={setShowExplainStep}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">Explain This Code</h3>
            <p className="text-sm text-gray-500">Explain the captured portion of code shown in the editor:</p>
          </DialogHeader>
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-52 overflow-auto">{snapshot}</pre>
          <textarea
            rows={5}
            className="w-full border p-2 rounded mt-2"
            placeholder="Explain your code here..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <Button className="mt-2">Submit Explanation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;
