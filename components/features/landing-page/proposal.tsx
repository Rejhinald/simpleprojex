"use client"; // ✅ Ensures this runs only on the client

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";
import { Megaphone } from "lucide-react";

declare global {
  interface Window {
    loadCalendlyScript?: () => void;
  }
}

interface ProposalStressProps {
  theme: string;
  calendlyReady?: boolean;
}

const ProposalStress = ({ theme, calendlyReady }: ProposalStressProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false); // ✅ Fix for SSR hydration mismatch

  useEffect(() => {
    setIsClient(true); // ✅ Ensures video rendering happens only on the client

    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section ref={sectionRef} id="proposalStress" className="relative py-20 px-4 bg-background overflow-hidden">
      {/* Background Video - Only renders on the client */}
      {isClient && (
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://simpleprojexbucket.s3.us-west-1.amazonaws.com/media/videos/proj-des.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
      <div className="relative z-10 flex flex-col items-start max-w-3xl mx-auto">
        <Card className="bg-background/80 shadow-xl border-0 w-full">
          <CardContent className="p-10 flex flex-col items-start">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-primary/10 rounded-full p-3">
                <Megaphone className="w-8 h-8 text-primary" />
              </span>
              <CardTitle className="text-4xl md:text-6xl font-bold tracking-widest text-foreground">
                LET&apos;S TALK
              </CardTitle>
            </div>
            <CardDescription className="mb-8 text-lg md:text-xl text-muted-foreground">
              Ready to transform your proposal process? Connect with us for a personalized demo and see how Simple Projex can elevate your business.
            </CardDescription>
            <Button
              size="lg"
              className="bg-[#e6a310] text-black hover:bg-[#203a53] hover:text-white font-bold uppercase tracking-wider shadow-lg rounded-full"
              onClick={openCalendlyPopup}
              disabled={calendlyReady === false}
            >
              {calendlyReady === false ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full border-2 border-t-2 border-gray-200 h-5 w-5"></span>Loading…</span>
              ) : (
                "Schedule a Demo Now!"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProposalStress;
