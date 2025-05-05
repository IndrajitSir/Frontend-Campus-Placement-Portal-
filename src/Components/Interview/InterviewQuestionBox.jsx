import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea"; 
import { toast } from "react-toastify";
import { predefinedQuestions } from "../../constants/constants.js";

export function InterviewQuestionsBox({ roomId, socket, isInterviewer }) {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState("");
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [question, setQuestion] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.on("receive-set-question", ({ question, code }) => {
                let arr = [];
                let obj = { question: question, code: code };
                arr.push(obj);
                if (Array.isArray(arr) && arr.length > 0) {
                    setQuestion(arr);
                }
            });

            return () => {
                socket.off("receive-set-question");
            }
        }
    }, [socket]);

    const handleSendPredefinedQuestion = () => {
        const selected = predefinedQuestions[selectedQuestionIndex];
        if (!selected) return;
        socket.emit("set-question", { roomId, question: selected.question, code: selected.code }, (res) => {
            if (res?.success) {
                toast.success("Question sent to interviewee successfully!");
            }
        });
    };

    const handleSendManualQuestion = () => {
        if (!manualQuestion.trim()) return;
        socket.emit("set-question", { roomId, question: manualQuestion, code: manualCode }, (res) => {
            if (res?.success) {
                toast.success("Question sent to interviewee successfully!");
            }
        });
        setManualQuestion("");
        setManualCode("");
    };

    return (
        <div className="p-4 space-y-6 bg-white rounded shadow-md">
            {
                isInterviewer ?
                    <>
                        <h2 className="text-lg font-semibold text-center">Ask Questions</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select a Question</label>
                            <select value={selectedQuestionIndex} onChange={(e) => setSelectedQuestionIndex(e.target.value)}
                                className="border p-2 rounded w-full cursor-pointer"
                            >
                                <option value="">-- Select from List --</option>
                                {predefinedQuestions.map((q, idx) => (
                                    <option key={idx} value={idx}>
                                        {q.question}
                                    </option>
                                ))}
                            </select>
                            <Button disabled={selectedQuestionIndex === ""} onClick={handleSendPredefinedQuestion}
                                className="w-full bg-green-600 hover:bg-green-500 mt-2 cursor-pointer"
                            >
                                Send Selected Question
                            </Button>
                        </div>

                        {/* Manual Custom Question */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Ask Your Own Question</label>
                            <Input placeholder="Enter your question..." value={manualQuestion} onChange={(e) => setManualQuestion(e.target.value)}/>
                            <Textarea rows={5} placeholder="Enter related code block..." value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                            <Button onClick={handleSendManualQuestion}
                                className="w-full bg-blue-600 hover:bg-blue-500 mt-2 cursor-pointer"
                            >
                                Send Manual Question
                            </Button>
                        </div>
                    </>
                    :
                    <>
                        {
                            Array.isArray(question) && question.length <= 0 ?
                                <h3 className="text-lg font-bold mb-2">No questions asked yet!</h3>
                                :
                                <>
                                    <h3 className="text-lg font-bold mb-2">📝 Question</h3>
                                    <p className="text-gray-700">{question[0]?.question}</p>
                                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                        {`${question[0]?.code}`}
                                    </pre>
                                </>
                        }
                    </>
            }
        </div>
    );
}