import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared";

declare global {
  interface Window {
    loadCalendlyScript?: () => void;
  }
}

interface TimeSavingProps {
  theme: string;
  calendlyReady: boolean;
}

const cardItems = [
  { img: "/winbids.png", text: "Achieve 5x more accuracy to win bids." },
  { img: "/faster.png", text: "Create proposals 10x faster with our simple tool." },
  { img: "/projects.jpg", text: "Spend more time on projects, not paperwork." },
  { img: "/competitive.jpg", text: "Stay competitive in a rapidly evolving market." },
];

const TimeSaving = ({ theme, calendlyReady }: TimeSavingProps) => {
  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section
      className={`relative py-16 px-5 font-sans ${
        theme === "dark" ? "bg-[#191919] text-white" : "bg-white text-[#191919]"
      }`}
    >
      {/* Main Section */}
      <div className="text-center md:ml-12 mb-5 mt-10">
        <motion.h1
          className={`text-6xl font-bold ${
            theme === "dark" ? "text-[#f6b800]" : "text-[#e6a310]"
          } mb-4 tracking-wide`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Time-Saving Solution
        </motion.h1>
        <motion.p
          className={`text-2xl tracking-widest ${
            theme === "dark" ? "text-white" : "text-[#203a53]"
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Transform how you create proposals with unmatched efficiency.
        </motion.p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 tracking-widest">
        {cardItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative h-[550px] overflow-hidden group hover:scale-105 transition-transform duration-500 p-0">
              <Image
                src={item.img}
                alt={item.text}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
                priority={index < 2}
                loading={index < 2 ? undefined : "lazy"}
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
              <CardContent className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end p-6">
                <CardTitle className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                  {item.text}
                </CardTitle>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="text-center flex justify-center items-center mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <button
          onClick={openCalendlyPopup}
          className={`bg-[#e6a310] ${
            theme === "dark"
              ? "text-black hover:bg-[#203a53] hover:text-white"
              : "text-[#191919] hover:bg-[#203a53] hover:text-white"
          } px-8 font-sans tracking-wider py-3 text-lg font-semibold uppercase transition duration-300 rounded-full shadow-lg`}
          disabled={!calendlyReady}
        >
          {calendlyReady ? "Schedule a Demo" : <span className="flex items-center gap-2"><span className="animate-spin rounded-full border-2 border-t-2 border-gray-200 h-5 w-5"></span>Loading…</span>}
        </button>
      </motion.div>
    </section>
  );
};

export default TimeSaving;
