'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, MousePointer, Mail, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface ExperimentStats {
  totalPageVisits: number;
  totalButtonClicks: number;
  totalEmailSubmissions: number;
  uniqueSessions: number;
  averageSessionDuration: number;
  conversionRate: number;
  emailSubmissionRate: number;
}

interface ExperimentData {
  event_type: string;
  session_id: string;
  email?: string;
  session_duration_ms?: number;
  created_at: string;
}

export default function ExperimentAnalyticsTab() {
  const [stats, setStats] = useState<ExperimentStats | null>(null);
  const [rawData, setRawData] = useState<ExperimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/experiment?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setRawData(data.rawData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getRecentEmails = () => {
    return rawData
      .filter(item => item.event_type === 'email_submit' && item.email)
      .slice(0, 10)
      .map(item => ({
        email: item.email!,
        timestamp: new Date(item.created_at).toLocaleString(),
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading experiment analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No experiment data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Experiment Analytics</h2>
          <p className="text-muted-foreground">Track fake door experiment performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Visits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageVisits}</div>
            <p className="text-xs text-muted-foreground">
              Unique sessions: {stats.uniqueSessions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Button Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalButtonClicks}</div>
            <p className="text-xs text-muted-foreground">
              Conversion: {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Submissions</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmailSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Submission rate: {stats.emailSubmissionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.averageSessionDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Time on page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <h3 className="font-semibold">Page Visits</h3>
                <p className="text-sm text-muted-foreground">Users who landed on the experiment page</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.totalPageVisits}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div>
                <h3 className="font-semibold">Button Clicks</h3>
                <p className="text-sm text-muted-foreground">Users who clicked "Get Early Access"</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.totalButtonClicks}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <h3 className="font-semibold">Email Submissions</h3>
                <p className="text-sm text-muted-foreground">Users who submitted their email</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.totalEmailSubmissions}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Email Submissions */}
      {getRecentEmails().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recent Email Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRecentEmails().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{item.email}</span>
                  <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
