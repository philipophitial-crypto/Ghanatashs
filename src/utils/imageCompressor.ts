/**
 * Compresses and resizes an image file down to safe dimensions and compact payload
 * suitable for real-time cloud database sync and instant multi-user rendering.
 */
export async function compressImage(
  file: File | Blob, 
  maxDimension: number = 320, 
  quality: number = 0.82,
  preserveTransparency: boolean = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let outputType = 'image/jpeg';
        if (preserveTransparency && (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml')) {
          outputType = 'image/webp';
        }

        try {
          const dataUrl = canvas.toDataURL(outputType, quality);
          // If payload is still large (> 250KB), compress with jpeg
          if (dataUrl.length > 250000 && outputType !== 'image/jpeg') {
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
