"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  Loader2,
  Save,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { proposalApi, Proposal } from "@/app/api/apiService";
import { formatDate, fadeIn } from "@/app/templates/utils/template-utils";
import { GenerateContractDialog } from "./GenerateContractDialog";

// Animation variants
const slideUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const financialCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    transition: { 
      delay: custom * 0.1,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  })
};

interface ProposalHeaderProps {
  proposal: Proposal;
  isLoading: boolean;
  isSyncing: boolean;
  onSync: () => Promise<void>;
  onRefresh: () => Promise<void>;
  templateName?: string;
  totalMaterial: number;
  totalLabor: number;
  totalBeforeMarkup: number;
  totalAfterMarkup: number;
}

export function ProposalHeader({
  proposal,
  isLoading,
  isSyncing,
  onSync,
  onRefresh,
  templateName,
  totalMaterial,
  totalLabor,
  totalBeforeMarkup,
  totalAfterMarkup,
}: ProposalHeaderProps) {
  const router = useRouter();
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: proposal.name,
    global_markup_percentage: parseFloat(proposal.global_markup_percentage),
  });

  const handleUpdateProposal = async () => {
    try {
      setIsSubmitting(true);
      await proposalApi.update(proposal.id, {
        name: formData.name,
        global_markup_percentage: formData.global_markup_percentage,
      });
      toast.success("Proposal updated successfully");
      setIsEditingProposal(false);
      onRefresh();
    } catch (error) {
      toast.error(
        `Failed to update proposal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProposal = async () => {
    try {
      setIsSubmitting(true);
      await proposalApi.delete(proposal.id);
      toast.success("Proposal deleted successfully");
      router.push("/proposals");
    } catch (error) {
      toast.error(
        `Failed to delete proposal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <motion.div 
        className="flex items-center justify-between mb-6"
        variants={slideUpItem}
        initial="hidden"
        animate="visible"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/proposals")}
          className="flex items-center gap-1 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Button>

        <div className="flex items-center gap-2">
          <GenerateContractDialog 
            proposal={proposal} 
            onContractGenerated={onRefresh} 
          />
          
          {proposal.template_id && (
            <Button
              variant="outline"
              onClick={() => onSync()}
              className="gap-1"
              disabled={isSyncing || isLoading}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isSyncing ? "Syncing..." : "Sync with Template"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsEditingProposal(true)}
            className="gap-1"
          >
            <Edit2 className="h-4 w-4" />
            Edit Proposal
          </Button>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="bg-card rounded-lg border shadow-sm p-6"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <motion.div 
            className="flex-1"
            variants={slideUpItem}
          >
            <h1 className="text-2xl font-bold text-foreground">
              {proposal.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Created {proposal.created_at ? formatDate(proposal.created_at) : ""}
              </div>
              
              {proposal.template_id && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  Template: {templateName || `#${proposal.template_id}`}
                </Badge>
              )}
              
              <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                Markup: {proposal.global_markup_percentage}%
              </Badge>
            </div>
          </motion.div>

          <motion.div 
            className="w-full lg:w-auto flex-shrink-0"
            variants={slideUpItem}
          >
            <div className="grid grid-cols-4 gap-3">
              <motion.div
                custom={0}
                variants={financialCardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-3 rounded-md flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md"
              >
                <DollarSign className="h-4 w-4 text-blue-500 mb-1" />
                <div className="text-sm text-muted-foreground font-medium">Material</div>
                <div className="text-lg font-bold text-foreground">
                  ${totalMaterial.toFixed(2)}
                </div>
              </motion.div>
              
              <motion.div
                custom={1}
                variants={financialCardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 p-3 rounded-md flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md"
              >
                <DollarSign className="h-4 w-4 text-purple-500 mb-1" />
                <div className="text-sm text-muted-foreground font-medium">Labor</div>
                <div className="text-lg font-bold text-foreground">
                  ${totalLabor.toFixed(2)}
                </div>
              </motion.div>
              
              <motion.div
                custom={2}
                variants={financialCardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3 rounded-md flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md"
              >
                <DollarSign className="h-4 w-4 text-amber-500 mb-1" />
                <div className="text-sm text-muted-foreground font-medium">Subtotal</div>
                <div className="text-lg font-bold text-foreground">
                  ${totalBeforeMarkup.toFixed(2)}
                </div>
              </motion.div>
              
              <motion.div
                custom={3}
                variants={financialCardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-3 rounded-md flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md"
              >
                <DollarSign className="h-4 w-4 text-emerald-500 mb-1" />
                <div className="text-sm text-muted-foreground font-medium">Total</div>
                <div className="text-lg font-bold text-foreground">
                  ${totalAfterMarkup.toFixed(2)}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Proposal Dialog */}
      <Dialog open={isEditingProposal} onOpenChange={setIsEditingProposal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
            <DialogDescription>
              Update the basic details of your proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Proposal Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter proposal name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="markup" className="text-sm font-medium">
                Global Markup Percentage
              </Label>
              <Input
                id="markup"
                type="number"
                value={formData.global_markup_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    global_markup_percentage: parseFloat(e.target.value),
                  })
                }
                placeholder="Enter global markup percentage"
                className="col-span-3"
                min="0"
                max="100"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditingProposal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProposal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteProposal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}