import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RunwareService, GeneratedImage } from "../lib/runware";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface Resolution {
  width: number;
  height: number;
}

const RESOLUTIONS: Record<string, Resolution> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
};

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [showApiInput, setShowApiInput] = useState(true);
  const [selectedRatio, setSelectedRatio] = useState("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your Runware API key");
      return;
    }

    setIsGenerating(true);
    try {
      const resolution = RESOLUTIONS[selectedRatio];
      const runware = new RunwareService(apiKey);
      const results = await Promise.all([
        runware.generateImage({ 
          positivePrompt: prompt,
          width: resolution.width,
          height: resolution.height
        }),
        runware.generateImage({ 
          positivePrompt: prompt,
          width: resolution.width,
          height: resolution.height
        }),
        runware.generateImage({ 
          positivePrompt: prompt,
          width: resolution.width,
          height: resolution.height
        }),
      ]);
      setImages(results);
      setShowApiInput(false);
      toast.success("Images generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate images. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${index + 1}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            AI Image Generator
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
            Enter a prompt to generate unique AI-powered images
          </p>
        </div>

        {showApiInput && (
          <div className="flex gap-4 max-w-2xl mx-auto">
            <Input
              type="password"
              placeholder="Enter your Runware API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <Label>Select Image Ratio</Label>
            <RadioGroup
              value={selectedRatio}
              onValueChange={setSelectedRatio}
              className="flex flex-wrap gap-4"
            >
              {Object.entries(RESOLUTIONS).map(([ratio]) => (
                <div key={ratio} className="flex items-center space-x-2">
                  <RadioGroupItem value={ratio} id={ratio} />
                  <Label htmlFor={ratio}>{ratio}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Enter your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !apiKey.trim()}
              className="min-w-[120px]"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isGenerating ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))
          ) : (
            images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.imageURL}
                  alt={`Generated image ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                  loading="lazy"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(image.imageURL, index)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;