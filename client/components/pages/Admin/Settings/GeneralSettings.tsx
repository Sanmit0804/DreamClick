import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:5000/api';

const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

interface SettingsData {
  appName: string;
  contactEmail: string;
  supportPhone: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    faviconUrl: string;
  };
  maintenanceMode: boolean;
  features: {
    enableRegistrations: boolean;
    enableYoutubeUploads: boolean;
  };
  branding: {
    logoUrl: string;
    themeColor: string;
  };
  layout: {
    showFooter: boolean;
    showHeader: boolean;
  };
}

export default function GeneralSettings() {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/settings`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string | null, field: string, value: any) => {
    if (!settings) return;

    if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...(settings as any)[section],
          [field]: value,
        },
      });
    } else {
      setSettings({
        ...settings,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Settings updated successfully!');
        setSettings(json.data);
        refreshSettings(); // Sync global context
      } else {
        toast.error(json.message || 'Failed to update settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application's core configuration and global preferences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* App Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>Basic details about your platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => handleChange(null, 'appName', e.target.value)}
                placeholder="DreamClick"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange(null, 'contactEmail', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={settings.supportPhone}
                onChange={(e) => handleChange(null, 'supportPhone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features & Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
            <CardDescription>Toggle platform features on or off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent users from accessing the platform.
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => handleChange(null, 'maintenanceMode', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">User Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to sign up.
                </p>
              </div>
              <Switch
                checked={settings.features.enableRegistrations}
                onCheckedChange={(v) => handleChange('features', 'enableRegistrations', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">YouTube Uploads</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automated YouTube Shorts uploads.
                </p>
              </div>
              <Switch
                checked={settings.features.enableYoutubeUploads}
                onCheckedChange={(v) => handleChange('features', 'enableYoutubeUploads', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Meta Settings</CardTitle>
            <CardDescription>Default meta tags for search engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Default Title</Label>
              <Input
                id="seoTitle"
                value={settings.seo.title}
                onChange={(e) => handleChange('seo', 'title', e.target.value)}
                placeholder="App Title - Catchphrase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDesc">Default Description</Label>
              <Textarea
                id="seoDesc"
                rows={3}
                value={settings.seo.description}
                onChange={(e) => handleChange('seo', 'description', e.target.value)}
                placeholder="Brief description of the platform."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">Keywords</Label>
              <Input
                id="seoKeywords"
                value={settings.seo.keywords}
                onChange={(e) => handleChange('seo', 'keywords', e.target.value)}
                placeholder="comma, separated, keywords"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={settings.seo.faviconUrl}
                onChange={(e) => handleChange('seo', 'faviconUrl', e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Connect your community across platforms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['youtube', 'twitter', 'facebook', 'instagram', 'linkedin'].map((platform) => (
              <div key={platform} className="space-y-2">
                <Label htmlFor={`social-${platform}`} className="capitalize">{platform}</Label>
                <Input
                  id={`social-${platform}`}
                  value={(settings.socialLinks as any)[platform]}
                  onChange={(e) => handleChange('socialLinks', platform, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Branding Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your app's visual identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={settings.branding.logoUrl}
                onChange={(e) => handleChange('branding', 'logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="themeColor">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="themeColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={settings.branding.themeColor}
                  onChange={(e) => handleChange('branding', 'themeColor', e.target.value)}
                />
                <Input
                  value={settings.branding.themeColor}
                  onChange={(e) => handleChange('branding', 'themeColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>Control global UI elements visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Header</Label>
                <p className="text-sm text-muted-foreground">Display the main navigation bar.</p>
              </div>
              <Switch
                checked={settings.layout.showHeader}
                onCheckedChange={(v) => handleChange('layout', 'showHeader', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Footer</Label>
                <p className="text-sm text-muted-foreground">Display the site footer.</p>
              </div>
              <Switch
                checked={settings.layout.showFooter}
                onCheckedChange={(v) => handleChange('layout', 'showFooter', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
