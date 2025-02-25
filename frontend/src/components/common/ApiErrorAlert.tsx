// @/components/common/ApiErrorAlert.tsx/
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ApiErrorAlertProps {
  message?: string;
  onRetry?: () => void;
  isMockData?: boolean;
  onToggleMockData?: () => void;
}

export function ApiErrorAlert({
  message = "There was an error connecting to the server.",
  onRetry,
  isMockData,
  onToggleMockData,
}: ApiErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <p>{message}</p>
        <p className="text-sm">
          {isMockData
            ? "Currently using demonstration data. Your changes won't be saved to the server."
            : "Check your network connection and API server status."}
        </p>
        <div className="flex space-x-2 mt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span>Retry Connection</span>
            </Button>
          )}
          {onToggleMockData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMockData}
              className="flex items-center space-x-1"
            >
              <span>
                {isMockData ? "Try Real Data" : "Use Demo Data"}
              </span>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}