import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AudioPreview } from "@/components/AudioPreview";

export default function AudioPreviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Preview</h1>
          <p className="text-muted-foreground">
            Listen to generated voiceover advertisements from your AI automation system
          </p>
        </div>
        
        <AudioPreview />
      </div>
    </DashboardLayout>
  );
}