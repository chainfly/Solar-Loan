import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Upload, AlertCircle, ArrowLeft } from "lucide-react";

const JourneyTracker = () => {
  const steps = [
    {
      title: "Application Submitted",
      status: "completed",
      date: "Nov 10, 2025, 10:00 AM",
      description: "Loan application received",
      tip: "Instant acknowledgment via Webhook",
    },
    {
      title: "Instant KYC Verification",
      status: "completed",
      date: "Nov 10, 2025, 10:01 AM",
      description: "Identity verified via Decentro CKYC",
      tip: "Zero manual paperwork required",
    },
    {
      title: "Bank Account Validation",
      status: "completed",
      date: "Nov 10, 2025, 10:02 AM",
      description: "Penny drop verification successful",
      tip: "Account ownership confirmed instantly",
    },
    {
      title: "Credit & Risk Assessment",
      status: "processing",
      date: "In Progress",
      description: "Real-time CIBIL & income analysis",
      tip: "AI model analyzing 50+ data points",
      action: "View Live Score",
    },
    {
      title: "e-Agreement Signing",
      status: "pending",
      date: "Upcoming",
      description: "Digital signing via Aadhaar eSign",
      tip: "Paperless and legally binding",
    },
    {
      title: "Auto-Disbursement",
      status: "pending",
      date: "Upcoming",
      description: "Instant fund transfer to vendor",
      tip: "Powered by Decentro Payouts API",
    },
    {
      title: "Installation Scheduled",
      status: "pending",
      date: "Upcoming",
      description: "Vendor notified automatically",
      tip: "Real-time status updates enabled",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-success" />;
      case "processing":
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-success">Completed</Badge>;
      case "processing":
        return <Badge variant="default">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              View Loan Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Loan Journey Tracker</h1>
          <p className="text-muted-foreground">
            Track your solar loan application progress in real-time
          </p>
        </div>

        <Card className="p-6 mb-6 bg-primary/5">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Application ID: #CFL2025001234</h3>
              <p className="text-sm text-muted-foreground">
                Your application is currently being processed by our **AI Decision Engine**.
                Real-time updates powered by Decentro.
              </p>
            </div>
          </div>
        </Card>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 ${step.status === "completed"
                    ? "bg-success border-success"
                    : step.status === "processing"
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                    }`}
                >
                  {getStatusIcon(step.status)}
                </div>

                {/* Content */}
                <Card className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>

                  <p className="text-sm mb-2">{step.description}</p>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                    <span className="text-lg">💡</span>
                    <span className="text-muted-foreground">{step.tip}</span>
                  </div>

                  {step.action && step.status === "processing" && (
                    <Button className="mt-4" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      {step.action}
                    </Button>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6 mt-8 text-center">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our team is here to assist you throughout your loan journey
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Contact Support</Button>
            <Button>Chat with Us</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JourneyTracker;
