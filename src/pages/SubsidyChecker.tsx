import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SubsidyChecker = () => {
  const [formData, setFormData] = useState({
    propertyType: "",
    state: "",
    previousSubsidy: "",
    mnreApproved: "",
    connectionType: "",
  });
  const [showResults, setShowResults] = useState(false);

  const subsidyData = {
    central: 78000,
    state: 15000,
    total: 93000,
    likelihood: "High",
    documents: [
      "Property ownership proof",
      "Electricity bill (last 3 months)",
      "Aadhaar card",
      "Bank account details",
      "MNRE-approved installer certificate",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Subsidy Eligibility Checker</h1>
          <p className="text-muted-foreground">
            Check your eligibility for PM Surya Ghar and state subsidies
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Answer a few questions</h2>

          <div className="space-y-6">
            <div>
              <Label>Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">
                Have you claimed a solar subsidy before?
              </Label>
              <RadioGroup
                value={formData.previousSubsidy}
                onValueChange={(value) => setFormData({ ...formData, previousSubsidy: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="subsidy-yes" />
                  <Label htmlFor="subsidy-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="subsidy-no" />
                  <Label htmlFor="subsidy-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block">
                Is your installer MNRE-approved?
              </Label>
              <RadioGroup
                value={formData.mnreApproved}
                onValueChange={(value) => setFormData({ ...formData, mnreApproved: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mnre-yes" />
                  <Label htmlFor="mnre-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mnre-no" />
                  <Label htmlFor="mnre-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block">
                Electricity connection type
              </Label>
              <RadioGroup
                value={formData.connectionType}
                onValueChange={(value) => setFormData({ ...formData, connectionType: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="residential" id="conn-res" />
                  <Label htmlFor="conn-res">Residential</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="commercial" id="conn-com" />
                  <Label htmlFor="conn-com">Commercial</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button onClick={() => setShowResults(true)} className="w-full mt-6" size="lg">
            Check Eligibility
          </Button>
        </Card>

        {showResults && (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <Badge className="mb-4" variant="default">
                {subsidyData.likelihood} Likelihood
              </Badge>
              <div className="text-5xl font-bold text-success mb-2">
                ₹{subsidyData.total.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Subsidy Eligible</div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Subsidy Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">PM Surya Ghar (Central)</div>
                    <div className="text-sm text-muted-foreground">For 3+ kW system</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{subsidyData.central.toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">State Subsidy (Maharashtra)</div>
                    <div className="text-sm text-muted-foreground">Additional benefit</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{subsidyData.state.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Required Documents
              </h3>
              <ul className="space-y-3">
                {subsidyData.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Important Note</h4>
                  <p className="text-sm text-muted-foreground">
                    Subsidy disbursement typically takes 60-90 days after installation and inspection.
                    Ensure all documents are submitted correctly to avoid delays.
                  </p>
                </div>
              </div>
            </Card>

            <Button className="w-full" size="lg">
              Apply for Subsidy with ChainFly
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubsidyChecker;
