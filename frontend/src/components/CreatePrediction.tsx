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
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { IconPhoto, IconPhotoScan } from '@tabler/icons-react';


const CreatePrediction = () => {
  const [modelInputType, setModelInputType] = useState<"upload" | "url">('upload');
  const [garmentInputType, setGarmentInputType] = useState<"upload" | "url">('upload');

  const [modelImageFile, setModelImageFile] = useState<File | null>(null);
  const [garmentImageFile, setGarmentImageFile] = useState<File | null>(null);
  const [modelImageUrl, setModelImageUrl] = useState('');
  const [garmentImageUrl, setGarmentImageUrl] = useState('');
  
  const [category, setCategory] = useState('tops');
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Function to convert file to Base64
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
            setError('Please upload a garment image.');
            return;
          }
          garmentImage = await convertFileToBase64(garmentImageFile);
        } else {
          if (!garmentImageUrl) {
            setError('Please enter a garment image URL.');
            return;
          }
          garmentImage = garmentImageUrl;
        }
  
        setLoading(true);
        setError(null);
        setImageUrls([]);
        setStatus('idle');
        setProgress(0);
  
        const response = await fetch('/api/fashn/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_image: modelImage,
            garment_image: garmentImage,
            category,
          }),
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

  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 20;
  
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
            'Garment Image'
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
                  className="w-full h-64 overflow-hidden rounded-md bg-gray-100 mt-2 flex items-center justify-center"
                >
                  <img
                    src={url}
                    alt={`Try-On Result ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Placeholder when no image is generated yet
            <div className="w-full h-64 overflow-hidden rounded-md bg-gray-100 mt-2 flex items-center justify-center">
              <IconPhotoScan className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          {/* TODO: add footers here if necessary */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePrediction;
