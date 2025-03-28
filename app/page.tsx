/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FolderArchive, Clock, CalendarClock, ArrowRight } from "lucide-react";
import { format, parseISO, compareDesc } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  type Contract, 
  type Template, 
  type Proposal,
  type PaginatedResponse,
  templateApi,
  proposalApi,
  contractApi
} from "@/app/api/apiService";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<PaginatedResponse<Template> | null>(null);
  const [proposals, setProposals] = useState<PaginatedResponse<Proposal> | null>(null);
  const [contracts, setContracts] = useState<PaginatedResponse<Contract> | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const currentDateTime = format(new Date("2025-03-28T13:51:01"), "MMMM d, yyyy 'at' HH:mm:ss");
  const username = "Admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesData, proposalsData, contractsData] = await Promise.all([
          templateApi.list(),
          proposalApi.list(),
          contractApi.list()
        ]);
        
        setTemplates(templatesData);
        setProposals(proposalsData);
        setContracts(contractsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Templates",
      value: templates?.count ?? 0,
      icon: FileText,
      trend: "+8%",
      href: "/templates",
      iconColor: "text-blue-500",
      glowColor: "before:shadow-[0_0_15px_2px_rgba(59,130,246,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(59,130,246,0.15)]",
      hoverGlowColor: "group-hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.4)] dark:group-hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.2)]",
      ringColor: "ring-blue-200/50",
      gradientText: "from-blue-600 to-blue-400"
    },
    {
      title: "Proposals",
      value: proposals?.count ?? 0,
      icon: FolderArchive,
      trend: "+12%",
      href: "/proposals",
      iconColor: "text-orange-500",
      glowColor: "before:shadow-[0_0_15px_2px_rgba(249,115,22,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(249,115,22,0.15)]",
      hoverGlowColor: "group-hover:before:shadow-[0_0_25px_5px_rgba(249,115,22,0.4)] dark:group-hover:before:shadow-[0_0_25px_5px_rgba(249,115,22,0.2)]",
      ringColor: "ring-orange-200/50",
      gradientText: "from-orange-600 to-orange-400"
    },
    {
      title: "Contracts",
      value: contracts?.count ?? 0,
      icon: FileText,
      trend: "-3%",
      href: "/contracts",
      iconColor: "text-emerald-500",
      glowColor: "before:shadow-[0_0_15px_2px_rgba(16,185,129,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(16,185,129,0.15)]",
      hoverGlowColor: "group-hover:before:shadow-[0_0_25px_5px_rgba(16,185,129,0.4)] dark:group-hover:before:shadow-[0_0_25px_5px_rgba(16,185,129,0.2)]",
      ringColor: "ring-emerald-200/50",
      gradientText: "from-emerald-600 to-emerald-400"
    }
  ];

  // Sort items by created_at date (newest first)
  const sortByDate = (items: any[]) => {
    return [...items].sort((a, b) => 
      compareDesc(parseISO(a.created_at), parseISO(b.created_at))
    );
  };

  return (
    <motion.div 
      className="flex flex-col gap-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex flex-col gap-2"
        variants={itemVariants}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Welcome back, {username}</h1>
            <p className="text-muted-foreground">
              Here&apos;s an overview of your projects and recent activity.
            </p>
          </div>
          <div className="text-sm text-muted-foreground flex items-center bg-muted/30 px-3 py-1.5 rounded-md border border-muted shadow-sm">
            <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
            {currentDateTime}
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={containerVariants}
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Link href={stat.href} className="block group">
              <Card className={`relative overflow-visible transition-all duration-300 hover:scale-[1.02] before:absolute before:inset-0 before:rounded-lg before:content-[''] before:-z-10 before:transition-all before:duration-500 ${stat.glowColor} ${stat.hoverGlowColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`h-8 w-8 rounded-full bg-white/90 dark:bg-background/90 flex items-center justify-center shadow-sm ring-2 ${stat.ringColor} ring-offset-2 ring-offset-background transition-all duration-300`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.trend} from last month</p>
                    </>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <span className={`text-xs bg-gradient-to-r ${stat.gradientText} bg-clip-text text-transparent hover:underline inline-flex items-center font-medium`}>
                    View {stat.title}
                    <ArrowRight className={`ml-1 h-3 w-3 ${stat.iconColor}`} />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabbed Content */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-muted/30 border border-muted p-0.5">
            <TabsTrigger value="overview" className="data-[state=active]:shadow-[0_0_10px_1px_rgba(59,130,246,0.3)] dark:data-[state=active]:shadow-[0_0_10px_1px_rgba(59,130,246,0.15)] relative overflow-visible">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:shadow-[0_0_10px_1px_rgba(59,130,246,0.3)] dark:data-[state=active]:shadow-[0_0_10px_1px_rgba(59,130,246,0.15)] relative overflow-visible">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Recent Templates",
                  description: "Latest template updates",
                  items: templates?.items || [],
                  icon: FileText,
                  viewLink: "/templates",
                  iconColor: "text-blue-500",
                  glowColor: "before:shadow-[0_0_15px_2px_rgba(59,130,246,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(59,130,246,0.15)]",
                  hoverGlowColor: "hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.4)] dark:hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.2)]",
                  ringColor: "ring-blue-200/50",
                  gradientText: "from-blue-600 to-blue-400",
                  loading
                },
                {
                  title: "Recent Proposals",
                  description: "Latest proposal updates",
                  items: proposals?.items || [],
                  icon: FolderArchive,
                  viewLink: "/proposals",
                  iconColor: "text-orange-500",
                  glowColor: "before:shadow-[0_0_15px_2px_rgba(249,115,22,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(249,115,22,0.15)]",
                  hoverGlowColor: "hover:before:shadow-[0_0_25px_5px_rgba(249,115,22,0.4)] dark:hover:before:shadow-[0_0_25px_5px_rgba(249,115,22,0.2)]",
                  ringColor: "ring-orange-200/50",
                  gradientText: "from-orange-600 to-orange-400",
                  loading
                },
                {
                  title: "Active Contracts",
                  description: "Currently active contracts",
                  items: contracts?.items?.filter((c: { is_active: any; }) => c.is_active) || [],
                  icon: FileText,
                  viewLink: "/contracts",
                  iconColor: "text-emerald-500",
                  glowColor: "before:shadow-[0_0_15px_2px_rgba(16,185,129,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(16,185,129,0.15)]",
                  hoverGlowColor: "hover:before:shadow-[0_0_25px_5px_rgba(16,185,129,0.4)] dark:hover:before:shadow-[0_0_25px_5px_rgba(16,185,129,0.2)]",
                  ringColor: "ring-emerald-200/50",
                  gradientText: "from-emerald-600 to-emerald-400",
                  loading
                }
              ].map((section) => (
                <Card key={section.title} className={`relative overflow-visible transition-all duration-300 before:absolute before:inset-0 before:rounded-lg before:content-[''] before:-z-10 before:transition-all before:duration-500 ${section.glowColor} ${section.hoverGlowColor} flex flex-col`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-white/90 dark:bg-background/90 flex items-center justify-center shadow-sm ring-2 ${section.ringColor} ring-offset-2 ring-offset-background transition-all duration-300`}>
                        <section.icon className={`h-5 w-5 ${section.iconColor}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-hidden flex-1 bg-background">
                    {section.loading ? (
                      <div className="px-6 py-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    ) : section.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-muted">
                              <TableHead className="pl-6">Name</TableHead>
                              <TableHead className="text-right pr-6">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortByDate(section.items).slice(0, 3).map((item: any) => (
                              <TableRow key={item.id} className="hover:bg-muted/20">
                                <TableCell className="font-medium truncate max-w-[180px] pl-6">
                                  <span className="text-foreground">{item.name || item.client_name}</span>
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground pr-6">
                                  {format(new Date(item.created_at), "MMM d, yyyy")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="px-6 py-4 text-sm text-muted-foreground">No items to display</p>
                    )}
                  </CardContent>
                  <CardFooter className="border-t hover:bg-muted/10 transition-colors mt-auto h-14 flex items-center justify-center">
                    <Link
                      href={section.viewLink}
                      className="w-full text-center text-sm font-medium py-2 inline-flex items-center justify-center gap-2 hover:underline"
                    >
                      <span className={`bg-gradient-to-r ${section.gradientText} bg-clip-text text-transparent`}>View {section.title}</span>
                      <ArrowRight className={`h-4 w-4 ${section.iconColor}`} />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="relative overflow-visible before:absolute before:inset-0 before:rounded-lg before:content-[''] before:-z-10 before:transition-all before:duration-500 before:shadow-[0_0_15px_2px_rgba(59,130,246,0.3)] dark:before:shadow-[0_0_15px_2px_rgba(59,130,246,0.15)] hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.4)] dark:hover:before:shadow-[0_0_25px_5px_rgba(59,130,246,0.2)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest actions and updates</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/90 dark:bg-background/90 flex items-center justify-center shadow-sm ring-2 ring-blue-200/50 ring-offset-2 ring-offset-background transition-all duration-300">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden bg-background">
                {loading ? (
                  <div className="p-6 space-y-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-3 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-muted">
                          <TableHead className="pl-6">Event</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead className="text-right pr-6">Date & Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortByDate(contracts?.items || []).slice(0, 5).map((contract) => (
                          <TableRow key={contract.id} className="hover:bg-muted/20 group">
                            <TableCell className="pl-6">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 ring-2 ring-blue-200/30 group-hover:ring-blue-200/50 ring-offset-2 ring-offset-background transition-all duration-300">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
                                    <div className="flex items-center justify-center w-full h-full text-white font-bold text-sm">
                                      {contract.client_name.substring(0, 2)}
                                    </div>
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground">
                                  Contract {contract.client_signed_at ? "signed" : "created"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground">{contract.client_name}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs pr-6">
                              {format(new Date(contract.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t flex justify-center py-4 h-14">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 transition-all duration-300 border-blue-200/50 relative overflow-visible before:absolute before:inset-0 before:rounded-md before:content-[''] before:-z-10 before:transition-all before:duration-500 hover:before:shadow-[0_0_10px_1px_rgba(59,130,246,0.3)] dark:hover:before:shadow-[0_0_10px_1px_rgba(59,130,246,0.15)]"
                >
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">View All Activity</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}