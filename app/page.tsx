import { ModeToggle } from "@/components/ui/mode-toggle";
import Image from "next/image";

export default function Home() {
  return (
  <div className="h-full w-full flex items-center justify-center gap-3 flex-col">
    <h1 className="text-3xl font-medium">Welcome to Kobobase </h1>
    <div className="flex gap-4 items-center">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded">Primary Button</div>
      <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded">Secondary Button</div>
      <div className="bg-accent text-accent-foreground px-4 py-2 rounded">Accent Button</div>
    </div>
    <div className="bg-card text-card-foreground p-4 rounded border">
      Card with border
    </div>
    <ModeToggle/>
  </div>
  );
}
