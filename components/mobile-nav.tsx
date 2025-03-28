"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      active: pathname === "/",
    },
    {
      href: "/templates",
      label: "Templates",
      active: pathname === "/templates",
    },
    {
      href: "/proposals",
      label: "Proposals",
      active: pathname === "/proposals",
    },
    {
      href: "/contracts",
      label: "Contracts",
      active: pathname === "/contracts",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[75vw] sm:w-[350px]">
        <div className="flex flex-col gap-6 px-2 py-8">
          <div className="flex justify-start mb-6">
            <span className="font-bold text-xl">SimpleProjex</span>
          </div>
          <div className="flex flex-col space-y-3">
            {routes.map((route) => (
              <SheetClose key={route.href} asChild>
                <Link
                  href={route.href}
                  className={cn(
                    "py-2 px-3 text-lg font-medium rounded-md transition-colors",
                    route.active 
                      ? "bg-secondary text-secondary-foreground" 
                      : "hover:bg-secondary/50"
                  )}
                >
                  {route.label}
                </Link>
              </SheetClose>
            ))}
          </div>
          
          <div className="mt-auto pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {new Date().toISOString().split('T')[0]}
              </span>
              <span className="text-sm font-medium">
                Admin
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}