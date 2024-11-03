import { useEffect, useState} from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog";

const SavedImages = () => {
    interface Image {
        _id: string;
        image_url: string;
    }

    const [savedImages, setSavedImages] = useState<Image[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");

    useEffect(() => {
        fetch('/api/saved-images', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => setSavedImages(data))
            .catch((error) => console.error('Error fetching saved images:', error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Your Saved Images</h1>
      {savedImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {savedImages.map((image) => (
            <div key={image._id} className="w-full h-64 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
              <img 
                src={image.image_url} 
                alt="Saved" 
                className="object-contain w-full h-full" 
                onClick={() => {
                  setSelectedImageUrl(image.image_url);
                  setIsDialogOpen(true);
                }}/>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4">You have no saved images.</p>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-fit max-w-[95vw] p-4">
          <div className="flex items-center justify-center">
            <img
              src={selectedImageUrl}
              alt="Selected"
              className="w-auto h-auto max-h-[80vh] max-w-[calc(100vw-2rem)] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SavedImages;