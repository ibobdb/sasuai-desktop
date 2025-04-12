import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export function SystemStats() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    // Get static data on component mount
    window.electron.getStaticData().then(setStaticData);

    // Subscribe to statistics updates
    const unsubscribe = window.electron.subscribeStatistics((stats) => {
      setStatistics(stats);
    });

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  if (!statistics || !staticData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="mb-4 h-3 w-32" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value > 0.8) return 'text-destructive';
    if (value > 0.6) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M9 3H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
            <path d="M20 3h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
            <path d="M9 14H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Z" />
            <path d="M20 14h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getStatusColor(statistics.cpuUsage)}`}
          >
            {(statistics.cpuUsage * 100).toFixed(1)}%
          </div>
          <p
            className="text-xs text-muted-foreground truncate"
            title={staticData.cpuModel}
          >
            {staticData.cpuModel}
          </p>
          <Progress
            value={statistics.cpuUsage * 100}
            className="mt-2"
            indicatorClassName={
              statistics.cpuUsage > 0.8
                ? 'bg-destructive'
                : statistics.cpuUsage > 0.6
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getStatusColor(statistics.ramUsage)}`}
          >
            {(statistics.ramUsage * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Total: {staticData.totalMemoryGB} GB
          </p>
          <Progress
            value={statistics.ramUsage * 100}
            className="mt-2"
            indicatorClassName={
              statistics.ramUsage > 0.8
                ? 'bg-destructive'
                : statistics.ramUsage > 0.6
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M21 5H3v14h18V5Z" />
            <path d="M21 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2" />
            <path d="M3 5v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5" />
          </svg>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getStatusColor(statistics.storageData)}`}
          >
            {(statistics.storageData * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Total: {staticData.totalStorage} GB
          </p>
          <Progress
            value={statistics.storageData * 100}
            className="mt-2"
            indicatorClassName={
              statistics.storageData > 0.8
                ? 'bg-destructive'
                : statistics.storageData > 0.6
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
