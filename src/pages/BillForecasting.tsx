import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, Zap, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BillForecasting = () => {
  const [tariffInflation, setTariffInflation] = useState(8);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const forecastData = months.map((month, idx) => ({
    month,
    withoutSolar: 4500 + Math.sin(idx / 2) * 800 + (idx * tariffInflation * 5),
    withSolar: 800 + Math.sin(idx / 2) * 200,
    savings: 3700 - Math.sin(idx / 2) * 600 + (idx * tariffInflation * 5),
  }));

  const totalSavings = forecastData.reduce((acc, month) => acc + month.savings, 0);
  const avgWithoutSolar = forecastData.reduce((acc, m) => acc + m.withoutSolar, 0) / 12;
  const avgWithSolar = forecastData.reduce((acc, m) => acc + m.withSolar, 0) / 12;

  const bestMonth = forecastData.reduce((best, curr) =>
    curr.savings > best.savings ? curr : best
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Solar Bill Forecasting</h1>
          <p className="text-muted-foreground">
            Predict your electricity bills with and without solar
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <TrendingDown className="mx-auto h-8 w-8 text-success mb-2" />
            <div className="text-3xl font-bold text-success">₹{Math.round(totalSavings).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Annual Savings</div>
          </Card>

          <Card className="p-6 text-center">
            <Zap className="mx-auto h-8 w-8 text-primary mb-2" />
            <div className="text-3xl font-bold">₹{Math.round(avgWithSolar)}</div>
            <div className="text-sm text-muted-foreground">Avg Bill (with Solar)</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-destructive">₹{Math.round(avgWithoutSolar)}</div>
            <div className="text-sm text-muted-foreground">Avg Bill (without Solar)</div>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-primary mb-2" />
            <div className="text-2xl font-bold">{bestMonth.month}</div>
            <div className="text-sm text-muted-foreground">Best Month to Switch</div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-8">
          <Label className="mb-4 block">
            Electricity Tariff Inflation: {tariffInflation}% per year
          </Label>
          <Slider
            value={[tariffInflation]}
            onValueChange={(v) => setTariffInflation(v[0])}
            min={5}
            max={15}
            step={1}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground">
            Adjust to see how rising electricity prices impact your savings
          </p>
        </Card>

        {/* Chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">12-Month Bill Prediction</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="withoutSolar"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Without Solar"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="withSolar"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="With Solar"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Comparison Table */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Month-by-Month Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-right py-3 px-4">Without Solar</th>
                  <th className="text-right py-3 px-4">With Solar</th>
                  <th className="text-right py-3 px-4">Savings</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((data, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{data.month}</td>
                    <td className="text-right py-3 px-4 text-destructive">
                      ₹{Math.round(data.withoutSolar).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-primary">
                      ₹{Math.round(data.withSolar).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="default" className="bg-success">
                        ₹{Math.round(data.savings).toLocaleString()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insight Card */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="text-xl font-semibold mb-3">💡 Key Insights</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong className="text-foreground">Peak savings</strong> in {bestMonth.month}
              (₹{Math.round(bestMonth.savings).toLocaleString()}) due to high electricity demand
            </li>
            <li>
              • With {tariffInflation}% annual tariff inflation, your electricity bill would reach{" "}
              <strong className="text-foreground">
                ₹{Math.round(forecastData[11].withoutSolar).toLocaleString()}
              </strong>{" "}
              by December
            </li>
            <li>
              • Solar reduces your bill by an average of{" "}
              <strong className="text-foreground">
                {Math.round(((avgWithoutSolar - avgWithSolar) / avgWithoutSolar) * 100)}%
              </strong>
            </li>
            <li>
              • Best time to switch: <strong className="text-foreground">Now</strong> —
              every month delayed costs you ₹{Math.round(totalSavings / 12).toLocaleString()} in potential savings
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default BillForecasting;
