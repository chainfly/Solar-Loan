import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Layers, Sun, AlertTriangle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const RoofAnalyzer = () => {
  const { toast } = useToast();
  const [hasPhoto, setHasPhoto] = useState(false);
  const [roofType, setRoofType] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handlePhotoUpload = () => {
    setHasPhoto(true);
    toast({
      title: "Photo Uploaded!",
      description: "AI analysis in progress...",
    });
    setTimeout(() => setShowAnalysis(true), 2000);
  };

  const analysis = {
    optimalAngle: 18,
    orientation: "South-facing",
    usableArea: 385,
    shadingIssues: ["North-east corner: 15% shading from tree"],
    panelLayout: "12 panels in 3x4 configuration",
    efficiency: 94,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">AI Roof Analyzer</h1>
          <p className="text-muted-foreground">
            Upload a roof photo for intelligent panel placement recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Roof Photo</h2>

            {!hasPhoto ? (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop your roof photo here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Or click to browse (JPG, PNG up to 10MB)
                </p>
                <Button onClick={handlePhotoUpload}>
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                  alt="Roof"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Badge className="absolute top-2 right-2 bg-success">
                  Analyzed
                </Badge>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold mb-4">Or enter details manually</h3>
              <div className="space-y-4">
                <div>
                  <Label>Roof Type</Label>
                  <Select value={roofType} onValueChange={setRoofType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat RCC</SelectItem>
                      <SelectItem value="sloped">Sloped Tile</SelectItem>
                      <SelectItem value="metal">Metal Sheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {roofType && !hasPhoto && (
                  <Button
                    onClick={() => setShowAnalysis(true)}
                    className="w-full"
                  >
                    Calculate Optimal Angle
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            {!showAnalysis ? (
              <Card className="p-8 text-center">
                <Layers className="mx-auto h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Analysis Ready</h3>
                <p className="text-muted-foreground">
                  Upload a photo or select roof type to get personalized recommendations
                </p>
              </Card>
            ) : (
              <>
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sun className="h-6 w-6 text-primary" />
                    Optimal Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Tilt Angle</span>
                      <span className="font-bold text-lg">{analysis.optimalAngle}°</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Orientation</span>
                      <span className="font-bold">{analysis.orientation}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Usable Area</span>
                      <span className="font-bold">{analysis.usableArea} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Panel Layout</span>
                      <span className="font-bold">{analysis.panelLayout}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Panel Placement Preview</h3>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-primary/20 border-2 border-primary rounded flex items-center justify-center text-xs font-semibold"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      3x4 configuration • Maximum efficiency
                    </p>
                  </div>
                </Card>

                {analysis.shadingIssues.length > 0 && (
                  <Card className="p-6 bg-orange-50 dark:bg-orange-950">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      Shading Analysis
                    </h3>
                    <ul className="space-y-2">
                      {analysis.shadingIssues.map((issue, idx) => (
                        <li key={idx} className="text-sm">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      Consider trimming trees or adjusting panel placement to minimize shading.
                    </p>
                  </Card>
                )}

                <Card className="p-6 bg-success/5">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success mb-2">
                      {analysis.efficiency}%
                    </div>
                    <div className="text-muted-foreground">Expected System Efficiency</div>
                  </div>
                </Card>

                <Button className="w-full" size="lg">
                  Confirm Configuration & Continue
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofAnalyzer;
