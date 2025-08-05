import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Receipt,
  Calendar,
  Filter
} from "lucide-react";

interface Advertiser {
  id: number;
  name: string;
  displayName: string;
  creditBalance: string;
  spentAmount: string;
  budgetCap: string;
  status: string;
  createdAt: string;
}

interface CreditTransaction {
  id: number;
  advertiserId: number;
  amount: string;
  type: "credit" | "debit" | "adjustment";
  description: string;
  timestamp: string;
  advertiserName: string;
}

export function BillingManagement() {
  const { toast } = useToast();
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("100");
  const [transactionType, setTransactionType] = useState<"credit" | "adjustment">("credit");
  const [description, setDescription] = useState("");
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);

  // Fetch advertisers
  const { data: advertisers, refetch } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch recent transactions (mock for now - you can implement this endpoint)
  const { data: transactions } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/v1/billing/transactions"],
    queryFn: () => {
      // Mock data - replace with actual API call
      return Promise.resolve([
        {
          id: 1,
          advertiserId: 91,
          amount: "-10.00",
          type: "debit" as const,
          description: "Ad trigger: rain_thunderstorm",
          timestamp: new Date().toISOString(),
          advertiserName: "Grab / Insurance"
        },
        {
          id: 2,
          advertiserId: 92,
          amount: "-10.00", 
          type: "debit" as const,
          description: "Ad trigger: sudden_temp_drop",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          advertiserName: "Local F&B Comfort"
        }
      ]);
    },
    refetchInterval: 300000, // 5 minutes
  });

  const addCredits = useMutation({
    mutationFn: async (data: {
      advertiserId: number;
      amount: number;
      type: string;
      description: string;
    }) => {
      // Mock implementation - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "✅ Credits Added",
        description: "Credits have been successfully added to the advertiser account.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertisers"] });
      setIsAddCreditsOpen(false);
      setSelectedAdvertiser(null);
      setCreditAmount("100");
      setDescription("");
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Add Credits",
        description: error.message || "Unable to process credit transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddCredits = () => {
    if (!selectedAdvertiser || !creditAmount) return;
    
    addCredits.mutate({
      advertiserId: selectedAdvertiser,
      amount: parseFloat(creditAmount),
      type: transactionType,
      description: description || `${transactionType === "credit" ? "Credit top-up" : "Balance adjustment"} - $${creditAmount}`
    });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `${num >= 0 ? '+' : ''}$${Math.abs(num).toFixed(2)}`;
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "credit":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Credit</Badge>;
      case "debit":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Debit</Badge>;
      case "adjustment":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getLowCreditAdvertisers = () => {
    return advertisers?.filter(adv => parseFloat(adv.creditBalance) < 50) || [];
  };

  const getTotalCreditsIssued = () => {
    return advertisers?.reduce((sum, adv) => sum + parseFloat(adv.budgetCap), 0) || 0;
  };

  const getTotalCreditsRemaining = () => {
    return advertisers?.reduce((sum, adv) => sum + parseFloat(adv.creditBalance), 0) || 0;
  };

  const lowCreditAdvertisers = getLowCreditAdvertisers();

  return (
    <div className="space-y-6">
      {/* Billing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits Issued</p>
                <p className="text-2xl font-bold">${getTotalCreditsIssued().toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
                <p className="text-2xl font-bold">${getTotalCreditsRemaining().toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Utilized</p>
                <p className="text-2xl font-bold">
                  ${(getTotalCreditsIssued() - getTotalCreditsRemaining()).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Credit Alerts</p>
                <p className="text-2xl font-bold">{lowCreditAdvertisers.length}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${lowCreditAdvertisers.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Credit Alerts */}
      {lowCreditAdvertisers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Credit Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowCreditAdvertisers.map((advertiser) => (
                <div key={advertiser.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium">{advertiser.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      Credits: ${advertiser.creditBalance} / Budget: ${advertiser.budgetCap}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAdvertiser(advertiser.id);
                      setIsAddCreditsOpen(true);
                    }}
                  >
                    Add Credits
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Credit Management
            <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credits to Advertiser</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="advertiser">Select Advertiser</Label>
                    <Select 
                      value={selectedAdvertiser?.toString() || ""} 
                      onValueChange={(value) => setSelectedAdvertiser(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose advertiser" />
                      </SelectTrigger>
                      <SelectContent>
                        {advertisers?.map((advertiser) => (
                          <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                            {advertiser.displayName} (${advertiser.creditBalance} remaining)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="transactionType">Transaction Type</Label>
                    <Select value={transactionType} onValueChange={(value: "credit" | "adjustment") => setTransactionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Credit Top-up</SelectItem>
                        <SelectItem value="adjustment">Balance Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Reason for credit adjustment..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCreditsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddCredits}
                      disabled={addCredits.isPending || !selectedAdvertiser || !creditAmount}
                    >
                      {addCredits.isPending ? "Processing..." : "Add Credits"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage advertiser credit balances and view transaction history.
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Recent Transactions
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.advertiserName}
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(transaction.type)}
                    </TableCell>
                    <TableCell className={`font-bold ${
                      parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleDateString("en-SG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}