import React from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
} from "@/components/shared";
import { ProposalData } from "@/types/proposals";
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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">Set Project Details</h3>
        <p className="text-sm text-muted-foreground">
          Define the project details to create a comprehensive proposal.
        </p>
      </div>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold mt-4">Proposal Information</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter proposal title"
                    value={proposal.title || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Proposal Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter detailed proposal description"
                    value={proposal.description || ""}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-bold mt-4">Client Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="Enter client name"
                  value={proposal.clientName || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                    value={proposal.clientEmail || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    placeholder="(123) 456-7890"
                    value={proposal.clientPhone || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            onNext();
          }}
          className="gap-2"
        >
          Review Variables
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
