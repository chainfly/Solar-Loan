import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Shield, Leaf, Zap, Calendar, Users, ArrowLeft } from "lucide-react";
import { useState } from "react";

const PersonalizedTips = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const userProfile = {
    state: "Maharashtra",
    electricityUsage: 450,
    roofType: "Flat RCC",
    loanAmount: 280000,
    creditScore: 728,
    documentsStatus: "Complete",
    systemSize: 4,
  };

  const tips = [
    {
      category: "maintenance",
      icon: Leaf,
      title: "Clean Panels Every 45 Days",
      description: "In your climate zone (Maharashtra), dust accumulation reduces efficiency by 8-10%. Clean panels with soft cloth and water during early morning.",
      priority: "high",
      impact: "+10% generation",
    },
    {
      category: "financial",
      icon: TrendingUp,
      title: "Add Co-Applicant for Better Terms",
      description: "Adding a co-applicant with stable income increases your approval probability by 8% and could reduce interest rate by 0.5%.",
      priority: "medium",
      impact: "₹12,000 savings",
    },
    {
      category: "financial",
      icon: Shield,
      title: "Reduce Loan by ₹20,000",
      description: "Lowering your loan amount to ₹2,60,000 improves your debt-to-income ratio and increases approval chances by 6%.",
      priority: "medium",
      impact: "+6% approval chance",
    },
    {
      category: "installation",
      icon: Zap,
      title: "Install South-Facing Panels",
      description: "South-facing installation in your location generates 3.5% extra power compared to east-west orientation.",
      priority: "high",
      impact: "+3.5% generation",
    },
    {
      category: "seasonal",
      icon: Calendar,
      title: "Schedule Installation in Winter",
      description: "November-February offers optimal conditions in Maharashtra. Installer availability is high and testing is easier in mild weather.",
      priority: "low",
      impact: "Faster completion",
    },
    {
      category: "maintenance",
      icon: Leaf,
      title: "Monitor Daily Generation",
      description: "Check your inverter app daily. Sudden drops (>15%) may indicate panel soiling, shading, or technical issues requiring immediate attention.",
      priority: "high",
      impact: "Early issue detection",
    },
    {
      category: "financial",
      icon: Users,
      title: "Utilize Government Subsidy",
      description: "For your 4kW system, you're eligible for ₹78,000 PM Surya Ghar subsidy. Apply immediately after installation to avoid processing delays.",
      priority: "high",
      impact: "₹78,000 benefit",
    },
  ];

  const categories = [
    { value: "all", label: "All Tips" },
    { value: "maintenance", label: "Maintenance" },
    { value: "financial", label: "Financial" },
    { value: "installation", label: "Installation" },
    { value: "seasonal", label: "Seasonal" },
  ];

  const filteredTips = activeCategory === "all"
    ? tips
    : tips.filter((t) => t.category === activeCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive";
      case "medium":
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Personalized Tips & Advisory</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations tailored to your profile
          </p>
        </div>

        {/* User Profile Summary */}
        <Card className="p-6 mb-8 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Location</div>
              <div className="font-semibold">{userProfile.state}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Monthly Usage</div>
              <div className="font-semibold">{userProfile.electricityUsage} kWh</div>
            </div>
            <div>
              <div className="text-muted-foreground">System Size</div>
              <div className="font-semibold">{userProfile.systemSize} kW</div>
            </div>
            <div>
              <div className="text-muted-foreground">Credit Score</div>
              <div className="font-semibold text-success">{userProfile.creditScore}</div>
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.value)}
              size="sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Tips Grid */}
        <div className="space-y-4 mb-8">
          {filteredTips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{tip.title}</h3>
                      <Badge className={getPriorityColor(tip.priority)}>
                        {tip.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {tip.description}
                    </p>

                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {tip.impact}
                      </Badge>
                      <Badge variant="secondary">
                        {tip.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Daily Tip Carousel */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-success/10">
          <div className="flex items-start gap-4">
            <Lightbulb className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">💡 Tip of the Day</h3>
              <p className="text-muted-foreground mb-3">
                Track your system's performance during peak sun hours (11 AM - 3 PM) to identify
                optimal generation patterns. This helps you schedule high-power appliances like
                washing machines and geysers during solar production hours, maximizing self-consumption
                and reducing grid dependency.
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        </Card>

        {/* Seasonal Advice */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">🌦️ Seasonal Advice (November)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline">Nov-Feb</Badge>
              <p className="text-muted-foreground">
                Ideal installation season in Maharashtra. Mild weather, clear skies, and high solar irradiation.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Cleaning</Badge>
              <p className="text-muted-foreground">
                Clean panels every 30-45 days in winter due to lower rainfall and dust accumulation.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Generation</Badge>
              <p className="text-muted-foreground">
                Expect 10-15% higher generation compared to summer months due to cooler panel temperatures.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedTips;
