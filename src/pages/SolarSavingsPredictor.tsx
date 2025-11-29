import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Leaf, Zap, TrendingUp, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

const SolarSavingsPredictor = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    monthlyBill: "",
    roofType: "",
    roofArea: "",
  });
  const [showResults, setShowResults] = useState(false);

  const savingsData = Array.from({ length: 25 }, (_, i) => ({
    year: i + 1,
    savings: 45000 + i * 2500 - (i > 15 ? (i - 15) * 500 : 0),
  }));

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    generation: 280 + Math.random() * 60,
  }));

  const handleCalculate = () => {
    setShowResults(true);
    toast({
      title: "Analysis Complete!",
      description: "Your personalized solar savings prediction is ready.",
    });
  };

  const mockResults = {
    monthlyGeneration: 350,
    yearlyGeneration: 4200,
    capacity: 3.5,
    savings25Year: 1250000,
    co2Saved: 87.5,
    treesEquivalent: 145,
    paybackYears: 6.2,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Solar Savings Predictor</h1>
          <p className="text-muted-foreground">
            Get AI-powered predictions of your solar savings potential
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Your Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Enter your district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="monthlyBill">Average Monthly Electricity Bill (₹)</Label>
                <Input
                  id="monthlyBill"
                  type="number"
                  placeholder="e.g., 3500"
                  value={formData.monthlyBill}
                  onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="roofType">Roof Type</Label>
                <Select
                  value={formData.roofType}
                  onValueChange={(value) => setFormData({ ...formData, roofType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat RCC</SelectItem>
                    <SelectItem value="sloped">Sloped</SelectItem>
                    <SelectItem value="metal">Metal Sheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roofArea">Available Roof Area (sq ft)</Label>
                <Input
                  id="roofArea"
                  type="number"
                  placeholder="e.g., 400"
                  value={formData.roofArea}
                  onChange={(e) => setFormData({ ...formData, roofArea: e.target.value })}
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload roof photo (optional)
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose File
                </Button>
              </div>

              <Button onClick={handleCalculate} className="w-full" size="lg">
                Calculate Savings Potential
              </Button>
            </div>
          </Card>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {!showResults ? (
              <Card className="p-8 text-center">
                <Zap className="mx-auto h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Predict Your Savings?</h3>
                <p className="text-muted-foreground">
                  Fill in your details and click calculate to see personalized AI-powered predictions
                  for your solar savings potential over 25 years.
                </p>
              </Card>
            ) : (
              <>
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Recommended Configuration</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <Zap className="mx-auto h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{mockResults.capacity} kW</div>
                      <div className="text-sm text-muted-foreground">System Size</div>
                    </div>
                    <div className="text-center p-4 bg-success/5 rounded-lg">
                      <TrendingUp className="mx-auto h-8 w-8 text-success mb-2" />
                      <div className="text-2xl font-bold">{mockResults.monthlyGeneration} kWh</div>
                      <div className="text-sm text-muted-foreground">Monthly Gen.</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">25-Year Savings Projection</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={savingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                    <div className="text-3xl font-bold text-primary">₹{mockResults.savings25Year.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Savings in 25 Years</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Monthly Generation Forecast</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="generation" fill="hsl(var(--success))" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-success/5">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-success" />
                    Environmental Impact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-bold text-success">{mockResults.co2Saved} tons</div>
                      <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-success">{mockResults.treesEquivalent}</div>
                      <div className="text-sm text-muted-foreground">Trees Equivalent</div>
                    </div>
                  </div>
                </Card>

                <Button className="w-full" size="lg">
                  Start Loan Application
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarSavingsPredictor;
