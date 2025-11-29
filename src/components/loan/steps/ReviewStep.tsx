import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { FormData } from "../LoanApplicationForm";

interface ReviewStepProps {
  data: Partial<FormData>;
  onNext: () => void;
  onBack: () => void;
}

const ReviewStep = ({ data, onNext }: ReviewStepProps) => {
  // Simulate AI eligibility score
  const eligibilityScore = 87;
  const creditDecision = eligibilityScore >= 70 ? "Approved" : eligibilityScore >= 50 ? "Review" : "Rejected";
  
  // Calculate ROI
  const capacity = data.solarCapacity || 0;
  const annualSavings = capacity * 1500 * 5.5 * 365 / 1000; // Rough calculation
  const paybackPeriod = ((data.loanAmount || 0) / annualSavings).toFixed(1);
  const roi25Year = ((annualSavings * 25 - (data.loanAmount || 0)) / (data.loanAmount || 0) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* AI Eligibility Assessment */}
      <Card className="p-6 bg-gradient-hero border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">AI Eligibility Assessment</h3>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground">Credit Score</p>
                <p className="text-3xl font-bold text-primary mt-1">{eligibilityScore}/100</p>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground">Decision</p>
                <p className={`text-3xl font-bold mt-1 ${
                  creditDecision === "Approved" ? "text-success" : 
                  creditDecision === "Review" ? "text-warning" : "text-destructive"
                }`}>
                  {creditDecision}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-3xl font-bold text-accent mt-1">&lt;50ms</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ROI Prediction */}
      <Card className="p-6 border-2 border-accent/20">
        <h3 className="text-xl font-bold mb-4">25-Year ROI Prediction</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Payback Period</p>
            <p className="text-2xl font-bold text-primary mt-1">{paybackPeriod} years</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total ROI</p>
            <p className="text-2xl font-bold text-accent mt-1">{roi25Year}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Annual Savings</p>
            <p className="text-2xl font-bold text-secondary mt-1">₹{annualSavings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </Card>

      {/* Application Summary */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Application Summary</h3>
        <div className="space-y-4">
          <SummarySection title="Personal Information">
            <SummaryItem label="Name" value={data.fullName} />
            <SummaryItem label="Age" value={data.age} />
            <SummaryItem label="Email" value={data.email} />
            <SummaryItem label="Phone" value={data.phone} />
            <SummaryItem label="Location" value={`${data.city}, ${data.state}`} />
          </SummarySection>

          <SummarySection title="Solar Specifications">
            <SummaryItem label="Capacity" value={`${data.solarCapacity} kW`} />
            <SummaryItem label="Panel Type" value={data.panelType} />
            <SummaryItem label="Roof Area" value={`${data.roofArea} sq ft`} />
            <SummaryItem label="Roof Type" value={data.roofType} />
          </SummarySection>

          <SummarySection title="Financial Details">
            <SummaryItem label="Annual Income" value={`₹${data.annualIncome?.toLocaleString("en-IN")}`} />
            <SummaryItem label="Loan Amount" value={`₹${data.loanAmount?.toLocaleString("en-IN")}`} />
            <SummaryItem label="Loan Tenure" value={`${data.loanTenure} years`} />
            <SummaryItem label="Monthly EMI" value={`₹${calculateEMI(data.loanAmount || 0, data.loanTenure || 0).toLocaleString("en-IN")}`} />
          </SummarySection>

          <SummarySection title="Documents">
            <SummaryItem label="Aadhaar" value={data.aadhaarFile ? "✓ Uploaded" : "Not uploaded"} />
            <SummaryItem label="PAN" value={data.panFile ? "✓ Uploaded" : "Not uploaded"} />
            <SummaryItem label="Bank Statement" value={data.bankStatementFile ? "✓ Uploaded" : "Optional"} />
            <SummaryItem label="Salary Slips" value={data.salarySlipFile ? "✓ Uploaded" : "Optional"} />
          </SummarySection>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gradient-solar text-lg px-8 h-12">
          <Check className="mr-2 h-5 w-5" />
          Submit Application
        </Button>
      </div>
    </div>
  );
};

const SummarySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b pb-4 last:border-b-0">
    <h4 className="font-semibold mb-3 text-primary">{title}</h4>
    <div className="grid md:grid-cols-2 gap-3">
      {children}
    </div>
  </div>
);

const SummaryItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || "N/A"}</p>
  </div>
);

const calculateEMI = (principal: number, years: number): number => {
  const monthlyRate = 8.5 / 12 / 100;
  const months = years * 12;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

export default ReviewStep;
