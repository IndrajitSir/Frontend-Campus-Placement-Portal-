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
        <Button className="cursor-pointer bg-gray-600 hover:bg-gray-500" onClick={() => setShowQuestions(true)}>
          {questions.length > 0 &&
            <span className="absolute top-[-10px] right-[-10px] bg-red-400 rounded-full h-5 w-5">{questions.length}</span>
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
                  className="border p-2 rounded bg-gray-800 text-white cursor-pointer">
                  {
                    questions?.map((q, index) => (
                      <option key={index} value={index}>{`question ${index + 1}`}</option>)
                    )
                  }
                </select>
              )
              : <p>No question asked!</p>
          }
          {
            questions.length > 0 &&
            < div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Question: {questions[question].question || ""}</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700">{questions[question].code || ""}</pre>
              <textarea
                placeholder="Explain this code..."
                className="w-full border p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={6}
              />
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-500 text-white cursor-pointer" onClick={handleSubmit}>Submit Explanation</Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog >
    </>
  );
}
