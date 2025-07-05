import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RotateCcw, AlertTriangle, CheckCircle, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  totalLanguages: number;
  languagesNeedingSync: number;
  totalMissingKeys: number;
  reports: Array<{
    language: string;
    missingKeysCount: number;
    missingKeys: string[];
  }>;
}

interface SyncResult {
  success: boolean;
  message: string;
  reports: Array<{
    language: string;
    updatedKeysCount: number;
    updatedKeys: string[];
  }>;
}

const languageNames = {
  es: 'Spanish',
  ar: 'Arabic',
  de: 'German',
  fr: 'French'
};

const languageFlags = {
  es: '🇪🇸',
  ar: '🇸🇦',
  de: '🇩🇪',
  fr: '🇫🇷'
};

export default function TranslationSyncMonitor() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkSyncStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/translations/sync-status');
      if (response.ok) {
        const status = await response.json();
        setSyncStatus(status);
      } else {
        throw new Error('Failed to check sync status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check translation sync status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performAutoSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/translations/auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result: SyncResult = await response.json();
        
        if (result.success) {
          setLastSync(new Date());
          await checkSyncStatus(); // Refresh status
          
          const totalUpdated = result.reports.reduce((sum, r) => sum + r.updatedKeysCount, 0);
          
          toast({
            title: 'Sync Complete',
            description: `Successfully updated ${totalUpdated} translations across all languages`
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Sync request failed');
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Auto-sync failed',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    
    // Auto-check every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const needsSync = syncStatus && syncStatus.totalMissingKeys > 0;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Translation Sync Monitor
          {needsSync && (
            <Badge variant="destructive" className="ml-2">
              Out of Sync
            </Badge>
          )}
          {!needsSync && syncStatus && (
            <Badge variant="default" className="ml-2 bg-green-600">
              In Sync
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        {syncStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.totalLanguages}</div>
              <div className="text-sm text-blue-700">Total Languages</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{syncStatus.languagesNeedingSync}</div>
              <div className="text-sm text-orange-700">Need Sync</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{syncStatus.totalMissingKeys}</div>
              <div className="text-sm text-red-700">Missing Keys</div>
            </div>
          </div>
        )}

        {/* Sync Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={checkSyncStatus} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Check Status
          </Button>
          
          <Button 
            onClick={performAutoSync} 
            disabled={isSyncing || !needsSync}
            className="bg-primary hover:bg-primary/90"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Languages className="mr-2 h-4 w-4" />
            )}
            Auto-Sync All Languages
          </Button>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Last synchronized: {lastSync.toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Language Details */}
        {syncStatus && syncStatus.reports.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Language Status Details:</h4>
            {syncStatus.reports.map((report) => (
              <div key={report.language} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{languageFlags[report.language as keyof typeof languageFlags]}</span>
                    <span className="font-medium">
                      {languageNames[report.language as keyof typeof languageNames]}
                    </span>
                    {report.missingKeysCount === 0 ? (
                      <Badge variant="default" className="bg-green-600">In Sync</Badge>
                    ) : (
                      <Badge variant="destructive">{report.missingKeysCount} missing</Badge>
                    )}
                  </div>
                </div>
                
                {report.missingKeys.length > 0 && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        View missing keys ({report.missingKeys.length})
                      </summary>
                      <ul className="mt-2 ml-4 space-y-1">
                        {report.missingKeys.map((key, index) => (
                          <li key={index} className="text-xs font-mono text-gray-700">
                            {key}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Alert for sync needed */}
        {needsSync && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some languages are missing translations. Click "Auto-Sync All Languages" to automatically 
              translate missing content using AI.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}