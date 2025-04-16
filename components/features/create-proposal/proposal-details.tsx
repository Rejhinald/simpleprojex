import React from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shared";
import { ProposalData } from "@/types/create-proposal";
import { ArrowRightIcon } from "lucide-react";

interface ProposalDetailsProps {
  proposal: ProposalData;
  onUpdateProposal: (proposal: ProposalData) => void;
  onNext: () => void;
}

export default function ProposalDetails({
  proposal,
  onUpdateProposal,
  onNext,
}: ProposalDetailsProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onUpdateProposal({
      ...proposal,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="h-full">
      <Card className="p-8 bg-white shadow-lg rounded-2xl border-0">
        <div className="mb-6 flex flex-col items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2 -mt-6.5">
            Proposal Details
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">📝</span>
              </TooltipTrigger>
              <TooltipContent>
                <span>📝 Enter the main information for your proposal. This will be shown to your client.</span>
              </TooltipContent>
            </Tooltip>
          </h2>
          <p className="text-base text-gray-500 font-light">Set a title, description, and client information for your proposal.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
          {/* Left: Title & Description */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Proposal Title
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🛈</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Give your proposal a clear, descriptive title. This helps you and your client identify it easily.</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                id="title"
                name="name"
                value={proposal.name || ""}
                onChange={handleChange}
                placeholder="Enter proposal title"
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
                    <span>Add details about the project, scope, or any special notes for your client.</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Textarea
                id="description"
                name="description"
                value={proposal.description || ""}
                onChange={handleChange}
                placeholder="Describe your proposal..."
                className="flex-1 min-h-[120px] w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-base focus:ring-2 focus:ring-black/10"
              />
              <div className="text-xs text-gray-400 mt-1">Explain what this proposal is for and any special notes.</div>
            </div>
          </div>
          {/* Right: Client Info */}
          <div className="flex-1 flex flex-col gap-6 items-center justify-center">
            <div className="w-full flex flex-col gap-4">
              <label htmlFor="clientName" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Client Name
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">👤</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Enter the full name of your client or company.</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                id="clientName"
                name="clientName"
                value={proposal.clientName || ""}
                onChange={handleChange}
                placeholder="Enter client name"
                className="w-full text-base p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black/10"
              />
              <label htmlFor="clientEmail" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Client Email
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">✉️</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Provide a valid email address for your client.</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                value={proposal.clientEmail || ""}
                onChange={handleChange}
                placeholder="client@example.com"
                className="w-full text-base p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black/10"
              />
              <label htmlFor="clientPhone" className="block mb-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                Client Phone
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">📞</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Enter a phone number for your client (optional).</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                id="clientPhone"
                name="clientPhone"
                value={proposal.clientPhone || ""}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className="w-full text-base p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>
        </form>
        <div className="flex justify-end mt-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" onClick={onNext} className="gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md">
                Review Variables
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Continue to set variables for this proposal</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </div>
  );
}
