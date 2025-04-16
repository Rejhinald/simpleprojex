"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea, Card, Tooltip, TooltipTrigger, TooltipContent } from "@/components/shared";
import { Template, TemplateDetailsProps } from "@/types/templates";

export default function TemplateDetails({
  template,
  onUpdateTemplate,
  onNext,
}: TemplateDetailsProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    setName(template.name);
    setDescription(template.description);
  }, [template]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    onUpdateTemplate({
      ...template,
    });

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSave = () => {
    onUpdateTemplate({
      ...template,
      name,
      description,
    });
    onNext();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onUpdateTemplate({
      ...template,
      name: newName,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onUpdateTemplate({
      ...template,
      description: newDescription,
    });
  };

  return (
    <div className="h-full">
      <Card className="p-8 bg-white shadow-lg rounded-2xl border-0">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center tracking-tight flex items-center justify-center gap-2">
          Template Details
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🛈</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>📝 Give your template a clear, descriptive name. This helps you and your team find it later!</span>
            </TooltipContent>
          </Tooltip>
        </h2>
        <div className="mb-6 text-center">
          <p className="text-base text-gray-500 font-light">Set a name, description, and image for your template.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left: Title & Description */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Template Title
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🛈</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>📝 Give your template a clear, descriptive name. This helps you and your team find it later!</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                id="title"
                value={name}
                onChange={handleTitleChange}
                placeholder="Enter template title"
                className="w-full text-base p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Description
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">💡</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>✏️ Add details about what this template is for, special notes, or instructions for your team.</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Describe your template..."
                className="flex-1 min-h-[120px] w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-base focus:ring-2 focus:ring-black/10"
              />
              <div className="text-xs text-gray-400 mt-1">Explain what this template is for and any special notes.</div>
            </div>
          </div>
          {/* Right: Image Upload */}
          <div className="flex-1 flex flex-col gap-4 items-center justify-center">
            <label htmlFor="templateImage" className="block mb-2 text-sm font-medium text-gray-800 w-full text-center flex items-center justify-center gap-1">
              Template Image
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🖼️</span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>📷 Upload an image to visually represent your template. This makes it easier to recognize in lists!</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <div className="w-full flex flex-col items-center gap-4">
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-200 text-4xl">🖼️</span>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="w-full rounded-xl text-base font-semibold border-gray-200 bg-gray-50 hover:bg-gray-100"
              >
                {selectedFile ? "Change Image" : "Upload Image"}
              </Button>
              <span className="text-xs text-gray-400 text-center w-full">
                {selectedFile ? selectedFile.name : "JPG, PNG, or GIF. Max 5MB."}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-10">
          <Button onClick={handleSave} className="px-6 py-3 rounded-xl text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md">
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
