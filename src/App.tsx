import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import SolarSavingsPredictor from "./pages/SolarSavingsPredictor";
import SystemSizeRecommendation from "./pages/SystemSizeRecommendation";
import EligibilityAdvisor from "./pages/EligibilityAdvisor";
import EMIComparison from "./pages/EMIComparison";
import SubsidyChecker from "./pages/SubsidyChecker";
import JourneyTracker from "./pages/JourneyTracker";
import Dashboard from "./pages/Dashboard";
import PostInstallationDashboard from "./pages/PostInstallationDashboard";
import RoofAnalyzer from "./pages/RoofAnalyzer";
import CreditScoreDetails from "./pages/CreditScoreDetails";
import InstallationPrep from "./pages/InstallationPrep";
import PackageComparison from "./pages/PackageComparison";
import BillForecasting from "./pages/BillForecasting";
import PersonalizedTips from "./pages/PersonalizedTips";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/solar-predictor" element={<SolarSavingsPredictor />} />
          <Route path="/system-recommendation" element={<SystemSizeRecommendation />} />
          <Route path="/eligibility-advisor" element={<EligibilityAdvisor />} />
          <Route path="/emi-comparison" element={<EMIComparison />} />
          <Route path="/subsidy-checker" element={<SubsidyChecker />} />
          <Route path="/journey-tracker" element={<JourneyTracker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/performance" element={<PostInstallationDashboard />} />
          <Route path="/roof-analyzer" element={<RoofAnalyzer />} />
          <Route path="/credit-score" element={<CreditScoreDetails />} />
          <Route path="/installation-prep" element={<InstallationPrep />} />
          <Route path="/packages" element={<PackageComparison />} />
          <Route path="/bill-forecast" element={<BillForecasting />} />
          <Route path="/tips" element={<PersonalizedTips />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
