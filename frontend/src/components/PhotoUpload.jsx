import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

const PhotoUpload = ({ onUpload, disabled = false }) => {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Compress image if needed
            const compressedFile = await compressImage(file);

            // Pass file to parent
            onUpload(compressedFile);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large
                    const maxDimension = 1920;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        0.8 // Quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
            />

            {!preview ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-eco-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-eco-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-600">Processing image...</p>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-700 font-medium">Upload Photo Proof</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Click to take a photo or upload from gallery
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Max size: 5MB • Formats: JPG, PNG
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </button>
            ) : (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-eco-500"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Photo Ready</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;
