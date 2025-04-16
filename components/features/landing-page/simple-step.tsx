import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";
import { Calendar, UserPlus, Settings } from "lucide-react";

declare global {
  interface Window {
    loadCalendlyScript?: () => void;
  }
}

interface SimpleStepsProps {
  theme: string;
  showLogin: boolean;
  calendlyReady: boolean;
}

const SimpleSteps = ({ theme, showLogin, calendlyReady }: SimpleStepsProps) => {
  const images = ["/demo.jpg", "/login.jpg"];
  const [isFirstImageFront, setIsFirstImageFront] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFirstImageFront((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-16 px-8 gap-10 bg-background">
      {/* Left: Crossfade Image Card */}
      <Card className="relative w-full md:w-1/2 h-[400px] md:h-[600px] overflow-hidden shadow-xl">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={isFirstImageFront ? images[0] : images[1]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={isFirstImageFront ? images[0] : images[1]}
                alt="Demo Step"
                fill
                className="object-cover rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
      {/* Right: Steps Card */}
      <Card className="w-full md:w-1/2 flex flex-col justify-center items-start bg-background/80 shadow-xl">
        <CardContent className="p-8">
          <CardTitle className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            3 Simple Steps to Success
          </CardTitle>
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <span className="bg-primary/10 rounded-full p-3">
                <Calendar className="w-7 h-7 text-primary" />
              </span>
              <div>
                <span className="text-lg font-semibold text-foreground">Schedule Your Demo</span>
                <CardDescription className="text-muted-foreground">Book a time that works for you.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-primary/10 rounded-full p-3">
                <UserPlus className="w-7 h-7 text-primary" />
              </span>
              <div>
                <span className="text-lg font-semibold text-foreground">Set Up Your Account</span>
                <CardDescription className="text-muted-foreground">Get started in minutes with guided onboarding.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-primary/10 rounded-full p-3">
                <Settings className="w-7 h-7 text-primary" />
              </span>
              <div>
                <span className="text-lg font-semibold text-foreground">Streamline Your Proposals</span>
                <CardDescription className="text-muted-foreground">Automate and optimize your workflow.</CardDescription>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-[#e6a310] text-black hover:bg-[#203a53] hover:text-white font-bold uppercase tracking-wider shadow-lg rounded-full"
            onClick={openCalendlyPopup}
            disabled={!calendlyReady}
          >
            {calendlyReady ? "Schedule a Demo" : <span className="flex items-center gap-2"><span className="animate-spin rounded-full border-2 border-t-2 border-gray-200 h-5 w-5"></span>Loading…</span>}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default SimpleSteps;
