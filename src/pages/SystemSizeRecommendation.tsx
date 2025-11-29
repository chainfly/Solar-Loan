import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SystemSizeRecommendation = () => {
  const [bill, setBill] = useState("");
  const [roofSize, setRoofSize] = useState("");
  const [panelType, setPanelType] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  const recommendations = [
    {
      size: 3,
      yearlyGen: 3600,
      roofRequired: 270,
      tiltAngle: 18,
      cost: 180000,
      savings: 38000,
      recommended: false,
    },
    {
      size: 4,
      yearlyGen: 4800,
      roofRequired: 360,
      tiltAngle: 18,
      cost: 240000,
      savings: 48000,
      recommended: true,
    },
    {
      size: 5,
      yearlyGen: 6000,
      roofRequired: 450,
      tiltAngle: 18,
      cost: 300000,
      savings: 60000,
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Solar System Size Recommendation</h1>
          <p className="text-muted-foreground">
            Find the perfect solar system size for your needs
          </p>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tell us about your requirements</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="bill">Monthly Electricity Bill (₹)</Label>
              <Input
                id="bill"
                type="number"
                placeholder="e.g., 4500"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="roofSize">Available Roof Size (sq ft)</Label>
              <Input
                id="roofSize"
                type="number"
                placeholder="e.g., 500"
                value={roofSize}
                onChange={(e) => setRoofSize(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="panelType">Panel Preference</Label>
              <Select value={panelType} onValueChange={setPanelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="bifacial">Bifacial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => setShowRecommendations(true)}
            className="w-full"
            size="lg"
          >
            Get AI Recommendations
          </Button>
        </Card>

        {showRecommendations && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recommended System Sizes</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card
                  key={rec.size}
                  className={`p-6 relative ${rec.recommended ? 'border-primary border-2' : ''}`}
                >
                  {rec.recommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Best Match
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <Zap className="mx-auto h-12 w-12 text-primary mb-2" />
                    <div className="text-3xl font-bold">{rec.size} kW</div>
                    <div className="text-sm text-muted-foreground">System Size</div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yearly Generation</span>
                      <span className="font-semibold">{rec.yearlyGen} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Roof Required</span>
                      <span className="font-semibold">{rec.roofRequired} sq ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tilt Angle</span>
                      <span className="font-semibold">{rec.tiltAngle}°</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Cost</span>
                      <span className="font-semibold">₹{rec.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Savings</span>
                      <span className="font-semibold text-success">₹{rec.savings.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={rec.recommended ? "default" : "outline"}
                  >
                    Start Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-muted/50">
              <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">All calculations based on average irradiation for your location</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Tilt angle optimized for maximum annual generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Shading analysis recommended for final installation</span>
                </li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSizeRecommendation;
