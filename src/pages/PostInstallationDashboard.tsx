import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, Leaf, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PostInstallationDashboard = () => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    generation: 280 + Math.random() * 80,
    savings: 2400 + Math.random() * 600,
  }));

  const stats = {
    thisMonth: {
      generation: 342,
      savings: 2890,
      co2Saved: 0.28,
    },
    cumulative: {
      generation: 2850,
      savings: 24500,
      co2Saved: 2.35,
    },
    emiProgress: 18,
    systemHealth: 98,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Solar Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Track your solar system performance and savings
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.thisMonth.generation} kWh</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
            <Badge variant="default" className="bg-success">+12% vs last month</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">₹{stats.thisMonth.savings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Savings</div>
              </div>
            </div>
            <Badge variant="secondary">₹{stats.cumulative.savings.toLocaleString()} total</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{stats.thisMonth.co2Saved} tons</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </div>
            </div>
            <Badge variant="secondary">{stats.cumulative.co2Saved} tons total</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                <div className="text-sm text-muted-foreground">System Health</div>
              </div>
            </div>
            <Badge variant="default">Excellent</Badge>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Monthly Generation</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="generation" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Monthly Savings</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="savings" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* EMI Progress */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">EMI Payment Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Paid: 18 / 60 months</span>
              <span className="font-semibold">30% Complete</span>
            </div>
            <Progress value={stats.emiProgress * (100 / 60)} />
            <div className="text-sm text-muted-foreground">
              Next payment due: Dec 15, 2025 • ₹6,847
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Panel Cleaning Reminder</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  It's been 45 days since your last cleaning. Clean panels generate 8-10% more power.
                </p>
                <Button size="sm" variant="outline">
                  Schedule Cleaning
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Subsidy Status</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your subsidy application is approved! ₹78,000 will be disbursed within 15 days.
                </p>
                <Badge variant="default" className="bg-success">Approved</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">This Month's Performance Summary</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Your solar system performed <strong className="text-foreground">exceptionally well</strong> this month,
              generating <strong className="text-foreground">342 kWh</strong> of clean energy. This is 12% higher
              than last month, saving you <strong className="text-foreground">₹2,890</strong> on electricity bills.
            </p>
            <p className="text-muted-foreground mt-3">
              Weather conditions were optimal with <strong className="text-foreground">8.2 peak sun hours daily</strong>.
              Your system is operating at <strong className="text-foreground">98% efficiency</strong>—great job maintaining it!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostInstallationDashboard;
