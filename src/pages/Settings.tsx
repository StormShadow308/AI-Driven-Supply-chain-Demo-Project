
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weekly: true,
      newFeatures: true
    },
    appearance: {
      darkMode: true,
      animations: true,
      reducedMotion: false,
      highContrast: false
    },
    data: {
      autoSave: true,
      caching: true,
      anonymousAnalytics: true
    },
    account: {
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Administrator"
    }
  });
  
  const handleSettingChange = (category: string, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };
  
  const handleAccountChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [field]: value
      }
    }));
  };
  
  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  const handleClearData = () => {
    // In a real app, this would clear user data
    localStorage.removeItem('departmentData');
    
    toast({
      title: "Data cleared",
      description: "All local data has been cleared successfully.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1 animate-fade-in">
              Manage your account preferences and system settings
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="w-full max-w-md grid grid-cols-4">
              <TabsTrigger value="account">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="w-4 h-4 mr-2" />
                Data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={settings.account.name} 
                        onChange={(e) => handleAccountChange('name', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={settings.account.email} 
                        onChange={(e) => handleAccountChange('email', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{settings.account.role}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Security</h4>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications on your device
                        </p>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-digest">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of important events
                        </p>
                      </div>
                      <Switch 
                        id="weekly-digest" 
                        checked={settings.notifications.weekly}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'weekly', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="new-features">New Feature Announcements</Label>
                        <p className="text-sm text-muted-foreground">
                          Be notified about new features and updates
                        </p>
                      </div>
                      <Switch 
                        id="new-features" 
                        checked={settings.notifications.newFeatures}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'newFeatures', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Use dark theme across the dashboard
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={settings.appearance.darkMode}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'darkMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable animations throughout the UI
                        </p>
                      </div>
                      <Switch 
                        id="animations" 
                        checked={settings.appearance.animations}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'animations', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground">
                          Minimize animations for accessibility
                        </p>
                      </div>
                      <Switch 
                        id="reduced-motion" 
                        checked={settings.appearance.reducedMotion}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'reducedMotion', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="high-contrast">High Contrast</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase contrast for better readability
                        </p>
                      </div>
                      <Switch 
                        id="high-contrast" 
                        checked={settings.appearance.highContrast}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'highContrast', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="data" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage data storage and processing settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-save">Auto-Save</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically save changes as you work
                        </p>
                      </div>
                      <Switch 
                        id="auto-save" 
                        checked={settings.data.autoSave}
                        onCheckedChange={(checked) => handleSettingChange('data', 'autoSave', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="caching">Data Caching</Label>
                        <p className="text-sm text-muted-foreground">
                          Cache data locally for faster performance
                        </p>
                      </div>
                      <Switch 
                        id="caching" 
                        checked={settings.data.caching}
                        onCheckedChange={(checked) => handleSettingChange('data', 'caching', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics">Anonymous Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Share anonymous usage data to help improve the app
                        </p>
                      </div>
                      <Switch 
                        id="analytics" 
                        checked={settings.data.anonymousAnalytics}
                        onCheckedChange={(checked) => handleSettingChange('data', 'anonymousAnalytics', checked)}
                      />
                    </div>
                    
                    <div className="pt-4 border-t space-y-4">
                      <h4 className="text-sm font-medium mb-2">Data Operations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" onClick={handleClearData}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Local Data
                        </Button>
                        <Button variant="outline">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset to Default
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;
