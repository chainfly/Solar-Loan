import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, TrendingUp, Zap, Calculator } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface DashboardProps {
  onBack: () => void;
}

const Dashboard = ({ onBack }: DashboardProps) => {
  // User inputs
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(10);
  const [solarCapacity, setSolarCapacity] = useState(3.5);
  const [systemCostPerKw, setSystemCostPerKw] = useState(71428); // ≈250000/3.5
  const [monthlyBill, setMonthlyBill] = useState(2000);
  const [state, setState] = useState("maharashtra");

  // Calculate subsidy based on PM Surya Ghar scheme
  const subsidy = useMemo(() => {
    if (solarCapacity <= 1) return 30000;
    if (solarCapacity <= 2) return 60000;
    return 78000; // 3+ kW
  }, [solarCapacity]);

  // Calculate EMI
  const monthlyEmi = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = loanTenure * 12;
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [loanAmount, interestRate, loanTenure]);

  // Calculate total interest and principal
  const totalPayment = monthlyEmi * loanTenure * 12;
  const totalInterest = totalPayment - loanAmount;

  // EMI Breakdown
  const emiBreakdownData = useMemo(() => [
    { name: "Principal", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Interest", value: totalInterest, color: "hsl(var(--secondary))" },
  ], [loanAmount, totalInterest]);

  // Calculate ROI data
  const roiData = useMemo(() => {
    const annualSavings = monthlyBill * 12;
    const data = [];
    let cumulative = 0;
    for (let year = 1; year <= 25; year++) {
      // Apply 0.5% degradation per year
      const degradation = Math.pow(0.995, year - 1);
      const yearSavings = Math.round(annualSavings * degradation);
      cumulative += yearSavings;
      if (year === 1 || year % 5 === 0) {
        data.push({ year: `Year ${year}`, savings: yearSavings, cumulative });
      }
    }
    return data;
  }, [monthlyBill]);

  // Monthly schedule for first 6 months
  const monthlyScheduleData = useMemo(() => {
    const r = interestRate / 12 / 100;
    let balance = loanAmount;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => {
      const interest = Math.round(balance * r);
      const principal = monthlyEmi - interest;
      balance -= principal;
      return { month, emi: monthlyEmi, principal, interest };
    });
  }, [loanAmount, interestRate, monthlyEmi]);

  // Energy production forecast (kWh per month)
  const energyProductionData = useMemo(() => {
    const baseProduction = solarCapacity * 120; // ~120 kWh per kW per month average
    const seasonalVariation = [0.7, 0.75, 0.87, 0.97, 1.03, 1.0, 0.97, 0.93, 0.9, 0.83, 0.75, 0.7];
    return [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ].map((month, i) => ({
      month,
      production: Math.round(baseProduction * seasonalVariation[i])
    }));
  }, [solarCapacity]);

  // Calculate ROI percentage
  const totalSystemCost = solarCapacity * systemCostPerKw;
  const effectiveCost = totalSystemCost - subsidy;
  const total25YearSavings = roiData[roiData.length - 1]?.cumulative || 0;
  const roiPercentage = Math.round((total25YearSavings / effectiveCost) * 100);
  const paybackYears = (effectiveCost / (monthlyBill * 12)).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Loan Calculation</h1>
              <p className="text-muted-foreground">Powered by ChainFly</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/journey-tracker'}>
                Track Status
              </Button>
              <Button className="gradient-solar">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Form */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Loan Parameters</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
              <Input
                id="loanTenure"
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="solarCapacity">Solar Capacity (kW)</Label>
              <Input
                id="solarCapacity"
                type="number"
                step="0.1"
                value={solarCapacity}
                onChange={(e) => setSolarCapacity(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="systemCost">System Cost per kW (₹)</Label>
              <Input
                id="systemCost"
                type="number"
                value={systemCostPerKw}
                onChange={(e) => setSystemCostPerKw(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="monthlyBill">Monthly Electricity Bill (₹)</Label>
              <Input
                id="monthlyBill"
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-primary/20 hover:shadow-strong transition-elegant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">System Details</p>
            </div>
            <p className="text-3xl font-bold">₹{loanAmount.toLocaleString("en-IN")}</p>
            <p className="text-sm text-muted-foreground mt-1">{solarCapacity} kW Solar System</p>
          </Card>

          <Card className="p-6 border-2 border-secondary/20 hover:shadow-strong transition-elegant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Monthly EMI</p>
            </div>
            <p className="text-3xl font-bold">₹{monthlyEmi.toLocaleString("en-IN")}</p>
            <p className="text-sm text-muted-foreground mt-1">{loanTenure} years @ {interestRate}%</p>
          </Card>

          <Card className="p-6 border-2 border-accent/20 hover:shadow-strong transition-elegant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">25-Year ROI</p>
            </div>
            <p className="text-3xl font-bold text-accent">{roiPercentage}%</p>
            <p className="text-sm text-muted-foreground mt-1">Payback: {paybackYears} years</p>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">EMI Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emiBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}k`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emiBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Monthly Payment Schedule</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyScheduleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                <Legend />
                <Line type="monotone" dataKey="principal" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="interest" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">25-Year ROI Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`} />
                <Legend />
                <Bar dataKey="cumulative" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Energy Production Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyProductionData}>
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value} kWh`} />
                <Area type="monotone" dataKey="production" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorProduction)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Subsidy Information */}
        <Card className="p-6 bg-gradient-hero border-2 border-accent/20">
          <h3 className="text-xl font-bold mb-4">Subsidy Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">PM Surya Ghar Subsidy</p>
              <p className="text-3xl font-bold text-accent mt-1">₹{subsidy.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground mt-1">{solarCapacity >= 3 ? "3+" : solarCapacity >= 2 ? "2" : "1"} kW system</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total System Cost</p>
              <p className="text-3xl font-bold text-primary mt-1">₹{totalSystemCost.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground mt-1">Before subsidy</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings (25 Years)</p>
              <p className="text-3xl font-bold text-secondary mt-1">₹{(total25YearSavings / 100000).toFixed(2)}L</p>
              <p className="text-sm text-muted-foreground mt-1">Energy bill savings</p>
            </div>
          </div>
        </Card>
        {/* Repayments & Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Repayments */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Easy Repayments</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Virtual Account Number (VAN)</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-mono font-bold">CFL8293847102</p>
                  <Button variant="ghost" size="sm" className="h-8">Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">IFSC: DECE0000123 • Bank: Yes Bank</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Pay via UPI</p>
                  <div className="flex gap-2">
                    <Input placeholder="Enter UPI ID" />
                    <Button>Pay</Button>
                  </div>
                </div>
                <div className="text-center px-4 border-l">
                  <div className="w-16 h-16 bg-white p-1 rounded border mx-auto mb-1">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full bg-black" />
                  </div>
                  <p className="text-xs text-muted-foreground">Scan to Pay</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-2 rounded">
                <Zap className="h-4 w-4" />
                <span>Instant settlement via Decentro Virtual Accounts</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activity (Real-time)</h3>
            <div className="space-y-4">
              {[
                { event: "EMI Payment Received", time: "2 mins ago", status: "success", amount: "₹6,847" },
                { event: "Statement Generated", time: "1 hour ago", status: "info", amount: "-" },
                { event: "Auto-Debit Scheduled", time: "Yesterday", status: "pending", amount: "₹6,847" },
                { event: "Subsidy Credit Received", time: "2 days ago", status: "success", amount: "₹78,000" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-success' :
                        activity.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                    <div>
                      <p className="font-medium text-sm">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono">{activity.amount}</span>
                </div>
              ))}
              <p className="text-xs text-center text-muted-foreground mt-2">
                Live updates powered by Decentro Webhooks
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
