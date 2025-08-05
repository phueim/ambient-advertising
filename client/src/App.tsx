import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Route, Switch } from "wouter";
import MyBrandsPage from "@/pages/MyBrandsPage";
import PlaylistEdit from "@/pages/playlist-edit";
import PickNPlayPage from "@/pages/pick-n-play-page";
import UploadJinglePage from "@/pages/upload-jingle-page";
import RequestJinglePage from "@/pages/request-jingle-page";
import QuickStartPage from "@/pages/quick-start-page";
import { WorkerControlPanel } from "@/components/WorkerControlPanel";
import { AdvertiserManagement } from "@/components/AdvertiserManagement";
import { BillingManagement } from "@/components/BillingManagement";
import { AnalyticsReporting } from "@/components/AnalyticsReporting";
import { EnhancedConditionRules } from "@/components/EnhancedConditionRules";
import { AudioPreview } from "@/components/AudioPreview";
import { AdvertisingManagement } from "@/components/AdvertisingManagement";
import GovernmentDataPage from "@/pages/government-data-page";
import ContractsPage from "@/pages/ContractsPage";
import { Toaster } from "@/components/ui/toaster";

export default function App() {

  return (
    <DashboardLayout>
      <Switch>
        {/* UseaDashboardFinal Routes */}
        <Route path="/" component={QuickStartPage} />
        <Route path="/brands" component={MyBrandsPage} />
        <Route path="/brands/:locationId/edit" component={PlaylistEdit} />
        <Route path="/discover" component={PickNPlayPage} />
        <Route path="/pick-n-play" component={PickNPlayPage} />
        <Route path="/upload-jingle" component={UploadJinglePage} />
        <Route path="/request-jingle" component={RequestJinglePage} />
        
        {/* Ambient Advertising Management System Routes */}
        <Route path="/workers" component={WorkerControlPanel} />
        <Route path="/advertisers" component={AdvertiserManagement} />
        <Route path="/contracts" component={ContractsPage} />
        <Route path="/analytics" component={AnalyticsReporting} />
        <Route path="/rules" component={EnhancedConditionRules} />
        <Route path="/audio" component={AudioPreview} />
        <Route path="/government-data" component={GovernmentDataPage} />
        <Route path="/advertising" component={AdvertisingManagement} />

        <Route path="/settings">
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">System configuration and preferences.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Settings page coming soon...</p>
            </div>
          </div>
        </Route>

        <Route path="/help">
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600 mt-2">Documentation and support resources.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Help documentation coming soon...</p>
            </div>
          </div>
        </Route>

        <Route path="/contact">
          <div className="p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600 mt-2">Get in touch with our support team.</p>
            </div>
            <div className="text-center py-20">
              <p className="text-gray-500">Contact page coming soon...</p>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster />
    </DashboardLayout>
  );
}