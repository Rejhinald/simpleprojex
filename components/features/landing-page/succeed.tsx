import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";
import { BadgeCheck, TrendingUp, HardHat } from "lucide-react";

declare global {
  interface Window {
    loadCalendlyScript?: () => void;
  }
}

interface SucceedProps {
  theme: string;
  showLogin: boolean;
  calendlyReady: boolean;
}

const succeedCards = [
  {
    img: "/experts.png",
    text: "Built by Experts who understand your challenges",
    icon: <BadgeCheck className="w-8 h-8 text-primary" />,
  },
  {
    img: "/efficiency.png",
    text: "Proven to Increase Efficiency",
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
  },
  {
    img: "/contractors.png",
    text: "Designed by General Contractors",
    icon: <HardHat className="w-8 h-8 text-primary" />,
  },
];

const Succeed = ({ theme, showLogin, calendlyReady }: SucceedProps) => {
  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section className="relative py-16 px-5 bg-background">
      <motion.div
        className="text-center md:ml-12 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <CardTitle className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
          We’re Here to Help You Succeed
        </CardTitle>
        <CardDescription className="text-lg md:text-xl text-muted-foreground">
          Transform how you create proposals with unmatched efficiency.
        </CardDescription>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {succeedCards.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <Card className="relative h-[420px] flex flex-col overflow-hidden group hover:scale-105 transition-transform duration-500">
              <div className="relative w-full h-[220px]">
                <Image
                  src={item.img}
                  alt={item.text}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 bg-background/80 rounded-full p-2 shadow-lg">
                  {item.icon}
                </div>
              </div>
              <CardContent className="flex-1 flex flex-col justify-end p-6 z-20">
                <CardTitle className="text-foreground text-xl font-bold mb-2 drop-shadow-lg">
                  {item.text}
                </CardTitle>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <Button
          size="lg"
          className="bg-[#e6a310] text-black hover:bg-[#203a53] hover:text-white font-bold uppercase tracking-wider shadow-lg rounded-full"
          onClick={openCalendlyPopup}
          disabled={!calendlyReady}
        >
          {calendlyReady ? "Schedule a Demo" : <span className="flex items-center gap-2"><span className="animate-spin rounded-full border-2 border-t-2 border-gray-200 h-5 w-5"></span>Loading…</span>}
        </Button>
      </motion.div>
    </section>
  );
};

export default Succeed;
