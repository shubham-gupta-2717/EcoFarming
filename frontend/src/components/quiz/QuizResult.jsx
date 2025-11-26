import React from 'react';
import { Trophy, ArrowRight, RefreshCw, BookOpen, Share2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuizResult = ({ data, onRestart }) => {
    const { score, bonus, totalEarned, results, message } = data;
    const totalQuestions = results.length;
    const percentage = (score / (totalQuestions * 5)) * 100;
    const passed = percentage >= 90; // High threshold for "Outstanding"

    return (
        <div className="max-w-3xl mx-auto">
            {/* Certificate Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8 relative">
                {/* Decorative Background */}
                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${passed ? 'from-yellow-500 to-orange-500' : 'from-eco-600 to-eco-500'}`}></div>
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${passed ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <Trophy className={`w-10 h-10 ${passed ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </div>
                </div>

                <div className="pt-52 pb-8 px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {passed ? 'Outstanding Performance!' : 'Quiz Completed'}
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        {passed
                            ? `Incredible! You've mastered this topic and earned a Bonus Reward.`
                            : `Good effort! Score 90% or higher to unlock a Bonus Reward.`}
                    </p>

                    <div className={`grid gap-4 max-w-2xl mx-auto mb-8 ${passed ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                        <div className="bg-eco-50 p-4 rounded-xl border border-eco-100">
                            <p className="text-xs font-bold text-eco-600 uppercase tracking-wider mb-1">Quiz Score</p>
                            <p className="text-3xl font-bold text-eco-800">{score}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Accuracy</p>
                            <p className="text-3xl font-bold text-blue-800">{Math.round(percentage)}%</p>
                        </div>

                        {passed && (
                            <>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Bonus</p>
                                    <p className="text-3xl font-bold text-purple-800">+{bonus || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total Earned</p>
                                    <p className="text-3xl font-bold text-green-800">{totalEarned || score}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onRestart}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        <Link
                            to="/dashboard/learning"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-eco-200 hover:bg-eco-50 transition font-bold"
                        >
                            <BookOpen className="w-5 h-5" />
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-eco-100 rounded-lg flex items-center justify-center text-eco-600 text-sm">📝</span>
                    Review Answers
                </h3>
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={index} className={`p-5 rounded-xl border-l-4 ${result.isCorrect ? 'border-l-green-500 bg-green-50/30' : 'border-l-red-500 bg-red-50/30'} border-gray-100`}>
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <p className="font-bold text-gray-800 text-lg">
                                    {index + 1}. {result.question}
                                </p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                <div className={`p-3 rounded-lg ${result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <span className="font-bold block text-xs opacity-70 mb-1">YOUR ANSWER</span>
                                    {result.selected}
                                </div>
                                {!result.isCorrect && (
                                    <div className="p-3 rounded-lg bg-green-100 text-green-800">
                                        <span className="font-bold block text-xs opacity-70 mb-1">CORRECT ANSWER</span>
                                        {result.correctAnswer}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 italic">
                                <span className="font-bold not-italic text-eco-600">💡 Explanation:</span> {result.explanation}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizResult;
