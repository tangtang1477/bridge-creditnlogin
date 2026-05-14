import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyPosts } from "@/components/profile/EmptyPosts";
import type { Locale } from "@/lib/aideo/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · MovieFlow" },
      { name: "description", content: "MovieFlow personal profile with Studio sign-in entry." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [locale, setLocale] = useState<Locale>("zh");
  return (
    <div data-theme="aideo-dark" className="min-h-screen bg-background text-foreground">
      <ProfileHeader locale={locale} setLocale={setLocale} active="nav_home" />
      <ProfileCard locale={locale} />
      <EmptyPosts locale={locale} />
    </div>
  );
}
