import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Zap, TrendingUp, Shield, BarChart3, FileCheck, User, LogOut } from "lucide-react";
import LoanApplicationForm from "@/components/loan/LoanApplicationForm";
import Dashboard from "@/components/dashboard/Dashboard";
import { authApi } from "@/lib/api";

const Index = () => {
  const [showApplication, setShowApplication] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getMe();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    navigate("/");
  };

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  if (showApplication) {
    return (
      <LoanApplicationForm
        onBack={() => setShowApplication(false)}
        onComplete={() => {
          setShowApplication(false);
          setShowDashboard(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>ChainFly</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/journey-tracker">
                  <Button variant="ghost">Check Status</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.full_name || "Profile"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-float">
              <Sun className="h-4 w-4" />
              <span>ChainFly AI-Powered Solar Financing</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Power Your Future with{" "}
              <span className="text-gradient-solar">Solar Energy</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant loan approval for your solar installation with ChainFly. AI-driven eligibility assessment,
              real-time subsidy calculation, and seamless KYC verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="gradient-solar text-lg h-14 px-8 shadow-strong hover:shadow-glow transition-elegant"
                onClick={() => setShowApplication(true)}
              >
                <Zap className="mr-2 h-5 w-5" />
                Apply for Solar Loan
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 border-2 hover:bg-primary/5 transition-elegant"
                onClick={() => setShowDashboard(true)}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Loan Calculator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground">
              Production-ready features powered by AI and advanced analytics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl gradient-solar flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Eligibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered credit scoring with XGBoost delivers loan decisions in under 10 minutes
                with 95%+ accuracy.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <FileCheck className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Automated KYC</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamless verification through Decentro API: Aadhaar XML, PAN, and bank account
                validation in real-time.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <TrendingUp className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">ROI Prediction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced ML models calculate 25-year ROI, payback period, and energy savings based
                on location and system specs.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl bg-warning flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <Sun className="h-7 w-7 text-warning-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Subsidies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatic calculation of PM Surya Ghar and state-level subsidies, maximizing your
                savings up to ₹78,000.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl gradient-solar flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                JWT authentication, bcrypt encryption, and AWS-managed secrets ensure your data
                is always protected.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-strong transition-elegant glass-effect border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl bg-success flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-elegant">
                <BarChart3 className="h-7 w-7 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive visualizations: EMI breakdown, amortization schedule, and
                energy production forecasts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-gradient-solar">&lt;50ms</div>
              <p className="text-muted-foreground">AI Inference Time</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-gradient-solar">99.9%</div>
              <p className="text-muted-foreground">System Uptime</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-gradient-solar">10min</div>
              <p className="text-muted-foreground">Approval Time</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-gradient-solar">95%+</div>
              <p className="text-muted-foreground">Subsidy Utilization</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Go Solar?
            </h2>
            <p className="text-xl text-muted-foreground">
              Start your application now and get instant eligibility results with ChainFly's AI-powered platform.
            </p>
            <Button
              size="lg"
              className="gradient-solar text-lg h-14 px-8 shadow-strong hover:shadow-glow transition-elegant"
              onClick={() => setShowApplication(true)}
            >
              <Sun className="mr-2 h-5 w-5" />
              Begin Application
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
