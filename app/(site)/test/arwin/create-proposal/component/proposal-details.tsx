"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Button, 
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Input, Textarea, Popover, PopoverTrigger, PopoverContent,
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/shared"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TemplateItem } from "./types"

interface ProposalDetailsProps {
  useTemplate: boolean;
  selectedTemplate: number | null;
  templates: TemplateItem[];
  proposalName: string;
  proposalDescription: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  onUseTemplateChange: (value: boolean) => void;
  onTemplateSelect: (templateId: number) => void;
  onProposalNameChange: (value: string) => void;
  onProposalDescriptionChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
  onClientEmailChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
}

export function ProposalDetails({
  useTemplate,
  selectedTemplate,
  templates,
  proposalName,
  proposalDescription,
  clientName,
  clientEmail,
  clientPhone,
  onUseTemplateChange,
  onTemplateSelect,
  onProposalNameChange,
  onProposalDescriptionChange,
  onClientNameChange,
  onClientEmailChange,
  onClientPhoneChange
}: ProposalDetailsProps) {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  
  const handleCreateFromScratch = () => {
    onUseTemplateChange(false);
  }

  const handleCreateFromTemplate = () => {
    onUseTemplateChange(true);
    setTemplateDialogOpen(true);
  }

  const handleTemplateSelect = (templateId: number) => {
    onTemplateSelect(templateId);
    setTemplateDialogOpen(false);
  }

  return (
    <Accordion type="single" collapsible defaultValue="details" className="border rounded-lg shadow-sm">
      <AccordionItem value="details" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 transition-colors rounded-t-lg">
          <h3 className="text-lg">Proposal Details</h3>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm">Basic information about your proposal.</p>
              <div className="flex space-x-3">
                {useTemplate ? (
                  <Button
                    variant="outline"
                    onClick={handleCreateFromScratch}
                    className="rounded-md"
                  >
                    Create from scratch
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleCreateFromTemplate}
                    className="rounded-md"
                  >
                    Use template
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm">Template Name</label>
                <div className="flex gap-2 mt-2">
                  <Popover open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between rounded-md"
                        disabled={!useTemplate}
                      >
                        {selectedTemplate
                          ? templates.find((t) => t.id === selectedTemplate)?.title
                          : "Select template..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 rounded-md border shadow-lg">
                      <Command className="rounded-md">
                        <CommandInput placeholder="Search templates..." className="border-none focus:ring-0" />
                        <div className="max-h-[300px] overflow-auto">
                          <CommandList className="max-h-full">
                            <CommandEmpty>No template found.</CommandEmpty>
                            <CommandGroup>
                              {templates.map((template) => (
                                <CommandItem
                                  key={template.id}
                                  value={template.title}
                                  onSelect={() => handleTemplateSelect(template.id)}
                                  className="flex items-center gap-2 py-3 px-2 cursor-pointer hover:bg-secondary/50"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <Image
                                      src={template.imageUrl || "/placeholder.svg"}
                                      alt={template.title}
                                      width={60}
                                      height={45}
                                      className="rounded-md object-cover"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="truncate">{template.title}</p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {template.description.split("\n")[0]}
                                      </p>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        selectedTemplate === template.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm">Proposal Name</label>
                  <Input
                    placeholder="Enter proposal name"
                    value={proposalName}
                    onChange={(e) => onProposalNameChange(e.target.value)}
                    className="mt-2 rounded-md"
                  />
                </div>
                <div className="md:row-span-2">
                  <label className="text-sm">Proposal Description</label>
                  <Textarea
                    placeholder="Enter proposal description"
                    value={proposalDescription}
                    onChange={(e) => onProposalDescriptionChange(e.target.value)}
                    className="mt-2 h-[120px] rounded-md resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm">Client Name</label>
                  <Input
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => onClientNameChange(e.target.value)}
                    className="mt-2 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm">Client Email</label>
                  <Input
                    type="email"
                    placeholder="Enter client email"
                    value={clientEmail}
                    onChange={(e) => onClientEmailChange(e.target.value)}
                    className="mt-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm">Client Phone</label>
                  <Input
                    placeholder="Enter client phone"
                    value={clientPhone}
                    onChange={(e) => onClientPhoneChange(e.target.value)}
                    className="mt-2 rounded-md"
                  />
                </div>
              </div>

            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}