import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignupStep1Account from "@/components/auth/SignupStep1Account";
import SignupStep2Profile from "@/components/auth/SignupStep2Profile";
import SignupStep3Verify from "@/components/auth/SignupStep3Verify";
import { authApi } from "@/lib/api";

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  dob?: string;
  role: "customer" | "installer";
}

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    role: "customer",
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const steps = [
    { number: 1, title: "Account", component: SignupStep1Account },
    { number: 2, title: "Profile", component: SignupStep2Profile },
    { number: 3, title: "Verify", component: SignupStep3Verify },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / steps.length) * 100;

  const handleNext = async (stepData?: Partial<SignupFormData>) => {
    const updatedFormData = stepData ? { ...formData, ...stepData } : formData;
    if (stepData) {
      setFormData(updatedFormData);
    }
    
    // If moving from step 2 to step 3, register the user first
    if (currentStep === 2) {
      const finalData = { ...formData, ...stepData };
      
      if (!finalData.email || !finalData.password || !finalData.fullName || !finalData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      setIsRegistering(true);
      try {
        const response = await authApi.register({
          email: finalData.email,
          password: finalData.password,
          full_name: finalData.fullName,
          phone: finalData.phone,
        });
        
        if (response.error) {
          toast({
            title: "Registration Failed",
            description: response.error || "Please check if the backend server is running",
            variant: "destructive",
          });
          setIsRegistering(false);
          return;
        }
        
        if (!response.data) {
          toast({
            title: "Registration Failed",
            description: "No response from server. Please try again.",
            variant: "destructive",
          });
          setIsRegistering(false);
          return;
        }
        
        // Registration successful, move to verification step
        toast({
          title: "Registration Successful",
          description: "Please check your email for the verification code",
        });
        setFormData(finalData);
        setCurrentStep(3);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to register. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRegistering(false);
      }
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete signup
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-lg p-8 shadow-strong">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
            <Sun className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Join ChainFly</h1>
          <p className="text-muted-foreground mt-2">Create your solar loan account</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div key={step.number} className="text-xs font-medium">
                Step {step.number}: {step.title}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <CurrentStepComponent
          data={formData}
          onNext={handleNext}
          onBack={handleBack}
        />
      </Card>
    </div>
  );
};

export default Signup;
