import { Card, CardContent } from "@/components/shared";

export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70">
      <Card className="shadow-xl p-8 flex flex-col items-center justify-center bg-background/90">
        <CardContent className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-4">
            <span className="block w-full h-full rounded-full border-4 border-muted animate-spin border-t-primary" />
          </div>
          <span className="text-muted-foreground text-lg font-medium">Please wait...</span>
        </CardContent>
      </Card>
    </div>
  );
}
