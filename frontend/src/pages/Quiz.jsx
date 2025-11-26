import React, { useState } from 'react';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizGame from '../components/quiz/QuizGame';
import QuizResult from '../components/quiz/QuizResult';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

const Quiz = () => {
    const [step, setStep] = useState('SETUP'); // SETUP, LOADING, GAME, RESULT
    const [quizData, setQuizData] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [error, setError] = useState('');

    const handleStartQuiz = async (setupData) => {
        setStep('LOADING');
        setError('');
        try {
            const response = await api.post('/quiz/generate', setupData);
            if (response.data.success) {
                setQuizData({
                    id: response.data.quizId,
                    questions: response.data.questions
                });
                setStep('GAME');
            }
        } catch (err) {
            console.error("Quiz generation failed:", err);
            setError('Failed to generate quiz. Please try again.');
            setStep('SETUP');
        }
    };

    const handleFinishQuiz = async (results, score) => {
        setStep('LOADING');
        try {
            const response = await api.post('/quiz/submit', {
                quizId: quizData.id,
                answers: results // { questionId: selectedOption }
            });

            if (response.data.success) {
                setResultData(response.data);
                setStep('RESULT');
            }
        } catch (err) {
            console.error("Quiz submission failed:", err);
            setError('Failed to submit quiz results.');
            setStep('GAME'); // Go back to game or handle error gracefully
        }
    };

    const handleRestart = () => {
        setStep('SETUP');
        setQuizData(null);
        setResultData(null);
        setError('');
    };

    return (
        <div className="space-y-6">
            {step === 'SETUP' && (
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Learning Quiz</h1>
                        <p className="text-gray-600">Test your knowledge and earn EcoScore</p>
                    </div>
                </header>
            )}


            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
                    <span className="text-xl">⚠️</span> {error}
                </div>
            )}

            {step === 'LOADING' && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Loader2 className="w-16 h-16 text-eco-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-gray-800">Analyzing your farm profile...</p>
                    <p className="text-gray-500 mt-2">Generating practical questions for your crop & soil.</p>
                </div>
            )}

            {step === 'SETUP' && <QuizSetup onStart={handleStartQuiz} />}

            {step === 'GAME' && quizData && (
                <QuizGame
                    questions={quizData.questions}
                    onFinish={handleFinishQuiz}
                />
            )}

            {step === 'RESULT' && resultData && (
                <QuizResult
                    data={resultData}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
};

export default Quiz;
