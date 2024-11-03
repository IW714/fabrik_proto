import { useEffect, useState} from 'react';

const SavedImages = () => {
    interface Image {
        _id: string;
        image_url: string;
    }

    const [savedImages, setSavedImages] = useState<Image[]>([]);

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
              <img src={image.image_url} alt="Saved" className="object-contain w-full h-full" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4">You have no saved images.</p>
      )}
    </div>
  )
}

export default SavedImages;