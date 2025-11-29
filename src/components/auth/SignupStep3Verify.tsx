import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import OtpInput from "./OtpInput";
import { Mail } from "lucide-react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Props {
  data: { email?: string };
  onNext: (data?: any) => void;
  onBack: () => void;
}

const SignupStep3Verify = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!data.email) {
      toast({
        title: "Error",
        description: "Email not found. Please start over.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyEmail(data.email, otp);
      
      if (response.error) {
        toast({
          title: "Verification Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Verified!",
          description: "Welcome to ChainFly",
        });
        // Navigate to login or dashboard
        navigate("/auth/login");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!data.email) {
      toast({
        title: "Error",
        description: "Email not found",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await authApi.resendVerification(data.email);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setCanResend(false);
        setCountdown(30);
        toast({
          title: "OTP Resent",
          description: "Check your email for the new code",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Verify Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium">{data.email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <OtpInput value={otp} onChange={setOtp} length={6} />

        <Button
          onClick={handleVerify}
          className="w-full"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={!canResend || isResending}
            className="text-sm"
          >
            {isResending
              ? "Sending..."
              : canResend
              ? "Resend OTP"
              : `Resend in ${countdown}s`}
          </Button>
        </div>
      </div>

      <Button type="button" variant="outline" onClick={onBack} className="w-full">
        Back
      </Button>
    </div>
  );
};

export default SignupStep3Verify;
