"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, PenTool, FileImage, Fingerprint } from "lucide-react";
import { Button } from "@/components/shared/button/button";
import { Input } from "@/components/shared/input/input";
import { cn } from "@/lib/utils";

interface SignatureContent {
  label: string;
  imageData?: string;
  initials?: string;
  signatureType: 'image' | 'initials';
}

interface SignatureElementProps {
  content: SignatureContent;
  onChange: (content: SignatureContent) => void;
  isPrintPreview?: boolean;
}

export const SignatureElement = ({ 
  content, 
  onChange,
  isPrintPreview = false
}: SignatureElementProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [signatureType, setSignatureType] = useState<'image' | 'initials'>('image');
  const [initialsValue, setInitialsValue] = useState(content.initials || '');
  const [labelValue, setLabelValue] = useState(content.label || 'Signature');
  const [imageData, setImageData] = useState(content.imageData);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Don't update the signatureType from content to keep our default
    setInitialsValue(content.initials || '');
    setLabelValue(content.label || 'Signature');
    setImageData(content.imageData);
  }, [content]);

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const initials = e.target.value.toUpperCase().slice(0, 3);
    setInitialsValue(initials);
    onChange({
      ...content,
      label: labelValue,
      initials,
      signatureType: 'initials',
      imageData: undefined
    });
  };

  const handleSignatureTypeChange = (type: 'image' | 'initials') => {
    setSignatureType(type);
    if (type === 'initials') {
      setTimeout(() => initialsInputRef.current?.focus(), 100);
      onChange({
        ...content,
        label: labelValue,
        signatureType: type,
        initials: initialsValue,
        imageData: undefined
      });
    } else {
      onChange({
        ...content,
        label: labelValue,
        signatureType: type,
        initials: undefined,
        imageData
      });
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.match('image.*')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImageData = e.target?.result as string;
      setImageData(newImageData);
      localStorage.setItem('savedSignature', newImageData);
      onChange({
        ...content,
        label: labelValue,
        signatureType: 'image',
        imageData: newImageData,
        initials: undefined
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const clearSignature = () => {
    setImageData(undefined);
    localStorage.removeItem('savedSignature');
    onChange({
      ...content,
      label: labelValue,
      imageData: undefined
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabelValue(newLabel);
    onChange({
      ...content,
      label: newLabel
    });
  };

  useEffect(() => {
    const savedSignature = localStorage.getItem('savedSignature');
    if (savedSignature && !content.imageData && signatureType === 'image') {
      setImageData(savedSignature);
      onChange({
        ...content,
        label: labelValue,
        imageData: savedSignature,
        signatureType: 'image'
      });
    }
  }, []);

  const containerClasses = cn(
    "relative w-[300px] mx-auto",
    isPrintPreview ? "h-[80px]" : "h-[160px]"
  );

  const signatureAreaClasses = cn(
    "w-full h-full flex items-center justify-center",
    !isPrintPreview && "border rounded-lg"
  );

  return (
    <div className={containerClasses}>
      {!isPrintPreview && (
        <div className="absolute top-0 left-0 right-0 flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <PenTool size={16} className="text-blue-500 flex-shrink-0" />
            <Input 
              type="text"
              value={labelValue}
              onChange={handleLabelChange}
              className="h-7 py-0 px-1 text-sm font-medium border-b border-transparent bg-transparent focus-visible:border-blue-500 focus-visible:ring-0"
              placeholder="Signature label"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant={signatureType === 'image' ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleSignatureTypeChange('image')}
              className="text-xs rounded-full h-7"
            >
              <FileImage className="h-3.5 w-3.5 mr-1" />
              Upload Image
            </Button>
            <Button
              variant={signatureType === 'initials' ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleSignatureTypeChange('initials')}
              className="text-xs rounded-full h-7"
            >
              <Fingerprint className="h-3.5 w-3.5 mr-1" />
              Use Initials
            </Button>
          </div>
        </div>
      )}

      <div className={cn(
        "absolute",
        isPrintPreview ? "inset-0" : "bottom-0 left-0 right-0 h-[80px]"
      )}>
        {signatureType === 'initials' ? (
          <div className={signatureAreaClasses}>
            {isPrintPreview ? (
              <span className="text-3xl font-bold italic text-blue-600">
                {initialsValue}
              </span>
            ) : (
              <input
                ref={initialsInputRef}
                type="text"
                value={initialsValue}
                onChange={handleInitialsChange}
                placeholder="ABC"
                maxLength={3}
                className="text-center text-2xl font-bold italic w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-blue-600 h-12 placeholder:text-gray-300"
                aria-label="Enter your initials"
                autoComplete="off"
              />
            )}
          </div>
        ) : (
          <div className={signatureAreaClasses}>
            {imageData ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <img 
                  src={imageData} 
                  alt="Signature" 
                  className="max-w-[90%] max-h-[70px] object-contain"
                />
                {!isPrintPreview && (
                  <Button
                    onClick={clearSignature}
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove signature"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            ) : !isPrintPreview && (
              <div 
                className={cn(
                  "w-full h-full flex items-center justify-center p-2 border-2 border-dashed rounded-md transition-colors cursor-pointer",
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                )}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInputChange}
                />
                
                <div className="flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Drop signature image</p>
                    <p className="text-xs text-gray-400">PNG with transparency</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};