import { useState } from 'react';
import { Button } from '../components/ui/button';
import { 
    Card, 
    CardHeader, 
    CardFooter, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../components/ui/select";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from "../components/ui/accordion";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog"; // TODO: separate this into a reusable component
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { IconPhoto, IconPhotoScan } from '@tabler/icons-react';

// TODO: would be a good idea to refactor this entire thing into smaller components and util functions

const CreatePrediction = () => {
  const [modelInputType, setModelInputType] = useState<"upload" | "url">('upload');
  const [garmentInputType, setGarmentInputType] = useState<"upload" | "url">('upload');

  const [modelImageFile, setModelImageFile] = useState<File | null>(null);
  const [garmentImageFile, setGarmentImageFile] = useState<File | null>(null);
  const [modelImageUrl, setModelImageUrl] = useState('');
  const [garmentImageUrl, setGarmentImageUrl] = useState('');
  
  // Garment options
  const [category, setCategory] = useState('tops');
  const [photoType, setPhotoType] = useState<'flat_lay' | 'model'>('model');

  // Model options
  const [coverFeet, setCoverFeet] = useState(false);
  const [adjustHands, setAdjustHands] = useState(false);
  const [restoreBackground, setRestoreBackground] = useState(false);
  const [restoreClothes, setRestoreClothes] = useState(false);
  const [longTop, setLongTop] = useState(false); // Only appears if category === 'tops'

  // Preview options
  const [guidanceScale, setGuidanceScale] = useState(2); // Default: 2, Range: 1.5-5
  const [timesteps, setTimesteps] = useState(50); // Default: 50, Range: 10-50
  const [seed, setSeed] = useState(42); // Default: 42 because why not
  const [numSamples, setNumSamples] = useState(1); // Default: 1, Range: 1-4

  // API state variables
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Dialog state variables
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');


  const convertFileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('Failed to convert file to Base64.');
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let modelImage: string = '';
    let garmentImage: string = '';

    try {
        if (modelInputType === 'upload') {
          if (!modelImageFile) {
            setError('Please upload a model image.');
            return;
          }
          modelImage = await convertFileToBase64(modelImageFile);
        } else {
          if (!modelImageUrl) {
            setError('Please enter a model image URL.');
            return;
          }
          modelImage = modelImageUrl;
        }
  
        if (garmentInputType === 'upload') {
          if (!garmentImageFile) {
            setError('Please upload a clothing image.');
            return;
          }
          garmentImage = await convertFileToBase64(garmentImageFile);
        } else {
          if (!garmentImageUrl) {
            setError('Please enter a clothing image URL.');
            return;
          }
          garmentImage = garmentImageUrl;
        }
  
        setLoading(true);
        setError(null);
        setImageUrls([]);
        setStatus('idle');
        setProgress(0);

        const requestBody: any = {
            model_image: modelImage,
            garment_image: garmentImage,
            category,
            cover_feet: coverFeet,
            adjust_hands: adjustHands,
            restore_background: restoreBackground,
            restore_clothes: restoreClothes,
            flat_lay: photoType === 'flat_lay',
            guidance_scale: guidanceScale,
            timesteps,
            seed,
            num_samples: numSamples,
        };

        if (category === 'tops') {
            requestBody.long_top = longTop;
        };
  
        const response = await fetch('/api/fashn/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail?.message || 'An error occurred');
        }
  
        const { id } = await response.json();
        setPredictionId(id);
        setStatus('starting');
  
        // Start polling for status
        pollStatus(id);
      } catch (err) {
        console.error(err);
        setError((err as Error).message || 'An error occurred');
      }
  };

  const handleSaveImage = async (image_url: string) => {
    try {
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image_url: image_url,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving image:", errorData);
        throw new Error(errorData.detail?.message || 'Failed to save image');
      }

      const data = await response.json();
      alert('Image saved successfully');
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'An error occurred while saving image');
    }
  }

  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 300;
  
    const interval = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError('The prediction took too long to complete');
        setLoading(false);
        return;
      }
  
      attempts += 1;
  
      try {
        const response = await fetch(`/api/fashn/status/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail?.message || 'An error occurred while polling status.'
          );
        }
  
        const {
          status: currentStatus,
          output,
          error: predictionError,
        } = await response.json();
        setStatus(currentStatus);
  
        if (currentStatus === 'starting') {
          setProgress(33);
        } else if (currentStatus === 'processing') {
          setProgress(66);
        } else if (currentStatus === 'completed') {
          setProgress(100);
          clearInterval(interval);
          setLoading(false);
          if (output && output.length > 0) {
            setImageUrls(output);
          } else {
            setError('No output images were returned. Please try again');
          }
        } else if (currentStatus === 'failed' || currentStatus === 'canceled') {
          clearInterval(interval);
          setLoading(false);
          setError(predictionError?.message || 'Prediction failed or was canceled');
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
        setError((err as Error).message || 'An error occurred while polling status.');
      }
    }, 1000); 
  };

  
  const renderImageInput = ( // TODO: Separate this into a reusable component
    inputType: 'upload' | 'url',
    imageFile: File | null,
    imageUrl: string,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>,
    setImageUrl: React.Dispatch<React.SetStateAction<string>>,
    label: string
  ) => {
    return (
        <>
        <div className="flex items-center mb-2">
          <Label className="mr-2">{label}</Label>
          <Switch
            checked={inputType === 'url'}
            onCheckedChange={(checked: boolean) => {
              if (checked) {
                if (inputType === 'upload') {
                  setImageFile(null);
                }
              } else {
                if (inputType === 'url') {
                  setImageUrl('');
                }
              }
              if (label === 'Model Image') {
                setModelInputType(checked ? 'url' : 'upload');
              } else {
                setGarmentInputType(checked ? 'url' : 'upload');
              }
            }}
          />
          <span className="ml-2">{inputType === 'upload' ? 'Upload' : 'URL'}</span>
        </div>
        {inputType === 'upload' ? (
          <div className="space-y-2 text-sm w-full">
            {imageFile ? (
              <div className="relative">
                <div className="w-full h-64 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                    <img
                    src={URL.createObjectURL(imageFile)}
                    alt={`${label} Preview`}
                    className="object-contain w-full h-full rounded"
                    />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div
                className="w-full h-64 border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center justify-center cursor-pointer"
                onClick={() => document.getElementById(`${label}-file-input`)?.click()}
              >
                <IconPhoto className="w-12 h-12" />
                <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                <span className="text-xs text-gray-500">Image files only</span>
                <Input
                  id={`${label}-file-input`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm w-full">
            <Label htmlFor={`${label}-url`} className="text-sm font-medium">
              {label} URL
            </Label>
            <Input
              id={`${label}-url`}
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
                <div className="w-full h-64 overflow-hidden rounded-md bg-gray-100 mt-2 flex items-center justify-center">
                    <img
                    src={imageUrl}
                    alt={`${label} Preview`}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                        // Handle invalid image URL
                        (e.target as HTMLImageElement).src = '';
                    }}
                    />
                </div>
            )}
          </div>
        )}
      </>
    );
  };

  const resetModelOptions = () => {
    setCoverFeet(false);
    setAdjustHands(false);
    setRestoreBackground(false);
    setRestoreClothes(false);
    setLongTop(false);
  };
  
  const resetPredictionOptions = () => {
    setGuidanceScale(2);
    setTimesteps(50);
    setSeed(42);
    setNumSamples(1);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 items-start">
      {/* Upload Model Image Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Model Image</CardTitle>
          <CardDescription>Upload an image or provide a URL</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {renderImageInput(
            modelInputType,
            modelImageFile,
            modelImageUrl,
            setModelImageFile,
            setModelImageUrl,
            'Model Image'
          )}
            <Accordion type="single" collapsible>
            <AccordionItem value="model-options">
                <AccordionTrigger>Advanced Options</AccordionTrigger>
                <AccordionContent>
                <div className="space-y-2 mt-4">
                    <div className="flex items-center space-x-2">
                    <Switch id="coverFeet" checked={coverFeet} onCheckedChange={setCoverFeet} />
                    <Label htmlFor="coverFeet">Cover Feet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Switch id="adjustHands" checked={adjustHands} onCheckedChange={setAdjustHands} />
                    <Label htmlFor="adjustHands">Adjust Hands</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Switch
                        id="restoreBackground"
                        checked={restoreBackground}
                        onCheckedChange={setRestoreBackground}
                    />
                    <Label htmlFor="restoreBackground">Restore Background</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Switch
                        id="restoreClothes"
                        checked={restoreClothes}
                        onCheckedChange={setRestoreClothes}
                    />
                    <Label htmlFor="restoreClothes">Restore Clothes</Label>
                    </div>
                </div>
                <Button variant="secondary" onClick={resetModelOptions} className="mt-4">
                    Reset to Default
                </Button>
                </AccordionContent>
            </AccordionItem>
            </Accordion>

        </CardContent>
      </Card>

      {/* Upload Garment Image Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Clothing Image</CardTitle>
          <CardDescription>Upload an image or provide a URL</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {renderImageInput(
            garmentInputType,
            garmentImageFile,
            garmentImageUrl,
            setGarmentImageFile,
            setGarmentImageUrl,
            'Clothing Image'
          )}
          <div className="space-y-2 text-sm w-full">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="one-pieces">One-Pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 text-sm w-full">
                <Label htmlFor="photoType" className="text-sm font-medium">
                    Photo Type
                </Label>
                <Select onValueChange={(value) => setPhotoType(value as 'flat_lay' | 'model')} value={photoType}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a photo type" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="flat_lay">Flat Lay</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Conditionally render longTop switch if category is 'tops' */}
            {category === 'tops' && (
                <div className="flex items-center space-x-2">
                    <Switch id="longTop" checked={longTop} onCheckedChange={setLongTop} />
                    <Label htmlFor="longTop">Long Top</Label>
                </div>
            )}
        </CardContent>
      </Card>

      {/* Prediction Form and Preview Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Prediction</CardTitle>
          <CardDescription>Configure and submit your try-on request</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Prediction'}
            </Button>
          </form>

          {/* Display Progress */}
          {loading && (
            <div className="mt-4">
              <Label>Processing:</Label>
              <Progress value={progress} />
            </div>
          )}

          {/* Display Status, Error, and Image */}
          {status && status !== 'idle' && (
            <div className="mt-4">
              <p>
                <strong>Status:</strong> {status}
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <IconPhotoScan className="w-6 h-6" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {imageUrls.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Generated Try-On Image(s):</h3>
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-full h-64 overflow-hidden rounded-md bg-gray-100 mt-2 flex items-center justify-center"
                >
                  <img
                    src={url}
                    alt={`Try-On Result ${index + 1}`}
                    className="object-contain w-full h-full"
                    onClick={() => {
                      setSelectedImageUrl(url);
                      setIsDialogOpen(true);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => handleSaveImage(url)}
                  >
                    Save
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            // Placeholder when no image is generated yet
            <div className="w-full h-64 overflow-hidden rounded-md bg-gray-100 mt-2 flex items-center justify-center">
              <IconPhotoScan className="w-16 h-16 text-gray-400" />
            </div>
          )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Image Preview</DialogTitle>
                  <DialogClose />
                </DialogHeader>
                <div className="w-full">
                  <img src={selectedImageUrl} alt="Selected" className="w-full h-auto" />
                </div>
              </DialogContent>
            </Dialog>


            <Accordion type="single" collapsible>
            <AccordionItem value="prediction-options">
                <AccordionTrigger>Advanced Options</AccordionTrigger>
                <AccordionContent>
                <div className="space-y-4 mt-4">
                    {/* guidance_scale slider */}
                    <div className="space-y-2">
                    <Label htmlFor="guidanceScale">Guidance Scale: {guidanceScale}</Label>
                    <Slider
                        id="guidanceScale"
                        min={1.5}
                        max={5}
                        step={0.1}
                        value={[guidanceScale]}
                        onValueChange={(value) => setGuidanceScale(value[0])}
                    />
                    </div>
                    {/* timesteps slider */}
                    <div className="space-y-2">
                    <Label htmlFor="timesteps">Timesteps: {timesteps}</Label>
                    <Slider
                        id="timesteps"
                        min={10}
                        max={50}
                        step={1}
                        value={[timesteps]}
                        onValueChange={(value) => setTimesteps(value[0])}
                    />
                    </div>
                    {/* seed input */}
                    <div className="space-y-2">
                    <Label htmlFor="seed">Seed</Label>
                    <Input
                        id="seed"
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    />
                    </div>
                    {/* num_samples slider */}
                    <div className="space-y-2">
                    <Label htmlFor="numSamples">Number of Samples: {numSamples}</Label>
                    <Slider
                        id="numSamples"
                        min={1}
                        max={4}
                        step={1}
                        value={[numSamples]}
                        onValueChange={(value) => setNumSamples(value[0])}
                    />
                    </div>
                </div>
                <Button variant="secondary" onClick={resetPredictionOptions} className="mt-4">
                    Reset to Default
                </Button>
                </AccordionContent>
            </AccordionItem>
            </Accordion>

        </CardContent>
        <CardFooter className="justify-center">
          {/* TODO: add footers here if necessary */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePrediction;
