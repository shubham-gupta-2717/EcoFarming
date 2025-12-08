/**
 * Image Compression Utility (Canvas-based)
 * STRICT REQUIREMENT: Output size must be < 300KB
 */

export const compressImage = async (file, maxSizeBytes = 300 * 1024) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            image.src = e.target.result;
        };

        reader.onerror = (err) => reject(err);

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 1. Initial Dimensions (Max 1280px width)
            let width = image.width;
            let height = image.height;
            const maxWidth = 1280;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0, width, height);

            // 2. Iterative Compression to fit limit
            let quality = 0.8;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);

            const checkSize = (url) => {
                const head = 'data:image/jpeg;base64,';
                return Math.round((url.length - head.length) * 3 / 4);
            };

            // Loop: Reduce quality until < 300KB or quality too low
            while (checkSize(dataUrl) > maxSizeBytes && quality > 0.3) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            // Convert Base64 to Blob for storage
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    console.log(`✅ Image Compressed: ${(blob.size / 1024).toFixed(2)}KB (Quality: ${quality.toFixed(1)})`);
                    resolve(blob);
                })
                .catch(reject);
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Convert Blob back to base64 for display (if needed)
 */
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
