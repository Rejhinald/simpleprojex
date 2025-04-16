"use client";
import React, { useState, useEffect } from "react";
import HeroSection from "@/components/features/landing-page/hero-section";
import { motion } from "framer-motion";
import SimpleSteps from "@/components/features/landing-page/simple-step";
import Succeed from "@/components/features/landing-page/succeed";
import CountUp from "@/components/features/landing-page/count-up";
import Proposal from "@/components/features/landing-page/proposal";
import Footer from "@/components/features/landing-page/footer";
import TimeSaving from "@/components/features/landing-page/time-saving";
import Header from "@/components/features/landing-page/header";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Calendly?: any;
  }
}

export default function LandingPage() {
  const router = useRouter();
  const [scrolling, setScrolling] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [calendlyReady, setCalendlyReady] = useState(false);

  // Use the same successful Calendly implementation from the reference files
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Add Calendly CSS directly
      const link = document.createElement("link");
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // Add Calendly Script directly
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => setCalendlyReady(true);
      document.body.appendChild(script);
    }
  }, []);

  // Only access localStorage and document in useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      // Always default to light mode unless user explicitly chose dark
      let defaultTheme = "light";
      if (storedTheme) {
        setTheme(storedTheme);
        defaultTheme = storedTheme;
      } else {
        setTheme("light");
        localStorage.setItem("theme", "light");
      }
      document.documentElement.classList.toggle("dark", defaultTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        setScrolling(window.scrollY > 50);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div
        className={`flex flex-col overflow-hidden bg-${
          theme === "dark" ? "[#191919]" : "white"
        }`}
      >
        <Header
          toggleTheme={toggleTheme}
          theme={theme}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
        {/* Hero Section */}
        <section className="relative min-h-screen">
          <HeroSection theme={theme} calendlyReady={calendlyReady} />
        </section>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <section
          style={{
            minHeight: "100vh",
            paddingTop: `${scrolling ? "60px" : "100vh"}`,
            paddingBottom: "0",
          }}
          className="transition-all duration-1000 ease-in-out mt-12"
        >
          <SimpleSteps theme={theme} showLogin={false} calendlyReady={calendlyReady} />
        </section>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <motion.div
          style={{ paddingTop: `${scrolling ? "0" : "100vh"}`, paddingBottom: "0" }}
          className="transition-all duration-1000 ease-in-out"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: scrolling ? 1 : 0, y: scrolling ? 0 : 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Succeed theme={theme} showLogin={false} calendlyReady={calendlyReady} />
        </motion.div>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <motion.div
          style={{ paddingTop: `${scrolling ? "0" : "100vh"}`, paddingBottom: "0" }}
          className="transition-all duration-1000 ease-in-out"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: scrolling ? 1 : 0, y: scrolling ? 0 : 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <CountUp theme={theme} calendlyReady={calendlyReady} />
        </motion.div>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <motion.div
          style={{ paddingTop: `${scrolling ? "0" : "100vh"}`, paddingBottom: "0" }}
          className="transition-all duration-1000 ease-in-out"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: scrolling ? 1 : 0, y: scrolling ? 0 : 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Proposal theme={theme} calendlyReady={calendlyReady} />
        </motion.div>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <motion.div
          style={{ paddingTop: `${scrolling ? "0" : "100vh"}`, paddingBottom: "0" }}
          className="transition-all duration-1000 ease-in-out"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: scrolling ? 1 : 0, y: scrolling ? 0 : 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <TimeSaving theme={theme} calendlyReady={calendlyReady} />
        </motion.div>
        <hr className={`border-t-3 border-${theme === "dark" ? "white" : "black"}`} />
        <motion.div
          style={{ paddingTop: `${scrolling ? "0" : "100vh"}`, paddingBottom: "0" }}
          className="transition-all duration-1000 ease-in-out"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: scrolling ? 1 : 0, y: scrolling ? 0 : 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Footer theme={theme} />
        </motion.div>
      </div>
    </>
  );
}
