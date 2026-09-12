import { useEffect, useState } from "react";
// CONTEXT api
import { useSocket } from "../../context/SocketContext/SocketContext";
// Shadcn components
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent } from "../ui/dialog";

export function InterviewerPanel({ roomId }) {
  const { socket } = useSocket();
  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [askToIntervieweeDialog, setAskToIntervieweeDialog] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveExplanation = (payload) => {
      if (payload.roomId === roomId) {
        const ans = { askedQuestion: payload.askedQuestion, explanation: payload.explanation };
        setAnswers((prev) => [...prev, ans]);
        setSelectedAnswer(ans);
      }
    }
    socket.on("receive-explanation", handleReceiveExplanation);

    return () => {
      socket.off("receive-explanation");
    }
  }, [socket, roomId]);

  const handleSend = () => {
    socket.emit("send-question", { roomId, question, snapshotCode: code });
  };

  return (
    <>
      <div className="relative">
        <Button className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25" onClick={() => setAskToIntervieweeDialog(true)}>Ask Interviewee
          {answers.length > 0 &&
            <span className="absolute top-[-10px] right-[-10px] flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0f1530]">{answers.length}</span>
          }
        </Button>
      </div>
      {/* <Dialog open={askToIntervieweeDialog} onOpenChange={setAskToIntervieweeDialog}>
        <DialogTitle>Interviewee Answer</DialogTitle>
        <DialogContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {answers.length > 0 &&
                (
                  <select value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="border p-2 rounded bg-gray-800 text-white cursor-pointer">
                    {
                      answers?.map((a, index) => (
                        <option key={index} value={a}>{`answer ${index + 1}`}</option>)
                      )
                    }
                  </select>
                )}
              {
                Object.keys(selectedAnswer).length !== 0 &&
                < div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
                  <h3 className="text-xl font-semibold text-gray-800">Question: {selectedAnswer?.askedQuestion?.question || ""}</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700">{selectedAnswer?.askedQuestion?.code || ""}</pre>
                  <h3 className="bg-gray-100 p-4 rounded text-sm text-gray-700">Explanation: {selectedAnswer?.explanation || ""}</h3>
                </div>
              }
            </div>
            <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ask Interviewee</h3>
              <Input
                placeholder="Enter your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border p-3 rounded text-gray-700"
              />
              <textarea
                placeholder="Paste or select code block..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                rows={6}
              />
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" onClick={handleSend}>Send to Interviewee</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
      <Dialog open={askToIntervieweeDialog} onOpenChange={setAskToIntervieweeDialog}>
        {/* <DialogTitle>Interviewee Answers</DialogTitle> */}
        <DialogContent className="space-y-4">
          {answers.length > 0 ? (
            <>
              <select
                value={selectedAnswer ? answers.indexOf(selectedAnswer) : ""}
                onChange={(e) => setSelectedAnswer(answers[parseInt(e.target.value)])}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
              >
                {answers.map((a, index) => (
                  <option key={index} value={index}>
                    Answer {index + 1}
                  </option>
                ))}
              </select>

              {selectedAnswer && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 shadow-sm bg-white dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Question: {selectedAnswer.askedQuestion.question || "N/A"}</h3>
                  <pre className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700 overflow-auto dark:bg-[#0b1020] dark:text-slate-300">{selectedAnswer.askedQuestion.code || "N/A"}</pre>
                  <h3 className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/[0.05] dark:text-slate-300">Explanation: {selectedAnswer.explanation || "N/A"}</h3>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">No answers submitted yet.</p>
          )}

          {/* Ask New Question Section */}
          <div className="space-y-4 rounded-xl border border-slate-200 p-4 shadow-sm bg-white dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Ask Interviewee</h3>
            <Input
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="rounded-lg p-3 text-slate-700 dark:text-slate-200"
            />
            <textarea
              placeholder="Paste code block..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
              rows={6}
            />
            <div className="flex justify-end">
              <Button className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25" onClick={handleSend}>
                Send to Interviewee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


