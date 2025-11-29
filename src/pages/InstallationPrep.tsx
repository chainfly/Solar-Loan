import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Cloud, Sun, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const InstallationPrep = () => {
  const installationDate = "November 25, 2025";
  const weatherForecast = {
    condition: "Partly Cloudy",
    suitability: "Good",
    temperature: "24°C",
  };

  const checklist = [
    { item: "Clear roof area of debris", done: true },
    { item: "Ensure electrical panel is accessible", done: true },
    { item: "Keep pets indoors during installation", done: false },
    { item: "Designate parking space for installer van", done: false },
    { item: "Inform neighbors about installation", done: false },
  ];

  const timeline = [
    { time: "8:00 AM", task: "Team arrives and site inspection" },
    { time: "8:30 AM", task: "Unloading equipment and panels" },
    { time: "9:00 AM", task: "Roof mounting structure installation" },
    { time: "11:30 AM", task: "Solar panel placement" },
    { time: "2:00 PM", task: "Electrical connections and inverter setup" },
    { time: "4:30 PM", task: "System testing and commissioning" },
    { time: "5:30 PM", task: "Handover and documentation" },
  ];

  const dos = [
    "Be present during installation or designate a representative",
    "Keep water and refreshments ready for the installation team",
    "Take before and after photos for your records",
    "Ask questions if you have any doubts",
  ];

  const donts = [
    "Don't attempt to help with technical installation",
    "Avoid using high-power appliances during connection work",
    "Don't allow children near the work area",
    "Don't make advance payments without proper documentation",
  ];

  const afterCare = [
    "Clean panels every 45-60 days with soft cloth and water",
    "Monitor daily generation through the inverter app",
    "Schedule annual maintenance check",
    "Report any unusual sounds or performance drops immediately",
    "Keep all warranty documents and installation certificates safe",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Installation Day Guide</h1>
          <p className="text-muted-foreground">
            Everything you need to know for a smooth installation
          </p>
        </div>

        {/* Installation Date Card */}
        <Card className="p-6 mb-6 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{installationDate}</h3>
              <p className="text-muted-foreground">Installation Date</p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              Confirmed
            </Badge>
          </div>

          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <Cloud className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="font-semibold">{weatherForecast.condition}</div>
              <div className="text-sm text-muted-foreground">
                {weatherForecast.temperature} • {weatherForecast.suitability} for installation
              </div>
            </div>
            <Sun className="h-6 w-6 text-primary" />
          </div>
        </Card>

        {/* Pre-Installation Checklist */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Pre-Installation Checklist</h3>
          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${item.done ? "bg-success/5" : "bg-muted"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.done
                    ? "bg-success border-success"
                    : "border-border"
                    }`}
                >
                  {item.done && <Check className="h-4 w-4 text-success-foreground" />}
                </div>
                <span className={item.done ? "line-through text-muted-foreground" : ""}>
                  {item.item}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Progress value={(checklist.filter(i => i.done).length / checklist.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2">
              {checklist.filter(i => i.done).length} of {checklist.length} tasks completed
            </p>
          </div>
        </Card>

        {/* Installation Timeline */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Expected Timeline
          </h3>
          <div className="space-y-3">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <Badge variant="outline" className="mt-1">
                  {item.time}
                </Badge>
                <p className="flex-1 text-sm">{item.task}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ⏱️ Total estimated duration: 9-10 hours
          </p>
        </Card>

        {/* Do's and Don'ts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-green-50 dark:bg-green-950">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Check className="h-6 w-6 text-success" />
              Do's
            </h3>
            <ul className="space-y-2">
              {dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-red-50 dark:bg-red-950">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Don'ts
            </h3>
            <ul className="space-y-2">
              {donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* After-Installation Care */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">After-Installation Care</h3>
          <ul className="space-y-3">
            {afterCare.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {idx + 1}
                </div>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Safety Notice */}
        <Card className="p-6 bg-orange-50 dark:bg-orange-950 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Safety First</h4>
              <p className="text-sm text-muted-foreground">
                Our installers are MNRE-certified and follow all safety protocols. Installation
                involves working at heights and electrical connections. Please maintain a safe
                distance and follow all instructions from the installation team.
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Checklist PDF
          </Button>
          <Button className="flex-1">
            Contact Installation Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallationPrep;
