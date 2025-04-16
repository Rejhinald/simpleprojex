"use client";

import { Button } from "@/components/shared";
import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useRouter } from "next/navigation";

type TemplateTourProps = {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
};

export function TemplateTour({ isRunning, setIsRunning }: TemplateTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [key, setKey] = useState(0); // Used to force re-render of Joyride
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const endTour = () => {
    localStorage.setItem("hasSeenTemplatesTour", "true");
    setIsRunning(false);
    setStepIndex(0);
  };

  const redirectToCreateTemplate = () => {
    localStorage.setItem("hasSeenTemplatesTour", "true");
    setIsRunning(false);
    setStepIndex(0);
    router.push("/templates/create");
  };

  // Reset the tour when isRunning changes to ensure a clean start
  useEffect(() => {
    if (isRunning) {
      setStepIndex(0);
      setKey((prevKey) => prevKey + 1); // Force re-render of Joyride
    }
  }, [isRunning]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold mb-2">
            Welcome to your Template Dashboard!👋
          </h1>
          <p className="mb-3">
            📂 This is your central hub to view, organize, and manage all your
            templates with ease.
          </p>
          <p className="mb-3">
            🧭 Here, you can create new templates, search for existing ones, and
            sort them by various criteria.
          </p>
          <p>
            🚀 Let's take a quick tour to help you explore all the awesome
            features and get started smoothly!
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
    },
    {
      target: "#new-template",
      content: (
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold mb-2">Create a New Template! 📝</h1>
          <p className="mb-3">
            ✍️ Ready to streamline your workflow? Click here to create a brand
            new template.
          </p>
          <p className="mb-3">
            📄 Customize it to fit your specific project needs.
          </p>
          <p>🚀 Let's get started on crafting the perfect template!</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "#content",
      content: (
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold mb-2">
            Quick Glance, Big Picture 🧾✨
          </h1>
          <p className="mb-3">
            📋 You'll see key details of each template, all in one place.
          </p>
          <p>
            ⚡ It's the perfect way to quickly browse through your templates and
            stay organized!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div>
          <p className="font-bold text-xl mb-2">That's a Wrap!🎉</p>
          <p className="mb-3">
            ✅ You're now all set to start managing your templates like a pro.
          </p>
          <p className="mb-3">
            🤔 Got questions? Don't worry — our support team is just a click
            away and happy to help!
          </p>
          <p className="mb-5">
            🧭 Need a refresher later? You can always view this tour again by
            clicking the <b>'Tour Guide'</b> button at the bottom right.
          </p>
          <p className="mt-3 mb-4 font-bold">
            Happy templating and good luck on your projects!💼✨
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={endTour} className="px-4">
              👋 End Tour
            </Button>
            <Button onClick={redirectToCreateTemplate} className="px-4">
              Create First Template 😎
            </Button>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      hideCloseButton: true,
      hideFooter: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("hasSeenTemplatesTour", "true");
      setIsRunning(false);
      setStepIndex(0);
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
  );
}
