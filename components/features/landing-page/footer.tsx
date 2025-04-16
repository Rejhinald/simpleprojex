import React from "react";
import { Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription, Button } from "@/components/shared";

interface FooterProps {
  theme: string;
}

const Footer = ({ theme }: FooterProps) => {
  return (
    <footer className="relative py-12 px-4 bg-background border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Card className="bg-transparent shadow-none border-0 flex-1 min-w-[250px]">
          <CardContent className="flex flex-col items-start">
            <img
              src={theme === "dark" ? "/logo-no-bg-dark mode.png" : "/logo-no-bg-light mode.png"}
              alt="Simple Projex Logo"
              className="h-12 w-auto mb-4"
            />
            <CardDescription className="text-base text-muted-foreground mb-2">
              Revolutionizing construction with cutting-edge technology and innovative solutions. Build smarter. Build better.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="bg-transparent shadow-none border-0 flex-1 min-w-[200px]">
          <CardContent>
            <CardTitle className="mb-2">Visit Us</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Irvine, California</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent shadow-none border-0 flex-1 min-w-[200px]">
          <CardContent>
            <CardTitle className="mb-2">Get in Touch</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="font-medium">Email Us: build@simpleprojex.com</span>
            </div>
            <Button asChild variant="outline" className="mt-2">
              <a href="mailto:build@simpleprojex.com">Contact</a>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Simple Projex. All Rights Reserved.</p>
        <p className="mt-2">We are committed to delivering high-quality solutions with a focus on sustainability and innovation.</p>
      </div>
    </footer>
  );
};

export default Footer;
