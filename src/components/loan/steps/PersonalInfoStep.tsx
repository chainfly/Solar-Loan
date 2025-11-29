import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const personalInfoSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters").max(100),
  age: z.number().min(21, "Must be at least 21 years old").max(70, "Must be under 70 years old"),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  address: z.string().min(10, "Address must be at least 10 characters").max(200),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  data: Partial<PersonalInfoData>;
  onNext: (data: PersonalInfoData) => void;
  onBack: () => void;
}

const PersonalInfoStep = ({ data, onNext }: PersonalInfoStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            {...register("fullName")}
            className="mt-1"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              {...register("age", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.age && (
              <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="10-digit mobile number"
              {...register("phone")}
              className="mt-1"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...register("email")}
            className="mt-1"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            placeholder="House no, Street, Locality"
            {...register("address")}
            className="mt-1"
          />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="City"
              {...register("city")}
              className="mt-1"
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="State"
              {...register("state")}
              className="mt-1"
            />
            {errors.state && (
              <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              placeholder="6-digit pincode"
              {...register("pincode")}
              className="mt-1"
            />
            {errors.pincode && (
              <p className="text-sm text-destructive mt-1">{errors.pincode.message}</p>
            )}
          </div>
        </div>
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

export default PersonalInfoStep;
