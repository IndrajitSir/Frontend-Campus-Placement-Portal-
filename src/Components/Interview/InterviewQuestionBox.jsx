import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea"; 
import { toast } from "react-toastify";
import { predefinedQuestions } from "../../constants/constants.js";

export function InterviewQuestionsBox({ roomId, socket, isInterviewer, onNewQuestion }) {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState("");
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [question, setQuestion] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.on("receive-set-question", ({ question, code }) => {
                if (onNewQuestion) onNewQuestion();
                setQuestion([{ question, code }]);
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
        <div className="space-y-5 p-3">
            {
                isInterviewer ?
                    <>
                        <h2 className="text-lg font-semibold text-center text-slate-100">Ask Questions</h2>
                        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <label className="text-sm font-semibold text-slate-200">Select a Question</label>
                            <select value={selectedQuestionIndex} onChange={(e) => setSelectedQuestionIndex(e.target.value)}
                                className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.05] p-2 text-sm text-slate-200 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="" className="bg-[#0f1530]">-- Select from List --</option>
                                {predefinedQuestions.map((q, idx) => (
                                    <option key={idx} value={idx} className="bg-[#0f1530]">
                                        {q.question}
                                    </option>
                                ))}
                            </select>
                            <Button disabled={selectedQuestionIndex === ""} onClick={handleSendPredefinedQuestion}
                                className="mt-2 w-full cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40"
                            >
                                Send Selected Question
                            </Button>
                        </div>

                        {/* Manual Custom Question */}
                        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <label className="text-sm font-semibold text-slate-200">Ask Your Own Question</label>
                            <Input placeholder="Enter your question..." value={manualQuestion} onChange={(e) => setManualQuestion(e.target.value)}
                                className="border-white/10 bg-white/[0.05] text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500/30" />
                            <Textarea rows={5} placeholder="Enter related code block..." value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/[0.05] p-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <Button onClick={handleSendManualQuestion}
                                className="mt-2 w-full cursor-pointer bg-gradient-to-r from-fuchsia-500 to-violet-500"
                            >
                                Send Manual Question
                            </Button>
                        </div>
                    </>
                    :
                    <>
                        {
                            Array.isArray(question) && question.length <= 0 ?
                                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                                    <h3 className="text-sm font-bold text-slate-300">No questions asked yet!</h3>
                                    <p className="mt-1 text-xs text-slate-500">The interviewer's questions will appear here.</p>
                                </div>
                                :
                                <>
                                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                        <h3 className="mb-2 text-lg font-bold text-slate-100">📝 Question</h3>
                                        <p className="text-sm text-slate-300">{question[0]?.question}</p>
                                        <pre className="mt-3 overflow-auto rounded-lg border border-white/10 bg-[#0b1020] p-3 font-mono text-xs leading-relaxed text-slate-300">
                                            {`${question[0]?.code}`}
                                        </pre>
                                    </div>
                                </>
                        }
                    </>
            }
        </div>
    );
}