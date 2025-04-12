"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea, Card } from "@/components/shared";
import { Template, TemplateDetailsProps } from "@/types/templates";

export default function TemplateDetails({
  template,
  onUpdateTemplate,
  onNext,
}: TemplateDetailsProps) {
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState(template.description);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Sync with template prop changes and handle image preview
  useEffect(() => {
    setTitle(template.title);
    setDescription(template.description);

    // Handle image preview for both File objects and string URLs
    if (template.image) {
      if (typeof template.image === "string") {
        setPreviewUrl(template.image);
      } else if (template.image instanceof File) {
        setSelectedFile(template.image);
        const objectUrl = URL.createObjectURL(template.image);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [template]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Update the parent component with the file
    onUpdateTemplate({
      ...template,
      image: file,
    });

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSave = () => {
    // Save all current values to parent
    onUpdateTemplate({
      ...template,
      title,
      description,
      image: selectedFile || template.image, // Keep existing image if no new file selected
    });
    onNext();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Update parent component
    onUpdateTemplate({
      ...template,
      title: newTitle,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    // Update parent component
    onUpdateTemplate({
      ...template,
      description: newDescription,
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Template Details</h2>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label htmlFor="title" className="block mb-2 font-medium">
              Template Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter template title"
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="templateImage" className="block mb-2 font-medium">
              Template Image
            </label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="w-full md:w-auto"
                >
                  Choose File
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "No file selected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter template description"
            className="min-h-[120px] w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-[120px]">
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
