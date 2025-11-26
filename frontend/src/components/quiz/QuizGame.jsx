import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, AlertCircle, Youtube, Image as ImageIcon, ExternalLink } from 'lucide-react';

const QuizGame = ({ questions, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentIndex];

    const handleOptionSelect = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        const newAnswers = { ...answers, [currentQuestion.id]: option };
        setAnswers(newAnswers);

        // Dynamic Scoring
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 5);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            onFinish(answers, score);
        }
    };

    const correctAnswer = currentQuestion.correctAnswer;
    const explanation = currentQuestion.explanation;
    const searchTerm = currentQuestion.visual_search_term || currentQuestion.question;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <span className="text-3xl">🎓</span> Learning Quiz
                </h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-eco-600">Score: {score}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-eco-500 to-eco-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{currentQuestion.question}</h3>

                <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                        let optionClass = "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ";

                        if (isAnswered) {
                            if (option === correctAnswer) {
                                optionClass += "border-green-500 bg-green-50 text-green-800 shadow-sm";
                            } else if (option === selectedOption) {
                                optionClass += "border-red-500 bg-red-50 text-red-800 shadow-sm";
                            } else {
                                optionClass += "border-gray-100 opacity-50 grayscale";
                            }
                        } else {
                            optionClass += "border-gray-100 hover:border-eco-300 hover:bg-eco-50 hover:shadow-md text-gray-700";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isAnswered}
                                className={optionClass}
                            >
                                <span className="font-semibold text-lg">{option}</span>
                                {isAnswered && option === correctAnswer && <CheckCircle className="w-6 h-6 text-green-600" />}
                                {isAnswered && option === selectedOption && option !== correctAnswer && <XCircle className="w-6 h-6 text-red-600" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback & Next Button */}
            {isAnswered && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-6 rounded-xl mb-6 border ${selectedOption === correctAnswer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex gap-4 mb-4">
                            <div className={`p-2 rounded-full h-fit ${selectedOption === correctAnswer ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`font-bold text-lg mb-1 ${selectedOption === correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                                    {selectedOption === correctAnswer ? 'Correct! +5 EcoScore' : 'Incorrect'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{explanation}</p>
                            </div>
                        </div>

                        {/* Visual Learning Links */}
                        <div className="flex flex-wrap gap-3 ml-12">
                            <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                            >
                                <Youtube className="w-4 h-4" /> Watch Video
                            </a>
                            <a
                                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchTerm)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition shadow-sm"
                            >
                                <ImageIcon className="w-4 h-4" /> View Images
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizGame;
