import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, HelpCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Learning = () => {
    const [activeTab, setActiveTab] = useState('snippets');
    const [snippets, setSnippets] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchLearningData();
    }, []);

    const fetchLearningData = async () => {
        setLoading(true);
        try {
            const [snippetsRes, quizRes] = await Promise.all([
                api.get('/learning/snippets'),
                api.get('/learning/quiz')
            ]);
            setSnippets(snippetsRes.data.snippets);
            setQuiz(quizRes.data.quiz);
        } catch (error) {
            console.error("Failed to fetch learning data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, option) => {
        if (showResults) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const calculateScore = () => {
        let score = 0;
        quiz.forEach(q => {
            if (selectedAnswers[q.id] === q.answer) score++;
        });
        return score;
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Learning Center 📚</h1>
                <p className="text-gray-600">Expand your farming knowledge with quick tips and quizzes.</p>
            </header>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'snippets' ? 'text-eco-600 border-b-2 border-eco-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('snippets')}
                >
                    Micro-Learning
                </button>
                <button
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'quiz' ? 'text-eco-600 border-b-2 border-eco-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('quiz')}
                >
                    Quiz Challenge
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                </div>
            ) : (
                <div className="min-h-[400px]">
                    {activeTab === 'snippets' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {snippets.map(snippet => (
                                <div key={snippet.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-eco-100 p-3 rounded-full text-2xl">
                                            {snippet.icon}
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-eco-600 uppercase tracking-wider">{snippet.category}</span>
                                            <h3 className="text-lg font-bold text-gray-800 mt-1">{snippet.title}</h3>
                                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{snippet.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {quiz.map((q, idx) => (
                                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-4">
                                        <span className="text-gray-400 mr-2">{idx + 1}.</span>
                                        {q.question}
                                    </h3>
                                    <div className="space-y-3">
                                        {q.options.map(option => {
                                            const isSelected = selectedAnswers[q.id] === option;
                                            const isCorrect = option === q.answer;
                                            const showCorrectness = showResults;

                                            let optionClass = "w-full text-left p-3 rounded-lg border transition flex justify-between items-center ";

                                            if (showCorrectness) {
                                                if (isCorrect) optionClass += "bg-green-50 border-green-200 text-green-800";
                                                else if (isSelected && !isCorrect) optionClass += "bg-red-50 border-red-200 text-red-800";
                                                else optionClass += "border-gray-200 opacity-50";
                                            } else {
                                                if (isSelected) optionClass += "bg-eco-50 border-eco-500 text-eco-800";
                                                else optionClass += "border-gray-200 hover:bg-gray-50";
                                            }

                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => handleAnswerSelect(q.id, option)}
                                                    className={optionClass}
                                                    disabled={showResults}
                                                >
                                                    <span>{option}</span>
                                                    {showCorrectness && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                    {showCorrectness && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {showResults && (
                                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                                            <strong>Explanation:</strong> {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {!showResults ? (
                                <button
                                    onClick={() => setShowResults(true)}
                                    disabled={Object.keys(selectedAnswers).length < quiz.length}
                                    className="w-full bg-eco-600 text-white py-3 rounded-xl font-bold hover:bg-eco-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Quiz
                                </button>
                            ) : (
                                <div className="text-center p-6 bg-eco-50 rounded-xl border border-eco-100">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        You scored {calculateScore()} / {quiz.length}
                                    </h3>
                                    <p className="text-gray-600 mb-4">Great job learning about sustainable farming!</p>
                                    <button
                                        onClick={() => {
                                            setShowResults(false);
                                            setSelectedAnswers({});
                                            fetchLearningData(); // Refresh quiz
                                        }}
                                        className="bg-white text-eco-600 border border-eco-600 px-6 py-2 rounded-lg font-semibold hover:bg-eco-50 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Learning;
