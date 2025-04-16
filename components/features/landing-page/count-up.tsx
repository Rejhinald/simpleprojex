import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import numeral from "numeral"; // Import numeral.js for number formatting
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";

const pieData = [
  { name: "Contractors", value: 90, color: "#f2f2f2" },
  { name: "Working Days", value: 465, color: "#f4c04c" },
  { name: "Positive Feedbacks", value: 175, color: "#4b4b4b" },
  { name: "Awards", value: 39, color: "#f8b400" },
];

declare global {
  interface Window {
    loadCalendlyScript?: () => void;
  }
}

interface CountProps {
  theme: string;
  calendlyReady?: boolean;
}

const Count = ({ theme, calendlyReady }: CountProps) => {
  const [activeData, setActiveData] = useState(
    pieData.map((d) => ({ ...d, value: 0 }))
  );
  const [countingValues, setCountingValues] = useState(
    pieData.map((d) => ({ ...d, count: 0 }))
  );
  const [endAngle, setEndAngle] = useState(0); // Initial endAngle for pie chart animation

  // Pie Chart Effect
  useEffect(() => {
    const timer = setTimeout(() => setActiveData(pieData), 500);

    // Start the count-up animation with formatting
    const countUpInterval = pieData.map((item, index) => {
      const interval = setInterval(() => {
        setCountingValues((prev) => {
          const updatedValues = [...prev];
          const currentValue = updatedValues[index].count;
          if (currentValue < item.value) {
            updatedValues[index].count = currentValue + 1;
          }
          return updatedValues;
        });
      }, 20); // Update every 20ms (smooth counting)

      return interval;
    });

    // Animate the pie chart opening (counter-clockwise direction)
    const angleInterval = setInterval(() => {
      setEndAngle((prev) => {
        if (prev < 360) {
          return prev + 2; // Increased increment for faster animation
        } else {
          clearInterval(angleInterval);
          return prev;
        }
      });
    }, 5); // Reduced interval for faster opening

    return () => {
      clearTimeout(timer);
      countUpInterval.forEach(clearInterval);
      clearInterval(angleInterval);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSmallScreen(window.innerWidth < 768);

      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Calendly) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openCalendlyPopup = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/avorino/simple-projex-demo",
      });
    }
  };

  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-16 px-5 md:px-16 mt-16 mb-16 bg-background gap-8">
      {/* Left Text Section */}
      <Card className="w-full md:w-1/2 mb-10 md:mb-0 bg-background/90 shadow-xl border-0">
        <CardContent className="p-10 flex flex-col items-start justify-center h-full">
          <CardTitle className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 font-serif text-foreground">
            TRANSFORMING THE INDUSTRY:
          </CardTitle>
          <CardDescription className="text-lg md:text-2xl mb-6 text-muted-foreground">
            Discover how we connect contractors with exciting opportunities and streamline project management for maximum efficiency and success.
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
              "Schedule a Demo"
            )}
          </Button>
        </CardContent>
      </Card>
      {/* Pie Chart Section */}
      <Card className="w-full md:w-1/2 flex justify-center items-center bg-background/90 shadow-xl border-0 h-[400px]">
        <CardContent className="flex items-center justify-center w-full h-full p-0">
          <ResponsiveContainer width="90%" height={isSmallScreen ? 300 : 400}>
            <PieChart>
              <Pie
                data={activeData}
                dataKey="value"
                outerRadius={isSmallScreen ? 150 : 150}
                fill="#8884d8"
                label={({ name, value, cx, cy, midAngle }) => {
                  if (isSmallScreen) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = 150 + 15;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const currentValue = countingValues.find((d) => d.name === name)?.count || 0;
                  const formattedValue = numeral(currentValue).format("0.0a");
                  const isLeft = midAngle > 90 && midAngle < 270;
                  const dynamicOffset = isSmallScreen ? 0 : name.length > 10 ? 15 : 5;
                  return (
                    <g>
                      <text
                        x={isLeft ? x - dynamicOffset : x + dynamicOffset}
                        y={y}
                        fill="var(--color-foreground)"
                        className="text-sm md:text-lg lg:text-xl font-medium"
                        style={{
                          textShadow: "2px 2px 4px rgba(0,0,0,0.12)",
                        }}
                        dominantBaseline="central"
                        textAnchor={isLeft ? "end" : "start"}
                      >
                        {name}
                      </text>
                      <text
                        x={isLeft ? x - dynamicOffset : x + dynamicOffset}
                        y={y + 20}
                        fill="var(--color-muted-foreground)"
                        className="text-sm md:text-lg lg:text-xl font-semibold"
                        style={{
                          textShadow: "2px 2px 4px rgba(0,0,0,0.12)",
                        }}
                        dominantBaseline="central"
                        textAnchor={isLeft ? "end" : "start"}
                      >
                        {formattedValue}
                      </text>
                    </g>
                  );
                }}
                labelLine={false}
                endAngle={endAngle}
                animationDuration={500}
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
};

export default Count;
