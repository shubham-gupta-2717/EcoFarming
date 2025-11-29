import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Loader2, CheckCircle, BookOpen, Edit, Plus, X, Trash2, Settings } from 'lucide-react';

const AdminLearning = () => {
    const [generating, setGenerating] = useState(false);
    const [generatedModules, setGeneratedModules] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [activeTab, setActiveTab] = useState('ai');
    const [editingId, setEditingId] = useState(null);
    const [manualForm, setManualForm] = useState({
        category: 'Soil Health & Fertility',
        title: '',
        shortDescription: '',
        longDescription: '',
        steps: ['', '', ''],
        benefits: ['', ''],
        difficulty: 'beginner',
        estimatedTime: 2,
        videoUrl: '',
        imageUrl: '',
        quiz: [
            { question: '', options: ['', '', '', ''], correctAnswer: 0 },
            { question: '', options: ['', '', '', ''], correctAnswer: 0 },
            { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
    });

    const categories = [
        'Soil Health & Fertility',
        'Water & Irrigation Management',
        'Pest & Disease Management',
        'Organic & Natural Farming',
        'Crop-Specific Guides',
        'Weather-Based Tips',
        'Farmer Success Stories'
    ];

    const crops = ['Tomato', 'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'All crops'];

    const generateModule = async (category, crop) => {
        try {
            const response = await api.post('/learning/generate-module', {
                category,
                crop,
                difficulty: 'beginner'
            });

            setGeneratedModules(prev => [...prev, {
                category,
                crop,
                ...response.data.module
            }]);

            return response.data.module;
        } catch (error) {
            console.error('Error generating module:', error);
            throw error;
        }
    };

    const generateQuickSet = async () => {
        setGenerating(true);
        setGeneratedModules([]);

        try {
            for (const category of categories) {
                await generateModule(category, 'All crops');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            alert(`Successfully generated ${categories.length} modules!`);
            fetchModules(); // Refresh list
        } catch (error) {
            alert('Error generating modules: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const fetchModules = async () => {
        setLoadingModules(true);
        try {
            console.log('Fetching modules from API...');
            const res = await api.get('/learning/modules');
            console.log('API Response:', res.data);
            console.log('Modules array:', res.data.modules);
            console.log('Modules count:', res.data.modules?.length);
            setAllModules(res.data.modules);
        } catch (error) {
            console.error("Error fetching modules:", error);
            console.error("Error response:", error.response);
        } finally {
            setLoadingModules(false);
        }
    };

    // Fetch modules when Manage tab is active
    React.useEffect(() => {
        if (activeTab === 'manage') {
            fetchModules();
        }
    }, [activeTab]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;
        try {
            await api.delete(`/learning/module/${id}`);
            setAllModules(prev => prev.filter(m => m.moduleId !== id));
        } catch (error) {
            alert('Error deleting module: ' + error.message);
        }
    };

    const handleEdit = (module) => {
        setEditingId(module.moduleId);
        setManualForm({
            category: module.category,
            title: module.title,
            shortDescription: module.shortDescription,
            longDescription: module.longDescription || '',
            steps: module.steps || ['', '', ''],
            benefits: module.benefits || ['', ''],
            difficulty: module.difficulty || 'beginner',
            estimatedTime: module.estimatedTime || 2,
            videoUrl: module.media?.video || '',
            imageUrl: module.media?.image || '',
            quiz: module.quiz && module.quiz.length > 0 ? module.quiz.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer
            })) : [
                { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                { question: '', options: ['', '', '', ''], correctAnswer: 0 }
            ]
        });
        setActiveTab('manual');
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();

        try {
            const moduleData = {
                category: manualForm.category,
                title: manualForm.title,
                shortDescription: manualForm.shortDescription,
                longDescription: manualForm.longDescription,
                steps: manualForm.steps.filter(s => s.trim()),
                benefits: manualForm.benefits.filter(b => b.trim()),
                difficulty: manualForm.difficulty,
                estimatedTime: parseInt(manualForm.estimatedTime),
                media: {
                    image: manualForm.imageUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
                    video: manualForm.videoUrl
                },
                quiz: manualForm.quiz.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: parseInt(q.correctAnswer)
                })),
                relatedCrops: [],
                weatherTriggers: [],
                aiGenerated: false,
                approved: true
            };

            if (editingId) {
                await api.put(`/learning/module/${editingId}`, moduleData);
                alert('Module updated successfully!');
            } else {
                await api.post('/learning/generate-module', { ...moduleData, crop: 'Manual' });
                alert('Module created successfully!');
            }

            setEditingId(null);

            setManualForm({
                category: 'Soil Health & Fertility',
                title: '',
                shortDescription: '',
                longDescription: '',
                steps: ['', '', ''],
                benefits: ['', ''],
                difficulty: 'beginner',
                estimatedTime: 2,
                videoUrl: '',
                imageUrl: '',
                quiz: [
                    { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                    { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
                ]
            });
        } catch (error) {
            alert('Error creating module: ' + error.message);
        }
    };

    const updateFormField = (field, value) => {
        setManualForm(prev => ({ ...prev, [field]: value }));
    };

    const updateStep = (index, value) => {
        const newSteps = [...manualForm.steps];
        newSteps[index] = value;
        setManualForm(prev => ({ ...prev, steps: newSteps }));
    };

    const addStep = () => {
        setManualForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
    };

    const updateBenefit = (index, value) => {
        const newBenefits = [...manualForm.benefits];
        newBenefits[index] = value;
        setManualForm(prev => ({ ...prev, benefits: newBenefits }));
    };

    const updateQuizQuestion = (qIndex, field, value) => {
        const newQuiz = [...manualForm.quiz];
        newQuiz[qIndex] = { ...newQuiz[qIndex], [field]: value };
        setManualForm(prev => ({ ...prev, quiz: newQuiz }));
    };

    const updateQuizOption = (qIndex, oIndex, value) => {
        const newQuiz = [...manualForm.quiz];
        newQuiz[qIndex].options[oIndex] = value;
        setManualForm(prev => ({ ...prev, quiz: newQuiz }));
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Centre Management</h1>
                <p className="text-gray-600">Create learning modules with AI or manually</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-6 py-3 font-medium transition ${activeTab === 'ai'
                        ? 'text-eco-600 border-b-2 border-eco-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        AI Generation
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-6 py-3 font-medium transition ${activeTab === 'manual'
                        ? 'text-eco-600 border-b-2 border-eco-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        {editingId ? 'Edit Module' : 'Manual Creation'}
                    </div>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('manage');
                        setEditingId(null);
                    }}
                    className={`px-6 py-3 font-medium transition ${activeTab === 'manage'
                        ? 'text-eco-600 border-b-2 border-eco-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Manage Modules
                    </div>
                </button>
            </div>

            {/* AI Generation Tab */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-eco-50 to-green-50 border-2 border-eco-300 rounded-xl p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Sparkles className="w-6 h-6 text-eco-600 mt-1" />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Quick Start (8 modules)</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Generate 1 module per category - Fast setup (~1 minute)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={generateQuickSet}
                                disabled={generating}
                                className="w-full bg-eco-600 text-white py-3 rounded-lg hover:bg-eco-700 transition disabled:opacity-50 font-bold flex items-center justify-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Quick Set
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {generating && (
                        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="w-6 h-6 animate-spin text-eco-600" />
                                <h3 className="font-bold text-gray-800">Generating Modules...</h3>
                            </div>
                            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-eco-600 h-full transition-all duration-500"
                                    style={{ width: `${(generatedModules.length / 8) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {generatedModules.length} modules generated
                            </p>
                        </div>
                    )}

                    {generatedModules.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                Generated Modules ({generatedModules.length})
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {generatedModules.map((module, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800">{module.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{module.shortDescription}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span>📚 {module.category}</span>
                                                    <span>⏱️ {module.estimatedTime} min</span>
                                                </div>
                                            </div>
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manage Modules Tab */}
            {activeTab === 'manage' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Learning Modules</h2>

                    {loadingModules ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-eco-600 mx-auto" />
                        </div>
                    ) : allModules.length > 0 ? (
                        <div className="space-y-8">
                            {categories.map(category => {
                                const categoryModules = allModules.filter(m => m.category === category);
                                if (categoryModules.length === 0) return null;

                                return (
                                    <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-bold text-gray-800">{category}</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {categoryModules.map((module) => (
                                                <div key={module.moduleId} className="p-4 flex items-start justify-between hover:bg-gray-50 transition">
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">{module.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{module.shortDescription}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                            <span className={`px-2 py-0.5 rounded ${module.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                                                module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {module.difficulty}
                                                            </span>
                                                            <span>{module.estimatedTime} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(module)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(module.moduleId)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No modules found. Create some first!
                        </div>
                    )}
                </div>
            )}

            {/* Manual Creation Tab */}
            {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingId ? 'Edit Module' : 'Create New Module'}
                        </h2>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setManualForm({
                                        category: 'Soil Health & Fertility',
                                        title: '',
                                        shortDescription: '',
                                        longDescription: '',
                                        steps: ['', '', ''],
                                        benefits: ['', ''],
                                        difficulty: 'beginner',
                                        estimatedTime: 2,
                                        videoUrl: '',
                                        imageUrl: '',
                                        quiz: [
                                            { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                                            { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                                            { question: '', options: ['', '', '', ''], correctAnswer: 0 }
                                        ]
                                    });
                                }}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                value={manualForm.category}
                                onChange={(e) => updateFormField('category', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                            <select
                                value={manualForm.difficulty}
                                onChange={(e) => updateFormField('difficulty', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                required
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={manualForm.title}
                            onChange={(e) => updateFormField('title', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                            placeholder="E.g., Composting for Healthy Tomato Plants"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                        <input
                            type="text"
                            value={manualForm.shortDescription}
                            onChange={(e) => updateFormField('shortDescription', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                            placeholder="One-sentence summary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
                        <textarea
                            value={manualForm.longDescription}
                            onChange={(e) => updateFormField('longDescription', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500 h-24"
                            placeholder="2-3 sentences explaining the module"
                            required
                        />
                    </div>

                    {/* Steps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Steps to Practice *</label>
                        <div className="space-y-2">
                            {manualForm.steps.map((step, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                    placeholder={`Step ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addStep}
                            className="mt-2 text-eco-600 hover:text-eco-700 flex items-center gap-1 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Step
                        </button>
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits *</label>
                        <div className="space-y-2">
                            {manualForm.benefits.map((benefit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={benefit}
                                    onChange={(e) => updateBenefit(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                    placeholder={`Benefit ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Media */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                                type="url"
                                value={manualForm.imageUrl}
                                onChange={(e) => updateFormField('imageUrl', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video URL</label>
                            <input
                                type="url"
                                value={manualForm.videoUrl}
                                onChange={(e) => updateFormField('videoUrl', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                placeholder="https://youtube.com/embed/..."
                            />
                        </div>
                    </div>

                    {/* Quiz Questions */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">Quiz Questions (3 required)</h3>
                        <div className="space-y-6">
                            {manualForm.quiz.map((q, qIndex) => (
                                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question {qIndex + 1} *
                                    </label>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500 mb-3"
                                        placeholder="Enter question"
                                        required
                                    />

                                    <div className="space-y-2">
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswer === oIndex}
                                                    onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                                    className="w-4 h-4 text-eco-600"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-eco-500"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Select the correct answer by clicking the radio button</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-eco-600 text-white py-3 rounded-lg hover:bg-eco-700 transition font-bold"
                    >
                        {editingId ? 'Update Module' : 'Create Module'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AdminLearning;
