"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader, AlertCircle } from "lucide-react"

interface Settings {
  id: string
  logo_url: string
  favicon_url: string
  about_text: string
  contact_text: string
  primary_color: string
  secondary_color: string
  storage_type: "supabase" | "vercel_blob" | "cloudinary" | "local"
  cloudinary_cloud_name?: string
  cloudinary_api_key?: string
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        setError("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (field: string, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value })
    }
  }

  const handleSubmit = async () => {
    if (!settings) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error("Failed to save")

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!settings) return <div>No settings found</div>

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm">
          Settings saved successfully
        </div>
      )}

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo URL</Label>
            <Input
              value={settings.logo_url}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Favicon URL</Label>
            <Input
              value={settings.favicon_url}
              onChange={(e) => handleChange("favicon_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                className="w-20"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.secondary_color}
                onChange={(e) => handleChange("secondary_color", e.target.value)}
                className="w-20"
              />
              <Input
                value={settings.secondary_color}
                onChange={(e) => handleChange("secondary_color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>About Text</Label>
            <Textarea
              value={settings.about_text}
              onChange={(e) => handleChange("about_text", e.target.value)}
              placeholder="Tell us about your business..."
              rows={4}
            />
          </div>

          <div>
            <Label>Contact Text</Label>
            <Textarea
              value={settings.contact_text}
              onChange={(e) => handleChange("contact_text", e.target.value)}
              placeholder="Contact information..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>File Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Storage Provider</Label>
            <Select value={settings.storage_type} onValueChange={(value) => handleChange("storage_type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase Storage (Default)</SelectItem>
                <SelectItem value="vercel_blob">Vercel Blob</SelectItem>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                <SelectItem value="local">Local Storage (Development)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">Choose where to store product images and payment proofs</p>
          </div>

          {settings.storage_type === "cloudinary" && (
            <>
              <div>
                <Label>Cloudinary Cloud Name</Label>
                <Input
                  value={settings.cloudinary_cloud_name || ""}
                  onChange={(e) => handleChange("cloudinary_cloud_name", e.target.value)}
                  placeholder="your-cloud-name"
                />
              </div>

              <div>
                <Label>Cloudinary API Key</Label>
                <Input
                  type="password"
                  value={settings.cloudinary_api_key || ""}
                  onChange={(e) => handleChange("cloudinary_api_key", e.target.value)}
                  placeholder="Your API key"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  )
}
