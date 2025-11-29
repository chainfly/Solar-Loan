import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, Upload, FileCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const DocumentUploadStep = ({ data, onNext }: DocumentUploadStepProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState({
    aadhaarFile: data.aadhaarFile || null,
    panFile: data.panFile || null,
    bankStatementFile: data.bankStatementFile || null,
    salarySlipFile: data.salarySlipFile || null,
  });

  const handleFileChange = (field: string, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setFiles({ ...files, [field]: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.aadhaarFile || !files.panFile) {
      toast({
        title: "Missing Documents",
        description: "Aadhaar and PAN are mandatory documents",
        variant: "destructive",
      });
      return;
    }

    onNext(files);
  };

  const FileUploadField = ({
    label,
    field,
    required = false,
  }: {
    label: string;
    field: string;
    required?: boolean;
  }) => {
    const file = files[field as keyof typeof files];

    return (
      <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <Label className="text-base font-semibold">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange(field, null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {file ? (
          <div className="flex items-center gap-3 bg-accent/10 rounded-lg p-3">
            <FileCheck className="h-8 w-8 text-accent" />
            <div className="flex-1">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <Input
              type="file"
              accept=".pdf,.xml,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
              className="hidden"
              id={field}
            />
            <Label
              htmlFor={field}
              className="cursor-pointer text-primary hover:underline"
            >
              Click to upload
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, XML, JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">KYC Document Requirements</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Aadhaar Card (XML format preferred for offline verification)</li>
          <li>• PAN Card (for credit verification)</li>
          <li>• Bank Statement (last 6 months, optional)</li>
          <li>• Salary Slips (last 3 months, optional)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <FileUploadField label="Aadhaar Card" field="aadhaarFile" required />
        <FileUploadField label="PAN Card" field="panFile" required />
        <FileUploadField label="Bank Statement (Last 6 Months)" field="bankStatementFile" />
        <FileUploadField label="Salary Slips (Last 3 Months)" field="salarySlipFile" />
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-accent" />
          Automated KYC Verification
        </h4>
        <p className="text-sm text-muted-foreground">
          Your documents will be verified through Decentro API with:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>• Aadhaar XML offline verification with UIDAI</li>
          <li>• PAN verification with 80%+ name matching</li>
          <li>• Bank account verification via Pennyless method</li>
          <li>• Real-time processing in under 2 minutes</li>
        </ul>
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

export default DocumentUploadStep;
