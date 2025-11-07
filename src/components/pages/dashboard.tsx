import { useState } from 'react';
import { DashboardHeader } from '../layout/dashboard-header';
import { FileList } from '../dashboard/file-list';
import { Button } from '../ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useAuth } from '../../lib/auth-context';
import { uploadFileToS3 } from '../../lib/s3-service';
import { saveFileMetadata } from '../../lib/dynamodb-service';

export function Dashboard() {
  const { user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      return;
    }

    setIsUploading(true);

    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Upload to S3 (mock)
      const s3Key = await uploadFileToS3({
        file: selectedFile,
        userId: user.email,
        fileId,
      });

      // Save metadata to DynamoDB (mock)
      await saveFileMetadata({
        userId: user.email,
        fileId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || selectedFile.name.split('.').pop() || 'unknown',
        s3Key,
        uploadDate: new Date().toISOString(),
      });

      toast.success(`File "${selectedFile.name}" uploaded successfully! (Demo Mode)`);
      setIsUploadOpen(false);
      setSelectedFile(null);
      
      // Trigger a refresh of the file list
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center text-sm">
        <strong>Demo Mode:</strong> Using mock AWS services. Files stored in browser memory only.
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">My Files</h1>
            <p className="text-muted-foreground">Manage your uploaded files</p>
          </div>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Choose a file to upload to your SCloud storage
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <FileList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
