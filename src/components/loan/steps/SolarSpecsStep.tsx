import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const solarSpecsSchema = z.object({
  solarCapacity: z.number().min(1, "Minimum 1 kW").max(10, "Maximum 10 kW"),
  panelType: z.string().min(1, "Please select panel type"),
  roofArea: z.number().min(50, "Minimum 50 sq ft required").max(5000),
  roofType: z.string().min(1, "Please select roof type"),
  latitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(-90).max(90).optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(-180).max(180).optional()
  ),
});

type SolarSpecsData = z.infer<typeof solarSpecsSchema>;

interface SolarSpecsStepProps {
  data: Partial<SolarSpecsData>;
  onNext: (data: SolarSpecsData) => void;
  onBack: () => void;
}

const SolarSpecsStep = ({ data, onNext }: SolarSpecsStepProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SolarSpecsData>({
    resolver: zodResolver(solarSpecsSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="solarCapacity">Solar Capacity (kW) *</Label>
            <Input
              id="solarCapacity"
              type="number"
              step="0.1"
              placeholder="e.g., 3.5"
              {...register("solarCapacity", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.solarCapacity && (
              <p className="text-sm text-destructive mt-1">{errors.solarCapacity.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Range: 1-10 kW</p>
          </div>

          <div>
            <Label htmlFor="panelType">Panel Type *</Label>
            <Select
              onValueChange={(value) => setValue("panelType", value)}
              defaultValue={data.panelType}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select panel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monocrystalline">Monocrystalline (Higher Efficiency)</SelectItem>
                <SelectItem value="polycrystalline">Polycrystalline (Cost-Effective)</SelectItem>
                <SelectItem value="thin-film">Thin-Film (Flexible)</SelectItem>
                <SelectItem value="bifacial">Bifacial (Dual-Sided)</SelectItem>
              </SelectContent>
            </Select>
            {errors.panelType && (
              <p className="text-sm text-destructive mt-1">{errors.panelType.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roofArea">Roof Area (sq ft) *</Label>
            <Input
              id="roofArea"
              type="number"
              placeholder="e.g., 400"
              {...register("roofArea", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.roofArea && (
              <p className="text-sm text-destructive mt-1">{errors.roofArea.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Typical: 100 sq ft per kW
            </p>
          </div>

          <div>
            <Label htmlFor="roofType">Roof Type *</Label>
            <Select
              onValueChange={(value) => setValue("roofType", value)}
              defaultValue={data.roofType}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select roof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Roof</SelectItem>
                <SelectItem value="sloped">Sloped/Pitched Roof</SelectItem>
                <SelectItem value="metal">Metal Roof</SelectItem>
                <SelectItem value="tile">Tile Roof</SelectItem>
              </SelectContent>
            </Select>
            {errors.roofType && (
              <p className="text-sm text-destructive mt-1">{errors.roofType.message}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h3 className="font-semibold mb-4 text-lg">Location Coordinates (Optional)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Provide coordinates for precise solar irradiation calculations
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="e.g., 28.6139"
                {...register("latitude", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.latitude && (
                <p className="text-sm text-destructive mt-1">{errors.latitude.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="e.g., 77.2090"
                {...register("longitude", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.longitude && (
                <p className="text-sm text-destructive mt-1">{errors.longitude.message}</p>
              )}
            </div>
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

export default SolarSpecsStep;
