import { useEffect, useState } from "react";
// CONTEXT api
import { useSocket } from "../../context/SocketContext/SocketContext";
// Shadcn components
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
// Icons
import { MessageSquare } from "lucide-react";

export function IntervieweePanel({ roomId }) {
  const { socket } = useSocket();
  const [question, setQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    socket.emit("join-room", roomId);
    socket.on("receive-question", ({ question, snapshotCode }) => {
      let que = { question: question, code: snapshotCode };
      setQuestions((prev) => [...prev, que]);
    });

    return () => {
      socket.off("receive-question");
    };
  }, [socket]);

  const handleSubmit = () => {
    const payload = { roomId, askedQuestion: { question: questions[question].question, code: questions[question].code }, explanation };
    socket.emit("submit-explanation", payload);
  };

  return (
    <>
      <div className="relative">
        <Button className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white shadow-sm" onClick={() => setShowQuestions(true)}>
          {questions.length > 0 &&
            <span className="absolute top-[-10px] right-[-10px] flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0f1530]">{questions.length}</span>
          }
          <MessageSquare />
        </Button>
      </div>
      <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          {
            questions.length > 0 ?
              (
                <select value={question} onChange={(e) => setQuestion(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                  {
                    questions?.map((q, index) => (
                      <option key={index} value={index}>{`question ${index + 1}`}</option>)
                    )
                  }
                </select>
              )
              : <p className="text-center text-sm text-slate-500 dark:text-slate-400">No question asked yet!</p>
          }
          {
            questions.length > 0 &&
            < div className="space-y-4 rounded-xl border border-slate-200 p-4 shadow-sm bg-white dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Question: {questions[question].question || ""}</h3>
              <pre className="overflow-auto rounded-lg bg-slate-100 p-4 text-sm text-slate-700 dark:bg-[#0b1020] dark:text-slate-300">{questions[question].code || ""}</pre>
              <textarea
                placeholder="Explain this code..."
                className="w-full rounded-lg border border-slate-200 p-3 text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={6}
              />
              <div className="flex justify-end">
                <Button className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25" onClick={handleSubmit}>Submit Explanation</Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog >
    </>
  );
}
