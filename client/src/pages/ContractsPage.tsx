import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, Building, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { CreateContractForm } from "@/components/CreateContractForm";
import { EditContractForm } from "@/components/EditContractForm";
import { EditTemplateForm } from "@/components/EditTemplateForm";

interface ContractTemplate {
  id: number;
  name: string;
  tier: string;
  category: string;
  currency: string;
  billingType: string;
  monthlyFixedFee: string;
  perTriggerRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  venuePayoutType: string;
  venueFixedMonthly: string;
  venuePercentageRate: string;
  venueMinimumGuarantee: string;
  venuePerformanceBonusThreshold: string;
  venuePerformanceBonusRate: string;
  maxTriggersPerMonth: number;
  monthlyBudget: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdvertiserContract {
  id: number;
  advertiserId: number;
  templateId: number;
  contractName: string;
  currency: string;
  billingType: string;
  monthlyFixedFee: string;
  perTriggerRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  maxTriggersPerMonth: number;
  monthlyBudget: string;
  currentMonthSpend: string;
  currentMonthTriggers: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface VenueContract {
  id: number;
  venueId: number;
  templateId: number;
  contractName: string;
  currency: string;
  payoutType: string;
  fixedMonthly: string;
  percentageRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  currentMonthRevenue: string;
  currentMonthTriggers: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  id: number;
  name: string;
  location: string;
  type: string;
  country: string;
  city: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch contract templates
  const { data: contractTemplates = [], isLoading: templatesLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/v1/contract-templates"],
  });

  // Fetch advertiser contracts
  const { data: advertiserContracts = [], isLoading: advertiserLoading } = useQuery<AdvertiserContract[]>({
    queryKey: ["/api/v1/advertiser-contracts"],
  });

  // Fetch venue contracts
  const { data: venueContracts = [], isLoading: venueLoading } = useQuery<VenueContract[]>({
    queryKey: ["/api/v1/venue-contracts"],
  });

  // Fetch venues
  const { data: venues = [], isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ["/api/v1/venues"],
  });

  // Calculate statistics
  const totalAdvertiserContracts = advertiserContracts.length;
  const totalVenueContracts = venueContracts.length;
  const activeContracts = advertiserContracts.filter(c => c.status === 'active').length;
  
  const totalMonthlyRevenue = advertiserContracts.reduce((sum, contract) => {
    if (contract.billingType === 'monthly_fixed' || contract.billingType === 'hybrid') {
      return sum + Number(contract.monthlyFixedFee || 0);
    }
    return sum;
  }, 0);

  const totalMonthlySpend = advertiserContracts.reduce((sum, contract) => {
    return sum + Number(contract.currentMonthSpend || 0);
  }, 0);

  const totalTriggers = advertiserContracts.reduce((sum, contract) => {
    return sum + (contract.currentMonthTriggers || 0);
  }, 0);

  if (templatesLoading || advertiserLoading || venueLoading || venuesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-2">Manage billing contracts for advertisers and venue partners</p>
        </div>
        <CreateContractForm />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              {totalAdvertiserContracts} advertiser, {totalVenueContracts} venue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From fixed monthly fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlySpend.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalTriggers} triggers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost per Trigger</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalTriggers > 0 ? (totalMonthlySpend / totalTriggers).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Contract-based pricing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Advertiser Contracts</CardTitle>
                <CardDescription>Latest contract activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advertiserContracts.slice(0, 5).map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contract.contractName}</p>
                        <p className="text-sm text-gray-600">{contract.currency} {contract.billingType}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {contract.billingType === 'monthly_fixed' && `$${contract.monthlyFixedFee}/mo`}
                          {contract.billingType === 'per_trigger' && `$${contract.perTriggerRate}/trigger`}
                          {contract.billingType === 'hybrid' && `$${contract.monthlyFixedFee}/mo + $${contract.perTriggerRate}/trigger`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Model Distribution</CardTitle>
                <CardDescription>Contract types breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['monthly_fixed', 'per_trigger', 'hybrid'].map((type) => {
                    const count = advertiserContracts.filter(c => c.billingType === type).length;
                    const percentage = totalAdvertiserContracts > 0 ? ((count / totalAdvertiserContracts) * 100).toFixed(1) : '0';
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            type === 'monthly_fixed' ? 'bg-blue-500' :
                            type === 'per_trigger' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{count}</span>
                          <span className="text-sm text-gray-600 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertiser Contracts</CardTitle>
              <CardDescription>All active advertiser billing contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Billing Type</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Per Trigger</TableHead>
                    <TableHead>This Month</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertiserContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contractName}</TableCell>
                      <TableCell>{contract.currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.billingType}</Badge>
                      </TableCell>
                      <TableCell>${contract.monthlyFixedFee || '0.00'}</TableCell>
                      <TableCell>${contract.perTriggerRate || '0.00'}</TableCell>
                      <TableCell>${contract.currentMonthSpend || '0.00'}</TableCell>
                      <TableCell>{contract.currentMonthTriggers || 0}</TableCell>
                      <TableCell>
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EditContractForm contract={contract} type="advertiser" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Venue Contracts</CardTitle>
              <CardDescription>Partner venue payout contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Payout Type</TableHead>
                    <TableHead>Fixed Monthly</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>This Month</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venueContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contractName}</TableCell>
                      <TableCell>{contract.currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.payoutType}</Badge>
                      </TableCell>
                      <TableCell>${contract.fixedMonthly || '0.00'}</TableCell>
                      <TableCell>{contract.percentageRate || '0.00'}%</TableCell>
                      <TableCell>${contract.currentMonthRevenue || '0.00'}</TableCell>
                      <TableCell>{contract.currentMonthTriggers || 0}</TableCell>
                      <TableCell>
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EditContractForm contract={contract} type="venue" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
              <CardDescription>Available contract templates for new agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contractTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        <Badge>{template.tier}</Badge> • <Badge variant="outline">{template.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Currency:</span>
                        <span className="font-medium">{template.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Billing:</span>
                        <span className="font-medium">{template.billingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Fee:</span>
                        <span className="font-medium">${template.monthlyFixedFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Per Trigger:</span>
                        <span className="font-medium">${template.perTriggerRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max Triggers:</span>
                        <span className="font-medium">{template.maxTriggersPerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Budget:</span>
                        <span className="font-medium">${template.monthlyBudget}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">Venue Payout: {template.venuePayoutType}</p>
                        <p className="text-xs text-gray-500">
                          Fixed: ${template.venueFixedMonthly} • Share: {template.venuePercentageRate}%
                        </p>
                      </div>
                      <div className="pt-3">
                        <EditTemplateForm template={template} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}