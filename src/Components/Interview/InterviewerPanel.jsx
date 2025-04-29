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
        <Button className="cursor-pointer bg-green-600 hover:bg-green-500" onClick={() => setAskToIntervieweeDialog(true)}>Ask to interviwee
          {answers.length > 0 &&
            <span className="absolute top-[-10px] right-[-10px] bg-red-400 rounded-full h-5 w-5">{answers.length}</span>
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
                className="border p-2 rounded bg-gray-800 text-white cursor-pointer w-full"
              >
                {answers.map((a, index) => (
                  <option key={index} value={index}>
                    Answer {index + 1}
                  </option>
                ))}
              </select>

              {selectedAnswer && (
                <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
                  <h3 className="text-xl font-semibold text-gray-800">Question: {selectedAnswer.askedQuestion.question || "N/A"}</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700">{selectedAnswer.askedQuestion.code || "N/A"}</pre>
                  <h3 className="bg-gray-100 p-4 rounded text-sm text-gray-700">Explanation: {selectedAnswer.explanation || "N/A"}</h3>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">No answers submitted yet.</p>
          )}

          {/* Ask New Question Section */}
          <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ask Interviewee</h3>
            <Input
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border p-3 rounded text-gray-700"
            />
            <textarea
              placeholder="Paste code block..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={6}
            />
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" onClick={handleSend}>
                Send to Interviewee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


