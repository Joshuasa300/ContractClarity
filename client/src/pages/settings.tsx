import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Trash2, Settings as SettingsIcon, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import Header from '@/components/Header';

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });

      setIsEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently removed.",
      });

      // Redirect to home page after successful deletion
      setLocation('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Header 
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/' },
          { label: t('nav.settings') }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-600 mt-1">{t('settings.description')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.account.title')}</CardTitle>
              <CardDescription>{t('settings.account.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                {!isEditing ? (
                  <Button variant="outline" onClick={handleStartEdit} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelEdit} size="sm" disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} size="sm" disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('settings.account.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('settings.account.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t('settings.account.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <Label>{t('settings.account.plan')}</Label>
                    <p className="text-gray-900 mt-1 capitalize">
                      {user?.accountStatus === 'null' 
                        ? 'Payment Required' 
                        : user?.accountStatus?.charAt(0).toUpperCase() + user?.accountStatus?.slice(1) || 'Free'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('settings.account.firstName')}</label>
                    <p className="text-gray-900 mt-1">{user?.firstName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('settings.account.lastName')}</label>
                    <p className="text-gray-900 mt-1">{user?.lastName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('settings.account.email')}</label>
                    <p className="text-gray-900 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('settings.account.plan')}</label>
                    <p className="text-gray-900 mt-1 capitalize">
                      {user?.accountStatus === 'null' 
                        ? 'Payment Required' 
                        : user?.accountStatus?.charAt(0).toUpperCase() + user?.accountStatus?.slice(1) || 'Free'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">{t('settings.danger.title')}</CardTitle>
              <CardDescription>{t('settings.danger.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>{t('settings.danger.warning')}:</strong> {t('settings.danger.disclaimer')}
                </p>
              </div>
              
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('settings.danger.deleteButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">{t('settings.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('settings.deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t('settings.deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t('settings.deleteDialog.deleting') : t('settings.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}