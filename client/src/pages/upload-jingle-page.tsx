import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadedJinglesList } from "@/components/upload/uploaded-jingles-list";

export default function UploadJinglePage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-2">Upload Jingle/Voiceover</h1>
      <p className="text-gray-600 mb-6">
        Upload your jingle and marketing messages here for insertion. Uploaded files are subjected to approval. 
        It is illegal to upload unauthorized copyrighted music.
      </p>
      
      <div id="upload-form">
        <UploadForm />
      </div>
      
      <UploadedJinglesList />
    </DashboardLayout>
  );
}
