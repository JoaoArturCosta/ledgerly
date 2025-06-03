"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import BankProviderSelector from "@/components/banking/BankProviderSelector";
import BankSelector from "@/components/banking/BankSelector";
import AccountsList from "@/components/banking/AccountsList";
import { useSearchParams } from "next/navigation";

export default function BankingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [provider, setProvider] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [banks, setBanks] = useState<
    Array<{ id: string; name: string; logo?: string | null }>
  >([]);
  const [bankSelectionRequired, setBankSelectionRequired] = useState(false);

  // Parse URL parameters
  const error = searchParams?.get("error");
  const success = searchParams?.get("success") === "true";

  // Provider selection
  const { data: providers, isLoading: isLoadingProviders } =
    api.banking.getProviders.useQuery();

  // Bank connections
  const {
    data: connections,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = api.banking.getConnections.useQuery();

  // Bank accounts
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
  } = api.banking.getAccounts.useQuery();

  // Mutations
  const initiateConnectionMutation = api.banking.initiateConnection.useMutation(
    {
      onSuccess: (data) => {
        setSessionId(data.sessionId);

        if (data.requiresBankSelection) {
          // For providers that require bank selection (e.g., SIBS)
          setBanks(data.banks || []);
          setBankSelectionRequired(true);
        } else if (data.authUrl) {
          // For providers that handle bank selection in their UI (e.g., TrueLayer)
          window.location.href = data.authUrl;
        }
      },
      onError: (error) => {
        console.error("Failed to initiate connection:", error);
      },
    },
  );

  const selectBankMutation = api.banking.selectBank.useMutation({
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      console.error("Failed to select bank:", error);
    },
  });

  const disconnectBankMutation = api.banking.disconnectBank.useMutation({
    onSuccess: () => {
      refetchConnections();
      refetchAccounts();
    },
  });

  // Event handlers
  const handleStartConnection = () => {
    if (!provider) return;

    initiateConnectionMutation.mutate({
      providerName: provider,
    });
  };

  const handleSelectBank = () => {
    if (!selectedBankId || !sessionId || !provider) return;

    selectBankMutation.mutate({
      sessionId,
      bankId: selectedBankId,
      providerName: provider,
    });
  };

  const handleDisconnect = (connectionId: string) => {
    disconnectBankMutation.mutate({ connectionId });
  };

  const isConnecting =
    initiateConnectionMutation.isLoading || selectBankMutation.isLoading;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-4xl font-bold">Banking Integration</h1>

      {/* Status alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "missing_params" &&
              "Missing required parameters for bank connection."}
            {error === "authentication_required" &&
              "You must be signed in to connect your bank."}
            {error === "connection_failed" &&
              "Failed to connect to your bank. Please try again."}
            {![
              "missing_params",
              "authentication_required",
              "connection_failed",
            ].includes(error) &&
              "An error occurred during the banking connection."}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Success</AlertTitle>
          <AlertDescription>
            Your bank account has been successfully connected.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Connected accounts */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            Your Connected Accounts
          </h2>

          {isLoadingConnections || isLoadingAccounts ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : connections?.length === 0 ? (
            <p className="text-gray-500">No bank accounts connected yet.</p>
          ) : (
            <div className="space-y-4">
              {connections?.map((connection) => (
                <Card key={connection.id} className="relative">
                  <CardHeader>
                    <CardTitle>
                      {connection.providerName === "sibs"
                        ? "SIBS"
                        : "TrueLayer"}
                    </CardTitle>
                    <CardDescription>
                      {connection.status === "active"
                        ? "Active Connection"
                        : connection.status}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <AccountsList
                      accounts={
                        accounts?.filter(
                          (acc) => acc.connectionId === connection.id,
                        ) || []
                      }
                    />
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchAccounts()}
                    >
                      Refresh Accounts
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      disabled={disconnectBankMutation.isLoading}
                    >
                      {disconnectBankMutation.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Disconnecting
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add new connection */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Connect a New Bank</h2>

          <Card>
            <CardHeader>
              <CardTitle>Add Bank Connection</CardTitle>
              <CardDescription>
                Connect your bank account to automatically import transactions
              </CardDescription>
            </CardHeader>

            <CardContent>
              {bankSelectionRequired ? (
                <BankSelector
                  banks={banks}
                  selectedBankId={selectedBankId}
                  onSelectBank={setSelectedBankId}
                />
              ) : (
                <BankProviderSelector
                  providers={providers || []}
                  selectedProvider={provider}
                  onSelectProvider={setProvider}
                  isLoading={isLoadingProviders}
                />
              )}
            </CardContent>

            <CardFooter>
              {bankSelectionRequired ? (
                <Button
                  onClick={handleSelectBank}
                  disabled={!selectedBankId || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to Selected Bank"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleStartConnection}
                  disabled={!provider || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Bank Account"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">About Banking Integration</h3>
            <p className="mb-2 text-sm text-gray-600">
              This integration uses secure Open Banking APIs to access your
              transaction data. We can only read your account information and
              cannot make any changes or transfers.
            </p>
            <p className="text-sm text-gray-600">
              Your credentials are never stored and you can disconnect your
              account at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
