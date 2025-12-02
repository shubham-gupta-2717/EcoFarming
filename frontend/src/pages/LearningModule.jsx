import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ArrowLeft, Clock, BarChart3, CheckCircle, Play, BookOpen, Award } from 'lucide-react';

const LearningModule = () => {
    const { moduleId } = useParams();
    const [module, setModule] = useState(null);
    const [progress, setProgress] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const { updateUser } = useAuth();

    useEffect(() => {
        fetchModule();
    }, [moduleId]);

    const fetchModule = async () => {
        try {
            const response = await api.get(`/learning/module/${moduleId}`);
            setModule(response.data.module);
            setProgress(response.data.progress);

            // Initialize quiz answers array
            if (response.data.module.quiz) {
                setQuizAnswers(new Array(response.data.module.quiz.length).fill(null));
            }
        } catch (error) {
            console.error('Error fetching module:', error);
        }
    };

    useEffect(() => {
        if (progress?.status === 'completed' && module?.quiz) {
            setQuizResult({
                passed: progress.passed,
                score: progress.quizScore,
                correct: Math.round((progress.quizScore / 100) * module.quiz.length),
                total: module.quiz.length,
                alreadyCompleted: true
            });
            setShowQuiz(true);
        }
    }, [progress, module]);

    const handleQuizSubmit = async () => {
        // Check if all questions answered
        if (quizAnswers.some(ans => ans === null)) {
            alert('Please answer all questions before submitting');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/learning/quiz/submit', {
                moduleId,
                answers: quizAnswers
            });

            setQuizResult(response.data);

            // Update local user state if passed
            if (response.data.passed || response.data.score === 100) {
                updateUser(prev => ({
                    ...prev,
                    ecoScore: (prev.ecoScore || 0) + 20,
                    learningModulesCompleted: (prev.learningModulesCompleted || 0) + 1
                }));
            }

        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (!module) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-eco-600 hover:text-eco-700 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{module.title}</h1>
                        <p className="text-gray-600 mb-4">{module.shortDescription}</p>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full font-medium text-sm ${getDifficultyColor(module.difficulty)}`}>
                                {module.difficulty}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {module.estimatedTime} min read
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                                <BarChart3 className="w-4 h-4" />
                                {module.category}
                            </span>
                        </div>
                    </div>

                    {progress?.status === 'completed' && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Completed
                        </div>
                    )}
                </div>
            </div>

            {/* Video (if available) */}
            {module.media?.video && (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                    <div className="aspect-video flex items-center justify-center">
                        <iframe
                            width="100%"
                            height="100%"
                            src={module.media.video}
                            title={module.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Image */}
            {module.media?.image && !module.media?.video && (
                <img
                    src={module.media.image}
                    alt={module.title}
                    className="w-full h-64 object-cover rounded-xl"
                />
            )}

            {/* Content */}
            <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About This Module</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                    {module.longDescription || module.shortDescription || 'No description available'}
                </p>

                {module.steps && module.steps.length > 0 && (
                    <>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Steps to Practice:</h3>
                        <div className="space-y-3 mb-6">
                            {module.steps.map((step, index) => (
                                <div key={index} className="flex gap-3">
                                    <span className="bg-eco-100 text-eco-700 w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-700 pt-0.5">{step}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {module.benefits && module.benefits.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">🌟 Benefits:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            {module.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {(!module.steps || module.steps.length === 0) && (!module.benefits || module.benefits.length === 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">⚠️ This module is missing step-by-step instructions and benefits. Please contact admin to complete the module content.</p>
                    </div>
                )}
            </div>

            {/* Quiz Section */}
            {!showQuiz ? (
                <div className="bg-eco-50 border-2 border-eco-300 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Ready to Test Your Knowledge?</h3>
                            <p className="text-gray-600">Take a quick quiz to earn credits and unlock badges!</p>
                        </div>
                        <button
                            onClick={() => setShowQuiz(true)}
                            className="bg-eco-600 text-white px-6 py-3 rounded-lg hover:bg-eco-700 transition flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Start Quiz
                        </button>
                    </div>
                </div>
            ) : quizResult ? (
                // Quiz Result
                <div className={`rounded-xl p-8 text-center ${quizResult.score === 100 ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                    {quizResult.score === 100 ? (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h2>
                            <p className="text-green-700 text-lg mb-4">
                                You scored {quizResult.score}% ({quizResult.correct}/{quizResult.total} correct)
                            </p>
                            {quizResult.badgeAwarded && (
                                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 inline-block mb-4">
                                    <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                    <p className="font-bold text-yellow-900">Badge Earned: {quizResult.badgeAwarded}</p>
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/dashboard/learning')}
                                className="bg-eco-600 text-white px-6 py-3 rounded-lg hover:bg-eco-700 transition"
                            >
                                Browse More Modules
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed</h2>
                            <p className="text-gray-700 mb-4">
                                You scored {quizResult.score}% ({quizResult.correct}/{quizResult.total} correct).
                                <br />
                                <span className="text-sm text-red-600 font-medium">
                                    Note: EcoScore is only awarded for 100% score on the first attempt.
                                </span>
                            </p>

                            {/* Review Wrong Answers */}
                            <div className="text-left mt-6 bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-3">Review:</h3>
                                {module.quiz.map((q, i) => {
                                    const userAnswer = quizAnswers[i]; // We need to persist answers or get them from result
                                    // Since we might not have quizAnswers persisted if page reloaded, we rely on current state if available
                                    // For now, we only show this immediately after submission
                                    const isCorrect = String(userAnswer) === String(q.correctAnswer);

                                    if (isCorrect) return null;

                                    return (
                                        <div key={i} className="mb-4 p-3 bg-red-50 rounded border border-red-100">
                                            <p className="font-medium text-red-800 mb-1">Q{i + 1}: {q.question}</p>
                                            <p className="text-sm text-red-600 mb-1">Your Answer: {q.options[userAnswer]}</p>
                                            <p className="text-sm text-green-700 font-medium">Correct Answer: {q.options[q.correctAnswer]}</p>
                                            {q.explanation && (
                                                <p className="text-sm text-gray-600 mt-1 italic">💡 {q.explanation}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 justify-center mt-6">
                                <button
                                    onClick={() => navigate('/dashboard/learning')}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                                >
                                    Back to Learning Centre
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                // Quiz Questions
                <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz</h2>

                    <div className="space-y-6">
                        {module.quiz?.map((question, qIndex) => (
                            <div key={qIndex} className="border-b pb-6 last:border-0">
                                <p className="font-bold text-gray-800 mb-3">
                                    {qIndex + 1}. {question.question}
                                </p>
                                <div className="space-y-2">
                                    {question.options.map((option, oIndex) => (
                                        <label
                                            key={oIndex}
                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${quizAnswers[qIndex] === oIndex
                                                ? 'border-eco-500 bg-eco-50'
                                                : 'border-gray-200 hover:border-eco-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                checked={quizAnswers[qIndex] === oIndex}
                                                onChange={() => {
                                                    const newAnswers = [...quizAnswers];
                                                    newAnswers[qIndex] = oIndex;
                                                    setQuizAnswers(newAnswers);
                                                }}
                                                className="w-4 h-4 text-eco-600"
                                            />
                                            <span className="text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleQuizSubmit}
                        disabled={submitting || quizAnswers.some(ans => ans === null)}
                        className="w-full bg-eco-600 text-white py-3 rounded-lg hover:bg-eco-700 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            )}
        </div >
    );
};

export default LearningModule;
