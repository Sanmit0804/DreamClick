'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Youtube, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Upload, 
  Unplug, 
  ExternalLink,
  Clock,
  AlertCircle,
  TrendingUp,
  Video,
  Activity,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import styles from './youtube.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// We'll map the calls specifically since YouTube is under /youtube, not /api/youtube usually, but let's check index.js
// Ah, index.js has: app.use('/youtube', youtubeRoute);
const YT_API_BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '/youtube') : 'http://localhost:5000/youtube';

interface ConnectionStatus {
  connected: boolean;
  email: string | null;
  expiryDate: number | null;
  updatedAt: string | null;
  queue: {
    size: number;
    pending: number;
    isPaused: boolean;
  };
}

interface UploadLog {
  _id: string;
  templateId: string;
  templateName: string;
  youtubeVideoId: string | null;
  youtubeVideoUrl: string | null;
  status: 'pending' | 'processing' | 'success' | 'failed';
  retries: number;
  errorMessage: string | null;
  triggeredBy: string;
  createdAt: string;
  updatedAt: string;
}

interface LogsResponse {
  data: UploadLog[];
  meta: { page: number; limit: number; total: number; pages: number };
}

const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export default function YoutubeAdmin() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [logsMeta, setLogsMeta] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${YT_API_BASE}/status`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setStatus(json.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${YT_API_BASE}/logs?${params}`, { headers: authHeaders() });
      const json: { success: boolean } & LogsResponse = await res.json();
      if (json.success) {
        setLogs(json.data);
        setLogsMeta(json.meta);
      }
    } catch (e) {
      console.error(e);
    }
  }, [statusFilter]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchLogs()]);
      setLoading(false);
    };
    init();

    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      showToast('✅ YouTube connected successfully!');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('error')) {
      showToast(`OAuth error: ${params.get('error')}`, 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchStatus, fetchLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 10_000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchLogs]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${YT_API_BASE}/auth/url`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        window.location.href = json.url;
      } else {
        showToast('Failed to get auth URL', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect YouTube?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${YT_API_BASE}/disconnect`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const json = await res.json();
      showToast(json.message || 'Disconnected', json.success ? 'success' : 'error');
      await fetchStatus();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualUpload = async () => {
    if (!templateId.trim()) {
      showToast('Enter a Template ID first', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${YT_API_BASE}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ templateId: templateId.trim(), triggeredBy: 'manual' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Upload queued! Log ID: ${json.logId}`);
        setTemplateId('');
        await fetchLogs();
      } else {
        showToast(json.error?.message || 'Upload failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusIcon = (s: UploadLog['status']) => {
    switch (s) {
      case 'success':   return <CheckCircle2 size={16} className={styles.iconSuccess} />;
      case 'failed':    return <XCircle size={16} className={styles.iconError} />;
      case 'processing':return <Loader2 size={16} className={`${styles.iconWarning} ${styles.spin}`} />;
      default:          return <Clock size={16} className={styles.iconMuted} />;
    }
  };

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 size={40} className={styles.spin} />
        <p>Loading YouTube Dashboard…</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Uploads', value: logsMeta.total, icon: <Video size={20} /> },
    { label: 'Queue Size', value: status?.queue.size ?? 0, icon: <Activity size={20} /> },
    { label: 'Processing', value: status?.queue.pending ?? 0, icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Youtube size={28} />
          </div>
          <div>
            <h1>YouTube Shorts Manager</h1>
            <p>Manage automated uploads to your YouTube channel</p>
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={() => { fetchStatus(); fetchLogs(); }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Connection Status</span>
              <span className={`${styles.badge} ${status?.connected ? styles.badgeSuccess : styles.badgeError}`}>
                {status?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className={styles.cardBody}>
              {status?.connected ? (
                <>
                  <div className={styles.connectedInfo}>
                    <CheckCircle2 size={40} className={styles.iconSuccess} />
                    <div>
                      <p className={styles.connEmail}>{status.email}</p>
                      <p className={styles.connMeta}>
                        Last synced: {status.updatedAt ? relativeTime(status.updatedAt) : '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={handleDisconnect}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 size={16} className={styles.spin} /> : <Unplug size={16} />}
                    Disconnect YouTube
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.disconnectedInfo}>
                    <Youtube size={48} className={styles.iconMuted} />
                    <p>No YouTube account connected.</p>
                    <p className={styles.subText}>
                      Connect once and uploads will happen automatically.
                    </p>
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleConnect}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 size={16} className={styles.spin} /> : <Youtube size={16} />}
                    Connect with Google
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Manual Upload</span>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.subText}>
                Trigger a YouTube upload for any existing template by its MongoDB ID.
              </p>
              <div className={styles.inputGroup}>
                <Search size={16} className={styles.inputIcon} />
                <input
                  className={styles.input}
                  placeholder="Paste Template ID here…"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                />
              </div>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleManualUpload}
                disabled={actionLoading || !status?.connected}
                title={!status?.connected ? 'Connect YouTube first' : ''}
              >
                {actionLoading ? <Loader2 size={16} className={styles.spin} /> : <Upload size={16} />}
                Upload to YouTube
              </button>
              {!status?.connected && (
                <p className={styles.warningText}>
                  <AlertCircle size={14} /> Connect YouTube first
                </p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Upload Queue</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.queueRow}>
                <span>Queued</span>
                <strong>{status?.queue.size ?? 0}</strong>
              </div>
              <div className={styles.queueRow}>
                <span>In Progress</span>
                <strong>{status?.queue.pending ?? 0}</strong>
              </div>
              <div className={styles.queueRow}>
                <span>Paused</span>
                <strong>{status?.queue.isPaused ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card} style={{ height: '100%' }}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Upload History</span>
              <div className={styles.filterRow}>
                <Filter size={14} />
                <select
                  className={styles.select}
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); fetchLogs(1); }}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className={styles.logsBody}>
              {logs.length === 0 ? (
                <div className={styles.emptyLogs}>
                  <Video size={40} />
                  <p>No upload history yet.</p>
                  <p className={styles.subText}>Uploads will appear here automatically.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log._id} className={`${styles.logRow} ${styles[`log_${log.status}`]}`}>
                    <div className={styles.logIcon}>{statusIcon(log.status)}</div>
                    <div className={styles.logMain}>
                      <div className={styles.logName}>{log.templateName || 'Unnamed Template'}</div>
                      <div className={styles.logMeta}>
                        <span className={`${styles.logBadge} ${styles[`badge_${log.status}`]}`}>
                          {log.status}
                        </span>
                        <span>{log.triggeredBy === 'auto' ? '⚡ Auto' : '👆 Manual'}</span>
                        {log.retries > 0 && <span>↩ {log.retries} retries</span>}
                        <span>{relativeTime(log.createdAt)}</span>
                      </div>
                      {log.errorMessage && (
                        <div className={styles.logError}>{log.errorMessage}</div>
                      )}
                    </div>
                    {log.youtubeVideoUrl && (
                      <a
                        href={log.youtubeVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.logLink}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <ChevronRight size={14} className={styles.iconMuted} />
                  </div>
                ))
              )}
            </div>
            {logsMeta.pages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: logsMeta.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === logsMeta.page ? styles.pageBtnActive : ''}`}
                    onClick={() => fetchLogs(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
