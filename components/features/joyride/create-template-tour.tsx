"use client";

import React, { useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared";

type CreateTemplateTourProps = {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function CreateTemplateTour({
  isRunning,
  setIsRunning,
  activeTab,
  setActiveTab,
}: CreateTemplateTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [key, setKey] = useState(0); // Used to force re-render of Joyride
  const joyrideRef = useRef<any>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const endTour = () => {
    localStorage.setItem("hasSeenCreateTemplateTour", "true");
    setIsRunning(false);
    setStepIndex(0);
  };

  // Reset the tour when isRunning changes to ensure a clean start
  useEffect(() => {
    if (isRunning) {
      setStepIndex(0);
      setActiveTab("details");
      setKey((prevKey) => prevKey + 1); // Force re-render of Joyride
    }
  }, [isRunning, setActiveTab]);

  // The key fix: This useEffect updates the active tab based on step index
  // AND ensures we only increment the step index after the tab content is visible
  useEffect(() => {
    if (!isRunning) return;

    const tabsForSteps = {
      1: "details",
      2: "parameters",
      3: "categories",
      4: "preview",
    };

    const currentTabForStep =
      tabsForSteps[stepIndex as keyof typeof tabsForSteps];

    if (currentTabForStep && currentTabForStep !== activeTab) {
      setActiveTab(currentTabForStep);
    }
  }, [stepIndex, isRunning, setActiveTab, activeTab]);

  // Helper: force Joyride to recalculate position after each step
  useEffect(() => {
    if (!hasMounted) return;
    setTimeout(() => {
      if (joyrideRef.current && joyrideRef.current.helpers) {
        // @ts-ignore
        joyrideRef.current.helpers.forceUpdate();
      }
    }, 100); // Wait for DOM update
  }, [stepIndex, activeTab, hasMounted]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center max-w-screen-sm w-full px-2">
          <h1 className="text-xl font-bold mb-2">
            Welcome to Template Creation! 🎨
          </h1>
          <p className="mb-3">
            🚀 This is where you'll create professional, reusable templates for your proposals.
          </p>
          <p className="mb-3">
            📝 We'll guide you through each step of the template creation process.
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
          <h1 className="text-xl font-bold mb-2">Template Details 📋</h1>
          <p className="mb-3">
            🔍 Start by providing basic information about your template.
          </p>
          <p className="mb-3">
            ✏️ Add a clear name and description to help others understand what your template is for.
          </p>
          <p>🖼️ You can also upload an image to make your template more visually appealing.</p>
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
          <h1 className="text-xl font-bold mb-2">Template Variables 🔄</h1>
          <p className="mb-3">🧩 Variables make your templates dynamic and reusable.</p>
          <p className="mb-3">💡 Define parameters that can be customized for each proposal.</p>
          <p>⚙️ Examples include Area, Width, Length, etc.</p>
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
          <h1 className="text-xl font-bold mb-2">Template Categories 🏗️</h1>
          <p className="mb-3">🧱 Think of categories as major parts of your project — like "Wall Framing" or "Electrical Work".</p>
          <p className="mb-3">🧩 Each category contains smaller tasks or elements that need to be completed to finish that section.</p>
          <p>✅ Once all the elements under a category are done, that whole section is considered complete! YAY!</p>
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
          <h1 className="text-xl font-bold mb-2">Template Preview 👁️</h1>
          <p className="mb-3">👀 Review how your template will look when used in proposals.</p>
          <p className="mb-3">✅ Make sure everything is correct before saving.</p>
          <p>🚀 Once satisfied, save your template and start using it right away!</p>
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
          <p className="font-bold text-xl mb-2">You're All Set! 🎉</p>
          <p className="mb-3">✅ You now know how to create powerful, reusable templates.</p>
          <p className="mb-3">💼 Templates will save you time and ensure consistency across all your proposals.</p>
          <p className="mb-5">🧭 Need a refresher later? You can always view this tour again from the help menu.</p>
          <p className="mt-3 mb-4 font-bold">Happy templating! 🏗️✨😏</p>
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
            <Button onClick={() => {
              setActiveTab("details");
              endTour();
            }} className="px-4">
              Start Creating 🧨
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

  if (!hasMounted) return null;

  return (
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
        // disableAnimation: false,
      }}
      disableCloseOnEsc={false}
      disableOverlayClose={false}
      disableScrolling={true}
      disableScrollParentFix={true}
      key={key}
    />
  );
}
