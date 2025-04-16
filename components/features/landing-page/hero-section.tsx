"use client";
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeroSectionProps {
  theme: string;
}

function HeroSection({ theme }: HeroSectionProps) {
  const router = useRouter();

  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background Image + Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/Home-picture.png"
          alt="Home background"
          fill
          priority
          className="object-cover object-center w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/30" />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key="main-content"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.5 }}
          className="relative z-10 w-full max-w-3xl mx-auto px-4"
        >
          <Card className="bg-transparent shadow-none border-0">
            <CardContent className="p-0 flex flex-col items-start">
              <CardTitle className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-xl text-white">
                Are you tired of slow and <br /> inaccurate construction proposals?
              </CardTitle>
              <CardDescription className="text-xl md:text-2xl mb-8 drop-shadow-lg text-white/90">
                Proposals done in minutes, higher accuracy, and increased profitability.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button 
                  size="lg" 
                  className="bg-[#e6a310] text-black hover:bg-[#203a53] hover:text-white font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg rounded-full" 
                  onClick={openCalendlyPopup}
                >
                  Schedule a Demo <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white hover:text-black font-bold uppercase tracking-wider shadow-lg rounded-full" 
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default HeroSection;
