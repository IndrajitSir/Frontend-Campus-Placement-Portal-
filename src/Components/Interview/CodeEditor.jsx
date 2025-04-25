// components/Interview/CodeEditor.jsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '../../components/ui/dialog';
import { languages } from '../../constants/constants.js';

const CodeEditor = ({ onFinalSubmit }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding here");
  const [output, setOutput] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [showExplainStep, setShowExplainStep] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleRun = () => {
    // Mock output - replace with backend execution later
    setOutput("Code executed successfully!");
  };

  const handleSubmit = () => {
    setSnapshot(code); 
    setShowExplainStep(true); 
  };

  const handleFinalSubmit = () => {
    onFinalSubmit({ snapshot, explanation });
    setShowExplainStep(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2 rounded"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>

        <div className="space-x-2">
          <Button onClick={handleRun}>Run</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>

      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />

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
            <p className="text-sm text-gray-500">Explain the following code (snapshot taken):</p>
          </DialogHeader>
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-52 overflow-auto">{snapshot}</pre>
          <textarea
            rows={4}
            className="w-full border p-2 rounded mt-2"
            placeholder="Explain your code here..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
          <div className="flex justify-end">
            <Button className="mt-2" onClick={handleFinalSubmit}>Submit Explanation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;
