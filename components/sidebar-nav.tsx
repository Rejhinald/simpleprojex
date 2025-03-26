"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderArchive,
  FileSignature,
  Settings,
  User,
  LogOut,
  CreditCard,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSidebarContext } from "@/app/contexts/sidebar-context";

export function SidebarNav() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("2025-03-26 19:01:55");
  const username = "Rejhinald";
  const { open, setOpen } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isThemeToggleOpen, setIsThemeToggleOpen] = useState(false);
  const { setIsExpanded } = useSidebarContext();

  // Keep the two contexts in sync
  useEffect(() => {
    if (isMounted) {
      setIsExpanded(open);
    }
  }, [open, setIsExpanded, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    // Set initial date
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
    setCurrentDate(formattedDate);
  }, []);

  const handleMouseEnter = () => {
    if (isMounted && !open && !isThemeToggleOpen) {
      setOpen(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (isMounted && open && !isThemeToggleOpen) {
      setOpen(false);
      setIsExpanded(false);
    }
  };
  
  const handleThemeToggleClick = () => {
    setIsThemeToggleOpen(true);
    setOpen(true);
    setIsExpanded(true);
  };

  const handleThemeSelection = () => {
    setTimeout(() => {
      setIsThemeToggleOpen(false);
      if (!document.querySelector(".sidebar-container")?.matches(":hover")) {
        setOpen(false);
        setIsExpanded(false);
      }
    }, 300);
  };

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
      setCurrentDate(formattedDate);
    }, 60000);
    return () => clearInterval(interval);
  }, [isMounted]);

  const sidebarVariants = {
    expanded: { width: 240, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 64, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const avatarVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { duration: 0.2, ease: "easeOut" },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      display: "flex", // Ensure display is flex when expanded
      transition: { duration: 0.2, delay: 0.1 },
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transitionEnd: { display: "none" },
      transition: { duration: 0.2 },
    },
  };

  // Return a simple placeholder during server-side rendering to prevent hydration errors
  if (!isMounted) {
    return (
      <div className="h-screen" style={{ width: 64 }}>
        {/* Minimal content for SSR */}
      </div>
    );
  }

  return (
    <motion.div
      className="h-screen z-[50]" 
      initial={false}
      animate={open ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-container h-full w-full">
        <Sidebar collapsible="icon" className="h-full border-none">
          <SidebarHeader className="pb-0">
            <motion.div className="flex items-center gap-2 px-2 py-3" layout>
              <Avatar className="h-8 w-8 ring-2 ring-blue-200/50 ring-offset-2 ring-offset-background transition-all duration-300 overflow-hidden">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-full">
                  <motion.div
                    variants={avatarVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex items-center justify-center w-full h-full text-white font-bold text-sm"
                  >
                    SP
                  </motion.div>
                </AvatarFallback>
              </Avatar>
                <motion.div
                initial={{ opacity: 0 }}
                animate={
                  open
                  ? { opacity: 1, width: "auto" }
                  : { opacity: 0, width: 0 }
                }
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
                >
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <span className="text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Simple ProjeX
                  </span>
                </Link>
                </motion.div>
            </motion.div>
            <motion.div
              className="relative mx-2 mt-3 mb-1"
              initial={{ opacity: 0, height: 0 }}
              animate={
                open
                  ? { opacity: 1, height: "auto" }
                  : { opacity: 0, height: 0 }
              }
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <SidebarInput
                placeholder="Search..."
                className="pl-9 h-9 bg-muted/50 border-muted"
              />
            </motion.div>
          </SidebarHeader>

          {/* SidebarContent section remains the same */}
          <SidebarContent className="px-2">
            {/* Content remains unchanged */}
            <SidebarGroup>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={
                  open
                    ? { opacity: 1, height: "auto" }
                    : { opacity: 0, height: 0 }
                }
                transition={{ duration: 0.2 }}
              >
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                  Main
                </SidebarGroupLabel>
              </motion.div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    {
                      href: "/",
                      icon: LayoutDashboard,
                      label: "Dashboard",
                      color: "blue",
                    },
                    {
                      href: "/templates",
                      icon: FileText,
                      label: "Templates",
                      color: "orange",
                    },
                    {
                      href: "/proposals",
                      icon: FolderArchive,
                      label: "Proposals",
                      color: "blue",
                    },
                    {
                      href: "/contracts",
                      icon: FileSignature,
                      label: "Contracts",
                      color: "orange",
                    },
                  ].map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className={cn(
                          "transition-all",
                          pathname === item.href
                            ? `bg-${item.color}-500/10 text-${item.color}-600`
                            : ""
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "min-w-5",
                              pathname === item.href
                                ? `text-${item.color}-500`
                                : ""
                            )}
                          />
                          <motion.span
                            initial={{ opacity: 0, marginLeft: "-1rem" }}
                            animate={
                              open
                                ? { opacity: 1, marginLeft: "0.5rem" }
                                : { opacity: 0, marginLeft: "-1rem" }
                            }
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-2">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={
                  open
                    ? { opacity: 1, height: "auto" }
                    : { opacity: 0, height: 0 }
                }
                transition={{ duration: 0.2 }}
              >
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                  Settings
                </SidebarGroupLabel>
              </motion.div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    {
                      href: "/account",
                      icon: User,
                      label: "Account",
                      color: "blue",
                    },
                    {
                      href: "/billing",
                      icon: CreditCard,
                      label: "Billing",
                      color: "orange",
                    },
                    {
                      href: "/settings",
                      icon: Settings,
                      label: "Settings",
                      color: "blue",
                    },
                  ].map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className={cn(
                          "transition-all",
                          pathname === item.href
                            ? `bg-${item.color}-500/10 text-${item.color}-600`
                            : ""
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "min-w-5",
                              pathname === item.href
                                ? `text-${item.color}-500`
                                : ""
                            )}
                          />
                          <motion.span
                            initial={{ opacity: 0, marginLeft: "-1rem" }}
                            animate={
                              open
                                ? { opacity: 1, marginLeft: "0.5rem" }
                                : { opacity: 0, marginLeft: "-1rem" }
                            }
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="mt-auto">
            <div className="border-t pt-2 pb-2 px-2"> {/* Changed px-3 to px-2 to match header */}
              {open ? (
                <motion.div
                  className="flex items-center gap-3 py-2 px-1.5 rounded-md hover:bg-muted/50 transition-colors"
                  layout
                  initial={{ opacity: 1 }}
                >
                  <motion.div
                    className="relative"
                    layout
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-blue-200/50 ring-offset-2 ring-offset-background transition-all duration-300">
                      {/* Changed h-9 w-9 to h-8 w-8 to match header avatar */}
                      <AvatarImage
                        src="/avatar-placeholder.png"
                        alt={username}
                        className="object-cover transition-opacity"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="avatar-text"
                            initial={avatarVariants.initial}
                            animate={avatarVariants.animate}
                            exit={avatarVariants.exit}
                            transition={avatarVariants.transition}
                            className="flex items-center justify-center w-full h-full text-white font-medium"
                          >
                            {username.substring(0, 2)}
                          </motion.div>
                        </AnimatePresence>
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <motion.div
                    className="flex flex-col min-w-0 flex-1"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                  >
                    <motion.span
                      className="text-sm font-medium truncate"
                      layout
                    >
                      {username}
                    </motion.span>
                    <motion.span
                      className="text-xs text-muted-foreground truncate"
                      layout
                    >
                      {currentDate}
                    </motion.span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-0.5 ml-auto"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                  >
                    <div onClick={handleThemeToggleClick}>
                      <ModeToggle
                        onOpenChange={(openState) =>
                          setIsThemeToggleOpen(openState)
                        }
                        onSelect={handleThemeSelection}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">Log out</span>
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex justify-center px-2"> {/* Removed pl-3 and added px-2 to match header */}
                  <motion.div
                    className="relative"
                    layout
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-blue-200/50 ring-offset-2 ring-offset-background transition-all duration-300">
                      {/* Changed h-9 w-9 to h-8 w-8 to match header avatar */}
                      <AvatarImage
                        src="/avatar-placeholder.png"
                        alt={username}
                        className="object-cover transition-opacity"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="avatar-text"
                            initial={avatarVariants.initial}
                            animate={avatarVariants.animate}
                            exit={avatarVariants.exit}
                            transition={avatarVariants.transition}
                            className="flex items-center justify-center w-full h-full text-white font-medium"
                          >
                            {username.substring(0, 2)}
                          </motion.div>
                        </AnimatePresence>
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </motion.div>
  );
}