import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Edit2,
  Save,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useMarketplaceQueries";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}…${principal.slice(-8)}`;
}

export default function UserProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isError } = useCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const principalText = identity?.getPrincipal().toString() ?? "";

  function handleEditClick() {
    setDisplayName(profile?.name ?? "");
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setDisplayName("");
  }

  async function handleSave() {
    const trimmed = displayName.trim();
    if (!trimmed) return;

    try {
      await saveProfile.mutateAsync({ name: trimmed });
      toast.success("Profile saved successfully");
      setIsEditing(false);
    } catch {
      // error handled below via saveProfile.isError
    }
  }

  function handleCopyPrincipal() {
    if (!principalText) return;
    navigator.clipboard.writeText(principalText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  }

  return (
    <main
      className="min-h-screen bg-background py-12 px-4"
      data-ocid="profile.page"
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Page header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                My Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your account details
              </p>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <Card data-ocid="profile.loading_state">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <Alert variant="destructive" data-ocid="profile.error_state">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load your profile. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile card */}
          {!isLoading && !isError && (
            <Card className="shadow-sm border-border">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                  <CardDescription>
                    Your public display name and identity principal
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    data-ocid="profile.edit_button"
                    className="shrink-0"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-sm font-medium">
                    Display Name
                  </Label>

                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        maxLength={64}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave();
                          if (e.key === "Escape") handleCancel();
                        }}
                        autoFocus
                        data-ocid="profile.name.input"
                        className="max-w-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={
                            saveProfile.isPending || !displayName.trim()
                          }
                          data-ocid="profile.save_button"
                        >
                          {saveProfile.isPending ? (
                            <>
                              <Save className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                              Saving…
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 mr-1.5" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={saveProfile.isPending}
                          data-ocid="profile.cancel_button"
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>

                      {saveProfile.isError && (
                        <Alert
                          variant="destructive"
                          className="py-2"
                          data-ocid="profile.error_state"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Failed to save profile. Please try again.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {profile?.name ? (
                        <span className="text-foreground font-medium">
                          {profile.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          No display name set
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Principal */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Principal Identity
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-muted px-3 py-2 text-xs font-mono text-muted-foreground truncate select-all">
                      <span className="sm:hidden">
                        {truncatePrincipal(principalText)}
                      </span>
                      <span className="hidden sm:inline">{principalText}</span>
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPrincipal}
                      className="shrink-0"
                      aria-label="Copy principal"
                    >
                      {copySuccess ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is your unique Internet Computer identity. It cannot be
                    changed.
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    Authenticated
                  </Badge>
                  {profile?.name && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                      data-ocid="profile.success_state"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Profile complete
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>
  );
}
