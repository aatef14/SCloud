import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Download, Share2, Trash2, MoreVertical, File, FileText, Image as ImageIcon, FileVideo, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useAuth } from '../../lib/auth-context';
import * as s3Service from '../../lib/s3-service-real';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  s3Key: string;
}

interface FileListProps {
  refreshTrigger?: number;
}

export function FileList({ refreshTrigger }: FileListProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; s3Key: string } | null>(null);

  useEffect(() => {
    loadFiles();
  }, [user, refreshTrigger]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const loadFiles = async () => {
    if (!user) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast.error('Please sign in again');
      return;
    }

    try {
      setIsLoading(true);
      const fileRecords = await s3Service.getUserFiles(token);
      
      const formattedFiles: FileItem[] = fileRecords.map((record) => ({
        id: record.fileId,
        name: record.fileName,
        size: formatFileSize(record.fileSize),
        type: record.fileType,
        uploadDate: new Date(record.uploadDate).toLocaleDateString(),
        s3Key: record.s3Key,
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('png') || lowerType.includes('jpg') || lowerType.includes('jpeg') || lowerType.includes('image')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (lowerType.includes('mp4') || lowerType.includes('avi') || lowerType.includes('video')) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    } else if (lowerType.includes('pdf') || lowerType.includes('doc') || lowerType.includes('ppt')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleDownload = async (file: FileItem) => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast.error('Please sign in again');
      return;
    }

    try {
      const url = await s3Service.getDownloadUrl(file.id, token);
      window.open(url, '_blank');
      toast.success(`Downloading ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async (file: FileItem) => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast.error('Please sign in again');
      return;
    }

    try {
      const url = await s3Service.getShareableUrl(file.id, token);
      await navigator.clipboard.writeText(url);
      toast.success(`Share link copied for ${file.name}`);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate share link');
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete || !user) return;

    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast.error('Please sign in again');
      return;
    }

    try {
      await s3Service.deleteFile(fileToDelete.id, token);
      
      // Update local state
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    } finally {
      setFileToDelete(null);
    }
  };

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-2">Loading files...</p>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No files uploaded yet. Click "Upload File" to get started.
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    {getFileIcon(file.type)}
                  </TableCell>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.uploadDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(file)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setFileToDelete({ id: file.id, s3Key: file.s3Key })}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={fileToDelete !== null} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file from your storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
