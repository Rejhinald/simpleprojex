"use client";

import React, { useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared";

type CreateProposalTourProps = {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function CreateProposalTour({
  isRunning,
  setIsRunning,
  activeTab,
  setActiveTab,
}: CreateProposalTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [key, setKey] = useState(0); // Used to force re-render of Joyride
  const joyrideRef = useRef<any>(null);

  const endTour = () => {
    localStorage.setItem("hasSeenCreateTemplateTour", "true");
    setIsRunning(false);
    setStepIndex(0);
  };

  const handleStartCreating = () => {
    setActiveTab("template");
    endTour();
  };

  const isClient = typeof window !== "undefined";

  // Reset the tour when isRunning changes to ensure a clean start
  useEffect(() => {
    if (isRunning) {
      setStepIndex(0);
      setActiveTab("template");
      setKey((prevKey) => prevKey + 1); // Force re-render of Joyride
    }
  }, [isRunning, setActiveTab]);

  // This useEffect updates the active tab based on step index
  // AND ensures we only increment the step index after the tab content is visible
  useEffect(() => {
    if (!isRunning) return;

    const tabsForSteps = {
      1: "template",
      2: "details",
      3: "variables",
      4: "costs",
      5: "preview",
    };

    const currentTabForStep =
      tabsForSteps[stepIndex as keyof typeof tabsForSteps];

    if (currentTabForStep && currentTabForStep !== activeTab) {
      setActiveTab(currentTabForStep);
    }
  }, [stepIndex, isRunning, setActiveTab, activeTab]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">
            Welcome to Proposal Creation! 🎨
          </h1>
          <p className="mb-3">
            🚀 This is where you'll create professional proposals for your
            clients.
          </p>
          <p className="mb-3">
            📝 We'll guide you through each step of the proposal creation
            process.
          </p>
          <p>⚡ Let's get started and build something amazing together!</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">Select a Template 📋</h1>
          <p className="mb-3">
            🔍 Start by choosing a template for your proposal.
          </p>
          <p className="mb-3">
            ✏️ Templates provide a solid foundation for your proposals.
          </p>
          <p>🖼️ Select one that best matches your project requirements.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">Proposal Details 📝</h1>
          <p className="mb-3">
            🔍 Fill in the basic information about your proposal.
          </p>
          <p className="mb-3">
            🖍️ You can also use this to create your template from scratch.
          </p>
          <p>
            🖼️ Make sure to include all the necessary information for your
            client.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">Variables & Parameters 🔄</h1>
          <p className="mb-3">
            🧩 Set values for the variables defined in your template.
          </p>
          <p className="mb-3">
            💡 This is where you input your variable value.
          </p>
          <p>
            ⚙️ Adjust the values based on your specific project requirements.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">Cost Calculation 💰</h1>
          <p className="mb-3">
            🧮 Review and adjust the costs for your proposal.
          </p>
          <p className="mb-3">
            📊 Make sure all costs are accurately calculated and accounted for.
          </p>
          <p>
            💼 These costs will be presented to your client in the final
            proposal.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">Proposal Preview 👁️</h1>
          <p className="mb-3">
            👀 Review how your proposal will look when presented to your client.
          </p>
          <p className="mb-3">
            ✅ Make sure everything is correct before sending.
          </p>
          <p>
            🚀 Once satisfied, save your proposal and share it with your client!
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
    {
      target: "body",
      content: (
        <div className="max-w-screen-sm w-full px-2">
          <p className="font-bold text-xl mb-2">You're All Set! 🎉🎆</p>
          <p className="mb-3">
            ✅ You now know how to create professional proposals for your
            clients.
          </p>
          <p className="mb-3">
            💼 Follow these steps each time to ensure your proposals are
            complete and professional.
          </p>
          <p className="mb-5">
            🧭 Need a refresher later? You can always view this tour again from
            the help menu.
          </p>
          <p className="mt-3 mb-4 font-bold">Happy proposing! 📝✨💍</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                endTour();
                router.push("/proposals");
              }}
              className="px-4"
            >
              🗃️ Go to Proposals
            </Button>
            <Button onClick={handleStartCreating} className="px-4">
              Start Creating 🚀😎
            </Button>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      hideFooter: true,
      floaterProps: {
        placement: "center",
        style: { maxWidth: '100vw', minWidth: 0, width: '100%', padding: 0 },
      },
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    // Handle tour completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("hasSeenCreateTemplateTour", "true");
      setIsRunning(false);
      setStepIndex(0);
      return;
    }

    // Handle step changes
    if (type === "step:after" && action === "next") {
      // Get the next step index
      const nextIndex = index + 1;

      // Set the step index - this will trigger the useEffect to change tabs
      setStepIndex(nextIndex);
    } else if (type === "step:after" && action === "prev") {
      // Handle going back
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        setStepIndex(prevIndex);
      }
    }
  };

  return (
    isClient && (
      <Joyride
        steps={steps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        spotlightClicks
        callback={handleJoyrideCallback}
        stepIndex={stepIndex}
        styles={{
          options: {
            primaryColor: "black",
            zIndex: 1000,
            arrowColor: "#fff",
            backgroundColor: "#fff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            textColor: "#333",
          },
          spotlight: {
            borderRadius: 15,
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
          },
          tooltip: {
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          },
          buttonNext: {
            backgroundColor: "black",
          },
          buttonBack: {
            color: "#333",
          },
        }}
        floaterProps={{
          // disableAnimation: false, // Removed: not a valid prop in v3
        }}
        disableCloseOnEsc={false}
        disableOverlayClose={false}
        disableScrolling={true}
        disableScrollParentFix={true}
        key={key}
      />
    )
  );
}
