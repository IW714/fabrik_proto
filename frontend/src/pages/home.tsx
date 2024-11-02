// src/pages/HomePage.tsx
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { IconFile } from '@tabler/icons-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

const HomePage = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Upload Model Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Upload Image of Model</CardTitle>
                    <CardDescription>Upload a file to get started</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center w-full">
                        <IconFile className="w-12 h-12" />
                        <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                        <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
                    </div>
                    <div className="space-y-2 text-sm w-full">
                        <Label htmlFor="file" className="text-sm font-medium">
                            File
                        </Label>
                        <Input id="file" type="file" placeholder="File" accept="image/*" />
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button size="lg">Upload</Button>
                </CardFooter>
            </Card>

            {/* Upload Clothing Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Upload Image of Clothing to Try On</CardTitle>
                    <CardDescription>Upload a file to get started</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center w-full">
                        <IconFile className="w-12 h-12" />
                        <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                        <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
                    </div>
                    <div className="space-y-2 text-sm w-full">
                        <Label htmlFor="file" className="text-sm font-medium">
                            File
                        </Label>
                        <Input id="file" type="file" placeholder="File" accept="image/*" />
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button size="lg">Upload</Button>
                </CardFooter>
            </Card>

            {/* Preview of Pred */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Runtime ~ 15 seconds</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-sm w-full">
                        <Label htmlFor="preview" className="text-sm font-medium">
                            TODO:
                        </Label>
                        {/* Add preview content here */}
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button size="lg">Upload</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default HomePage;
