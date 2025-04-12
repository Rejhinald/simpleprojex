"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProposalById } from "@/hooks/api/proposals/get-proposal-by-id";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Separator,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/shared";
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  FileText,
  File,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProposalDetailTab from "@/components/ui/proposals/proposal-detail/proposal-detail-tab";
import ContractDetailTab from "@/components/ui/proposals/proposal-detail/contract-detail-tab";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "contract" ? "contract" : "proposal"
  );
  const { proposal, isLoading, error } = getProposalById(id);
  console.log(proposal);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/proposals/${id}?tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    if (proposal) {
      let sum = 0;

      if (proposal.project_elements && proposal.project_elements.length > 0) {
        sum = proposal.project_elements.reduce(
          (acc, element) => acc + (element.total || 0),
          0
        );
      }
      setTotalAmount(sum);
    }
  }, [proposal]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-500">
                Error Loading Proposal
              </h2>
              <p>{error}</p>
              <Button asChild variant="outline">
                <Link href="/proposals">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Proposals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Proposal Not Found</h2>
              <p>
                The proposal you're looking for doesn't exist or has been
                removed.
              </p>
              <Button asChild variant="outline">
                <Link href="/proposals">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Proposals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="relative w-full h-[300px] mt-6 mb-6 overflow-hidden rounded-xl">
          <Image
            src={proposal.image || "/placeholder-image.jpg"}
            alt={proposal.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-8 pb-20">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-bold tracking-tight">
                    {proposal.name}
                  </h1>
                  <Badge variant="outline" className="ml-2">
                    {new Date(proposal.created_at) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ? "New"
                      : "Active"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
                  <span>
                    Created on{" "}
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Client: {proposal.client_name}</span>
                </div>
              </div>
              <div className="flex justify-start mb-6">
                <TabsList className="w-fit">
                  <TabsTrigger value="proposal">
                    <FileText className="h-4 w-4 mr-1" />
                    Proposal Details
                  </TabsTrigger>
                  <TabsTrigger value="contract">
                    <File className="h-4 w-4 mr-1" />
                    Contract Details
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator className="mb-2" />

            <TabsContent value="proposal">
              <ProposalDetailTab
                proposal={proposal}
                totalAmount={totalAmount}
              />
            </TabsContent>
            <TabsContent value="contract">
              <ContractDetailTab
                proposal={proposal}
                totalAmount={totalAmount}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
