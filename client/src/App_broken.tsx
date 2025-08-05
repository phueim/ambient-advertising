import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { QuickStartPage } from "@/pages/QuickStartPage";
import { MyBrandsPage } from "@/pages/MyBrandsPage";
import { WorkerControlPanel } from "@/components/WorkerControlPanel";
import { AdvertiserManagement } from "@/components/AdvertiserManagement";
import { BillingManagement } from "@/components/BillingManagement";
import { AnalyticsReporting } from "@/components/AnalyticsReporting";
import { EnhancedConditionRules } from "@/components/EnhancedConditionRules";
import { AudioPreview } from "@/components/AudioPreview";
import ContractsPage from "@/pages/ContractsPage";
import { Bell, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [currentPage, setCurrentPage] = useState('quick-start');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'quick-start':
        return <QuickStartPage onPageChange={setCurrentPage} />;
      case 'my-brands':
        return <MyBrandsPage />;
      case 'discover-music':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Discover Brand Fit Music</h1>
              <p className="text-gray-600 mt-2">Find music that perfectly matches your brand identity.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Music discovery feature coming soon...</p>
            </div>
          </div>
        );
      case 'pick-play':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Pick 'N' Play</h1>
              <p className="text-gray-600 mt-2">Quick playlist selection for immediate playback.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Pick 'N' Play feature coming soon...</p>
            </div>
          </div>
        );
      case 'upload-jingle':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Upload Jingle / Voice over</h1>
              <p className="text-gray-600 mt-2">Upload your custom audio content for broadcasting.</p>
            </div>
            <AudioPreview />
          </div>
        );
      case 'request-jingle':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Request Jingle / Voice over</h1>
              <p className="text-gray-600 mt-2">Request custom audio content creation.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Request jingle feature coming soon...</p>
            </div>
          </div>
        );
      case 'workers':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">System Workers</h1>
              <p className="text-gray-600 mt-2">Monitor and manage background automation workers.</p>
            </div>
            <WorkerControlPanel />
          </div>
        );
      case 'advertisers':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Advertiser Management</h1>
              <p className="text-gray-600 mt-2">Manage advertiser accounts and campaigns.</p>
            </div>
            <AdvertiserManagement />
          </div>
        );
      case 'contracts':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
              <p className="text-gray-600 mt-2">Manage advertiser and venue contracts with billing integration.</p>
            </div>
            <ContractsPage />
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
              <p className="text-gray-600 mt-2">Comprehensive analytics and performance reporting.</p>
            </div>
            <AnalyticsReporting />
          </div>
        );
      case 'rules':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Condition Rules</h1>
              <p className="text-gray-600 mt-2">Configure automated trigger conditions for contextual advertising.</p>
            </div>
            <EnhancedConditionRules />
          </div>
        );
      case 'help':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600 mt-2">Documentation and support resources.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Help documentation coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">System configuration and preferences.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Settings page coming soon...</p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600 mt-2">Get in touch with our support team.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Contact page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <QuickStartPage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* USEA Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col main-content">
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}