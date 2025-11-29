import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EligibilityAdvisor = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeRange: "",
    city: "",
    loanAmount: "",
    employmentType: "",
    existingEMI: "",
  });
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { num: 1, title: "Income Details" },
    { num: 2, title: "Location & Loan" },
    { num: 3, title: "Employment & EMI" },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  };

  const approvalData = {
    likelihood: "High",
    score: 82,
    recommendedAmount: 250000,
    emiRange: { min: 6800, max: 8500 },
    tips: [
      "Your credit profile is strong. Consider a co-applicant to increase loan amount.",
      "Adding bank statements for the last 6 months will expedite approval.",
      "Your existing EMI-to-income ratio is healthy at 28%.",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Loan Eligibility Advisor</h1>
          <p className="text-muted-foreground">
            Get personalized loan recommendations based on your profile
          </p>
        </div>

        {!showResults ? (
          <Card className="p-6">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((s) => (
                  <div key={s.num} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {s.num}
                    </div>
                    <span className="ml-2 text-sm hidden sm:inline">{s.title}</span>
                  </div>
                ))}
              </div>
              <Progress value={(step / 3) * 100} />
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Income Details</h2>
                <div>
                  <Label>Annual Income Range</Label>
                  <Select
                    value={formData.incomeRange}
                    onValueChange={(value) =>
                      setFormData({ ...formData, incomeRange: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below3">Below ₹3 Lakhs</SelectItem>
                      <SelectItem value="3to6">₹3 - ₹6 Lakhs</SelectItem>
                      <SelectItem value="6to10">₹6 - ₹10 Lakhs</SelectItem>
                      <SelectItem value="above10">Above ₹10 Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Location & Loan Details</h2>
                <div>
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Approximate Loan Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 300000"
                    value={formData.loanAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, loanAmount: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Employment & EMI</h2>
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employmentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried</SelectItem>
                      <SelectItem value="selfEmployed">Self-Employed</SelectItem>
                      <SelectItem value="business">Business Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Existing Monthly EMIs (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 8000"
                    value={formData.existingEMI}
                    onChange={(e) =>
                      setFormData({ ...formData, existingEMI: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                {step === 3 ? "See Results" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <Badge className="mb-4" variant={approvalData.likelihood === "High" ? "default" : "secondary"}>
                {approvalData.likelihood} Approval Likelihood
              </Badge>
              <div className="mb-4">
                <div className="text-5xl font-bold text-primary mb-2">{approvalData.score}%</div>
                <div className="text-muted-foreground">Eligibility Score</div>
              </div>
              <Progress value={approvalData.score} className="h-3" />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recommended Loan Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Recommended Amount</span>
                  <span className="font-bold text-lg">₹{approvalData.recommendedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">EMI Range</span>
                  <span className="font-bold text-lg">
                    ₹{approvalData.emiRange.min.toLocaleString()} - ₹{approvalData.emiRange.max.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-success" />
                Tips to Improve Approval
              </h3>
              <ul className="space-y-3">
                {approvalData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Button className="w-full" size="lg">
              Begin Full Application
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityAdvisor;
