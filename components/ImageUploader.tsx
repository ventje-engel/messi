
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  image: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, image }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
    }
  }, [image]);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }, [onImageUpload]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300 hover:border-brand-secondary'}`}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="object-contain h-full w-full rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-400">
            <UploadIcon className="w-10 h-10 mb-2" />
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
};
