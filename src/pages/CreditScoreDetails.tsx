import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Download, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CreditScoreDetails = () => {
  const scoreData = {
    current: 728,
    previous: 695,
    grade: "Good",
    percentile: 72,
    lastUpdated: "Nov 10, 2025",
  };

  const factors = {
    positive: [
      { factor: "No payment defaults", impact: "+45 points" },
      { factor: "Low credit utilization (28%)", impact: "+32 points" },
      { factor: "Long credit history (8 years)", impact: "+28 points" },
    ],
    negative: [
      { factor: "Recent credit inquiries (3)", impact: "-18 points" },
      { factor: "High total debt-to-income ratio", impact: "-12 points" },
    ],
  };

  const improvements = [
    "Pay down existing credit card balances to below 20% utilization",
    "Avoid new credit applications for the next 6 months",
    "Set up auto-pay for all existing EMIs to avoid missed payments",
    "Consider closing unused credit cards (only if older than 2 years)",
  ];

  const historyData = [
    { month: "May", score: 682 },
    { month: "Jun", score: 688 },
    { month: "Jul", score: 695 },
    { month: "Aug", score: 702 },
    { month: "Sep", score: 715 },
    { month: "Oct", score: 720 },
    { month: "Nov", score: 728 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-success";
    if (score >= 650) return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Credit Score Analysis</h1>
          <p className="text-muted-foreground">
            Understand your credit profile and how to improve it
          </p>
        </div>

        {/* Score Overview */}
        <Card className="p-8 mb-6 text-center">
          <div className={`text-7xl font-bold mb-2 ${getScoreColor(scoreData.current)}`}>
            {scoreData.current}
          </div>
          <Badge variant="default" className="mb-4">
            {scoreData.grade}
          </Badge>
          <p className="text-muted-foreground mb-2">
            Better than {scoreData.percentile}% of consumers
          </p>
          <div className="flex items-center justify-center gap-2 text-success">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">+{scoreData.current - scoreData.previous} points</span>
            <span className="text-muted-foreground text-sm">since last check</span>
          </div>
          <div className="mt-4">
            <Progress value={scoreData.percentile} className="h-3" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {scoreData.lastUpdated}
          </p>
        </Card>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-success" />
              Positive Factors
            </h3>
            <ul className="space-y-3">
              {factors.positive.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.factor}</div>
                    <div className="text-sm text-success">{item.impact}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Areas to Improve
            </h3>
            <ul className="space-y-3">
              {factors.negative.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.factor}</div>
                    <div className="text-sm text-destructive">{item.impact}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Score History */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Score Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[650, 750]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">How to Improve Your Score</h3>
          <div className="space-y-4">
            {improvements.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {idx + 1}
                </div>
                <p className="flex-1 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Loan Terms Impact */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 mb-6">
          <h3 className="text-xl font-semibold mb-3">Impact on Your Loan</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl font-bold text-primary">9.5%</div>
              <div className="text-sm text-muted-foreground">Interest Rate Offered</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl font-bold text-success">₹3,50,000</div>
              <div className="text-sm text-muted-foreground">Max Loan Amount</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl font-bold">60 months</div>
              <div className="text-sm text-muted-foreground">Recommended Tenure</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            💡 Improving your score to 750+ could reduce your interest rate by up to 1.5% and save you
            ₹18,000 over the loan tenure.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button className="flex-1">
            Continue to Loan Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreDetails;
