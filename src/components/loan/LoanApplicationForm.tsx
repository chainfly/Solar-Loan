import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import SolarSpecsStep from "./steps/SolarSpecsStep";
import FinancialInfoStep from "./steps/FinancialInfoStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import ReviewStep from "./steps/ReviewStep";
import { useToast } from "@/hooks/use-toast";

interface LoanApplicationFormProps {
  onBack: () => void;
  onComplete: () => void;
}

export interface FormData {
  // Personal Info
  fullName: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Solar Specs
  solarCapacity: number;
  panelType: string;
  roofArea: number;
  roofType: string;
  latitude?: number;
  longitude?: number;

  // Financial Info
  annualIncome: number;
  monthlyExpenses: number;
  existingEMIs: number;
  loanAmount: number;
  loanTenure: number;

  // Documents
  aadhaarFile?: File;
  panFile?: File;
  bankStatementFile?: File;
  salarySlipFile?: File;
}

const LoanApplicationForm = ({ onBack, onComplete }: LoanApplicationFormProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const steps = [
    { number: 1, title: "Personal Info", component: PersonalInfoStep },
    { number: 2, title: "Solar Specs", component: SolarSpecsStep },
    { number: 3, title: "Financial Info", component: FinancialInfoStep },
    { number: 4, title: "Documents", component: DocumentUploadStep },
    { number: 5, title: "Review", component: ReviewStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / steps.length) * 100;

  const handleNext = (stepData: Partial<FormData>) => {
    setFormData({ ...formData, ...stepData });

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast({
        title: "Progress Saved",
        description: "Your information has been saved. Continue to the next step.",
      });
    } else {
      // Final submission
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    // Simulate API call
    toast({
      title: "Application Submitted!",
      description: "Processing your loan application with AI eligibility assessment...",
    });

    // Simulate processing delay
    setTimeout(() => {
      toast({
        title: "Instant Verification Complete! ✓",
        description: "Identity & Income verified via Decentro. Loan approved instantly.",
      });
      onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Back to Home" : "Previous Step"}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">ChainFly Solar Loan Application</h1>
              <p className="text-muted-foreground mt-1">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Powered by Decentro
                </span>
                <span className="text-xs text-muted-foreground">Instant KYC & Bank Verification</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${currentStep > step.number
                    ? "bg-success text-success-foreground"
                    : currentStep === step.number
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className="text-xs mt-2 text-center font-medium hidden sm:block">
                {step.title}
              </div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="p-8 shadow-strong">
          <CurrentStepComponent
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </Card>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
