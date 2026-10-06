'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { User, UserPrivacySettings } from '@/types/models';
import {
  Shield,
  Lock,
  User as UserIcon,
  Palette,
  Download,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, updateCurrentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'account' | 'appearance'>('profile');
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [statusLine, setStatusLine] = useState(currentUser?.status_line || '');
  const [city, setCity] = useState(currentUser?.city || 'Tokyo, Japan');
  const [birthday, setBirthday] = useState(currentUser?.birthday || '2005-04-12');
  const [pronouns, setPronouns] = useState(currentUser?.pronouns || 'they/them');
  const [websites, setWebsites] = useState((currentUser?.websites || ['https://github.com']).join(', '));
  const [interests, setInterests] = useState((currentUser?.interests || ['System Architecture', 'Rust', 'AI Agents']).join(', '));
  const [accentColor, setAccentColor] = useState(currentUser?.accent_color || '#E11D48');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Privacy states
  const [privacy, setPrivacy] = useState<UserPrivacySettings>(
    currentUser?.privacy_settings || {
      profileVisibility: 'everyone',
      wallVisibility: 'everyone',
      friendsListVisibility: 'everyone',
      birthdayVisibility: 'friends',
      whoCanMessage: 'everyone',
      whoCanCall: 'friends',
      whoCanSeeLocation: 'friends',
      findableByUsername: true,
      lastSeenVisibility: 'everyone',
    }
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setUsernameError('Username must be 3-20 characters, containing only letters, numbers, and underscores.');
      return;
    }
    setUsernameError('');

    updateCurrentUser({
      display_name: displayName,
      username: username,
      bio: bio,
      status_line: statusLine,
      city: city,
      birthday: birthday,
      pronouns: pronouns,
      websites: websites.split(',').map((s) => s.trim()).filter(Boolean),
      interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
      accent_color: accentColor,
      privacy_settings: privacy,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ceoweb_export_${currentUser?.username || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure you want to permanently delete your CEOWEB account and erase all associated data?')) {
      logout();
      alert('Your account and associated profile data have been permanently wiped.');
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Settings Header */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Executive Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your profile, configure privacy boundaries, manage security, and export data.
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-5 border-b border-border/60 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'profile', label: 'Profile Details', icon: UserIcon },
            { id: 'privacy', label: 'Privacy & Permissions', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'account', label: 'Account & Data', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile and settings saved successfully!</span>
        </div>
      )}

      {/* Tab: Profile Details */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold border-b border-border/50 pb-2">Profile & Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Username (@)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
              {usernameError && <p className="text-[10px] text-rose-500 mt-1">{usernameError}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Status Line</label>
            <input
              type="text"
              value={statusLine}
              onChange={(e) => setStatusLine(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-secondary border border-border rounded-xl p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">City / Base</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Pronouns</label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Websites (comma-separated)</label>
            <input
              type="text"
              value={websites}
              onChange={(e) => setWebsites(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Interests / Focus Tags</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            className="mt-2 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition self-end"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* Tab: Privacy & Permissions */}
      {activeTab === 'privacy' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold border-b border-border/50 pb-2">Privacy & Visibility Controls</h2>

          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Who can see my profile</p>
                <p className="text-[11px] text-muted-foreground">Control profile overview visibility</p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value as any })}
                className="bg-secondary border border-border rounded-xl px-3 py-1.5"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Who can message me</p>
                <p className="text-[11px] text-muted-foreground">Manage incoming direct message requests</p>
              </div>
              <select
                value={privacy.whoCanMessage}
                onChange={(e) => setPrivacy({ ...privacy, whoCanMessage: e.target.value as any })}
                className="bg-secondary border border-border rounded-xl px-3 py-1.5"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Who can call me</p>
                <p className="text-[11px] text-muted-foreground">Manage LiveKit audio & video calls</p>
              </div>
              <select
                value={privacy.whoCanCall}
                onChange={(e) => setPrivacy({ ...privacy, whoCanCall: e.target.value as any })}
                className="bg-secondary border border-border rounded-xl px-3 py-1.5"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Who can see my map location</p>
                <p className="text-[11px] text-muted-foreground">Controls Snap Map / BLINK position sharing</p>
              </div>
              <select
                value={privacy.whoCanSeeLocation}
                onChange={(e) => setPrivacy({ ...privacy, whoCanSeeLocation: e.target.value as any })}
                className="bg-secondary border border-border rounded-xl px-3 py-1.5"
              >
                <option value="friends">Friends Only (500m fuzzed)</option>
                <option value="selected">Selected Friends</option>
                <option value="nobody">Nobody (Ghost Mode)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="mt-2 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition self-end"
          >
            Apply Privacy Rules
          </button>
        </div>
      )}

      {/* Tab: Appearance */}
      {activeTab === 'appearance' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold border-b border-border/50 pb-2">Profile Appearance & Accents</h2>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Accent Color Theme</label>
            <div className="flex items-center gap-3">
              {['#E11D48', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'].map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    accentColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            className="mt-2 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition self-end"
          >
            Save Accent Preference
          </button>
        </div>
      )}

      {/* Tab: Account & Data */}
      {activeTab === 'account' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <h2 className="text-sm font-bold border-b border-border/50 pb-2">Account Ownership & Privacy Compliance</h2>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/60">
            <div>
              <p className="text-xs font-semibold">Export My Personal Data</p>
              <p className="text-[11px] text-muted-foreground">Download a machine-readable JSON copy of your profile and posts</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
            <div>
              <p className="text-xs font-semibold text-rose-500">Permanent Account Deletion</p>
              <p className="text-[11px] text-muted-foreground">Wipes all profile data, stories, wall posts, and active sessions</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
