import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const financialInfoSchema = z.object({
  annualIncome: z.number().min(100000, "Minimum annual income: ₹1,00,000"),
  monthlyExpenses: z.number().min(0),
  existingEMIs: z.number().min(0),
  loanAmount: z.number().min(50000, "Minimum loan: ₹50,000").max(10000000, "Maximum loan: ₹1,00,00,000"),
  loanTenure: z.number().min(1, "Minimum 1 year").max(25, "Maximum 25 years"),
});

type FinancialInfoData = z.infer<typeof financialInfoSchema>;

interface FinancialInfoStepProps {
  data: Partial<FinancialInfoData>;
  onNext: (data: FinancialInfoData) => void;
  onBack: () => void;
}

const FinancialInfoStep = ({ data, onNext }: FinancialInfoStepProps) => {
  const [emiAmount, setEmiAmount] = useState<number>(0);
  const [subsidy, setSubsidy] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinancialInfoData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: data,
  });

  const loanAmount = watch("loanAmount");
  const loanTenure = watch("loanTenure");

  // Calculate EMI and subsidy in real-time
  useEffect(() => {
    if (loanAmount && loanTenure) {
      // EMI Calculation: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
      const principal = loanAmount;
      const annualRate = 8.5; // 8.5% interest rate
      const monthlyRate = annualRate / 12 / 100;
      const months = loanTenure * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
      
      setEmiAmount(Math.round(emi));

      // Subsidy calculation (PM Surya Ghar)
      const capacity = loanAmount / 70000; // Rough estimate: ₹70k per kW
      let subsidyAmount = 0;
      if (capacity <= 1) {
        subsidyAmount = 30000;
      } else if (capacity <= 2) {
        subsidyAmount = 60000;
      } else {
        subsidyAmount = 78000;
      }
      setSubsidy(subsidyAmount);
    }
  }, [loanAmount, loanTenure]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="annualIncome">Annual Income (₹) *</Label>
          <Input
            id="annualIncome"
            type="number"
            placeholder="e.g., 800000"
            {...register("annualIncome", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.annualIncome && (
            <p className="text-sm text-destructive mt-1">{errors.annualIncome.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyExpenses">Monthly Expenses (₹) *</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              placeholder="e.g., 25000"
              {...register("monthlyExpenses", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.monthlyExpenses && (
              <p className="text-sm text-destructive mt-1">{errors.monthlyExpenses.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="existingEMIs">Existing EMIs (₹) *</Label>
            <Input
              id="existingEMIs"
              type="number"
              placeholder="e.g., 15000"
              {...register("existingEMIs", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.existingEMIs && (
              <p className="text-sm text-destructive mt-1">{errors.existingEMIs.message}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h3 className="font-semibold mb-4 text-lg">Loan Requirements</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="e.g., 250000"
                {...register("loanAmount", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.loanAmount && (
                <p className="text-sm text-destructive mt-1">{errors.loanAmount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="loanTenure">Loan Tenure (Years) *</Label>
              <Input
                id="loanTenure"
                type="number"
                placeholder="e.g., 10"
                {...register("loanTenure", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.loanTenure && (
                <p className="text-sm text-destructive mt-1">{errors.loanTenure.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Calculations */}
        {loanAmount > 0 && loanTenure > 0 && (
          <div className="bg-gradient-hero rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Instant Calculations</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4 border-2 border-primary/20">
                <p className="text-sm text-muted-foreground">Monthly EMI @ 8.5%</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  ₹{emiAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 border-2 border-accent/20">
                <p className="text-sm text-muted-foreground">PM Surya Ghar Subsidy</p>
                <p className="text-3xl font-bold text-accent mt-1">
                  ₹{subsidy.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 border-2 border-secondary/20">
              <p className="text-sm text-muted-foreground">Effective Loan Amount (After Subsidy)</p>
              <p className="text-3xl font-bold text-secondary mt-1">
                ₹{(loanAmount - subsidy).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="gradient-solar">
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default FinancialInfoStep;
