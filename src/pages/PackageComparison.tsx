import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, TrendingUp, Star, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const PackageComparison = () => {
  const [budget, setBudget] = useState("300000");
  const [roofSize, setRoofSize] = useState("400");

  const packages = [
    {
      id: 1,
      name: "Essential",
      capacity: 3,
      price: 210000,
      panelBrand: "Tata Solar",
      panelType: "Polycrystalline",
      inverterBrand: "Luminous",
      warranty: { panel: 10, inverter: 5 },
      yearlyGen: 3600,
      savings: 38000,
      payback: 5.5,
      efficiency: 16,
      recommended: false,
    },
    {
      id: 2,
      name: "Premium",
      capacity: 4,
      price: 280000,
      panelBrand: "Longi Solar",
      panelType: "Monocrystalline",
      inverterBrand: "SolarEdge",
      warranty: { panel: 25, inverter: 10 },
      yearlyGen: 4800,
      savings: 48000,
      payback: 5.8,
      efficiency: 20,
      recommended: true,
    },
    {
      id: 3,
      name: "Elite",
      capacity: 5,
      price: 350000,
      panelBrand: "JA Solar",
      panelType: "Bifacial",
      inverterBrand: "Fronius",
      warranty: { panel: 30, inverter: 12 },
      yearlyGen: 6000,
      savings: 60000,
      payback: 5.8,
      efficiency: 22,
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Compare Solar Packages</h1>
          <p className="text-muted-foreground">
            AI-curated packages tailored to your needs
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Budget (₹)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div>
              <Label>Roof Size (sq ft)</Label>
              <Input
                type="number"
                value={roofSize}
                onChange={(e) => setRoofSize(e.target.value)}
              />
            </div>
            <div>
              <Label>Monthly Bill (₹)</Label>
              <Input type="number" placeholder="e.g., 4500" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Update Recommendations</Button>
            </div>
          </div>
        </Card>

        {/* Package Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 relative ${pkg.recommended ? "border-2 border-primary" : ""
                }`}
            >
              {pkg.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Star className="mr-1 h-3 w-3" />
                  Best Match for You
                </Badge>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">₹{(pkg.price / 1000).toFixed(0)}k</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pkg.capacity} kW System
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{pkg.panelBrand}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.panelType} • {pkg.efficiency}% efficiency
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{pkg.inverterBrand}</div>
                    <div className="text-sm text-muted-foreground">
                      Premium inverter with monitoring
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">₹{pkg.savings.toLocaleString()}/year</div>
                    <div className="text-sm text-muted-foreground">
                      Annual savings
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="font-bold">{pkg.yearlyGen} kWh</div>
                  <div className="text-xs text-muted-foreground">Yearly Gen.</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="font-bold">{pkg.payback} yrs</div>
                  <div className="text-xs text-muted-foreground">Payback</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="font-bold">{pkg.warranty.panel} yrs</div>
                  <div className="text-xs text-muted-foreground">Panel Warranty</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="font-bold">{pkg.warranty.inverter} yrs</div>
                  <div className="text-xs text-muted-foreground">Inverter Warranty</div>
                </div>
              </div>

              {/* Included */}
              <div className="border-t pt-4 mb-6">
                <p className="text-sm font-semibold mb-2">What's Included:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Complete installation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Grid connection support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    5-year maintenance
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Monitoring app access
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Button
                className="w-full"
                variant={pkg.recommended ? "default" : "outline"}
              >
                {pkg.recommended ? "Choose This Package" : "Select Package"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Why This Package */}
        {packages.find((p) => p.recommended) && (
          <Card className="p-6 mt-8 bg-primary/5">
            <h3 className="text-xl font-semibold mb-3">
              Why Premium Package Fits You Best
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Matches your budget of ₹{parseInt(budget).toLocaleString()} and roof size of {roofSize} sq ft perfectly
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  20% efficient monocrystalline panels generate more power in limited space
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  25-year panel warranty offers long-term peace of mind
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Best value-for-money with optimal payback period of 5.8 years
                </span>
              </li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PackageComparison;
