import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMIComparison = () => {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [tenure, setTenure] = useState(60);
  const [interestRate, setInterestRate] = useState(10.5);
  const [downPayment, setDownPayment] = useState(50000);
  const [includeSubsidy, setIncludeSubsidy] = useState(true);

  const subsidy = 78000;
  const effectiveLoan = includeSubsidy ? loanAmount - subsidy : loanAmount;
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round(
    (effectiveLoan * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );
  const totalInterest = emi * tenure - effectiveLoan;
  const totalPayment = emi * tenure;

  const scenarios = [
    { tenure: 36, rate: 9.5, emi: 10234 },
    { tenure: 60, rate: 10.5, emi: 6847, best: true },
    { tenure: 84, rate: 11.5, emi: 5423 },
  ];

  const chartData = Array.from({ length: Math.min(tenure, 12) }, (_, i) => ({
    month: i + 1,
    principal: Math.round(effectiveLoan / tenure),
    interest: Math.round(totalInterest / tenure),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">EMI Comparison & Smart Optimizer</h1>
          <p className="text-muted-foreground">
            Compare loan scenarios and find the best EMI plan for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Inputs Panel */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-6">Loan Parameters</h2>

            <div className="space-y-6">
              <div>
                <Label>Loan Amount: ₹{loanAmount.toLocaleString()}</Label>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(v) => setLoanAmount(v[0])}
                  min={50000}
                  max={1000000}
                  step={10000}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Tenure: {tenure} months</Label>
                <Slider
                  value={[tenure]}
                  onValueChange={(v) => setTenure(v[0])}
                  min={12}
                  max={120}
                  step={12}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Interest Rate: {interestRate}%</Label>
                <Slider
                  value={[interestRate]}
                  onValueChange={(v) => setInterestRate(v[0])}
                  min={7}
                  max={15}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Down Payment: ₹{downPayment.toLocaleString()}</Label>
                <Slider
                  value={[downPayment]}
                  onValueChange={(v) => setDownPayment(v[0])}
                  min={0}
                  max={200000}
                  step={5000}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Include Subsidy (₹78,000)</Label>
                <Switch checked={includeSubsidy} onCheckedChange={setIncludeSubsidy} />
              </div>
            </div>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-3xl font-bold text-primary">₹{emi.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Monthly EMI</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">₹{totalInterest.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Interest</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">₹{totalPayment.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Payment</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">EMI Breakdown Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="principal" stroke="hsl(var(--primary))" name="Principal" />
                  <Line type="monotone" dataKey="interest" stroke="hsl(var(--destructive))" name="Interest" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Smart Optimizer Recommendations
              </h3>
              <div className="space-y-3">
                {scenarios.map((scenario, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${scenario.best ? "border-primary bg-primary/5" : "border-border"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">
                          {scenario.tenure} months @ {scenario.rate}% p.a.
                          {scenario.best && (
                            <Badge className="ml-2" variant="default">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total: ₹{(scenario.emi * scenario.tenure).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">₹{scenario.emi.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                The 5-year tenure offers the best balance between affordable EMI and total interest paid.
                Consider opting for subsidy to reduce your loan burden by ₹78,000.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMIComparison;
