import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from './ui';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (files: FileList | File[]) => {
    const newImages: string[] = [];
    let processedCount = 0;
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      // Limit to ~2MB mostly for API safety/speed
      if (file.size > 2 * 1024 * 1024) {
          console.warn('Image skipped because it is too large (>2MB).');
          return; 
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        processedCount++;
        
        // When all valid files are processed, update state
        if (processedCount === fileArray.length || (processedCount > 0 && processedCount === fileArray.filter(f => f.type.startsWith('image/') && f.size <= 2*1024*1024).length)) {
           // Append new images to existing ones, limiting total to e.g. 5
           const updated = [...images, ...newImages].slice(0, 5);
           onImagesChange(updated);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [images, onImagesChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset value so same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Upload Area */}
      {images.length < 5 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 
            ${images.length > 0 ? 'h-32' : 'flex-grow min-h-[200px]'}
            flex flex-col items-center justify-center gap-2 p-4
            ${isDragging 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 bg-white'}
          `}
        >
          <div className={`p-2 rounded-full ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
            {images.length > 0 ? <Plus size={20} /> : <Upload size={24} />}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              {images.length > 0 ? "Add more images" : "Drop screenshots or wireframes"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG (Max 5 images)
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${images.length >= 5 ? 'mt-0' : ''}`}>
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-video">
              <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};