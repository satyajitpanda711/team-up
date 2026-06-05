import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ProfileClient from "@/app/dashboard/profile/ProfileClient";

export const metadata = {
  title: "Profile | TeamUp",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  await connectDB();

  // Fetch the full user details from the database
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  // Convert to a plain object for the client component
  const safeUser = {
    _id: user._id.toString(),
    name: user.name || "Unknown",
    email: user.email || "",
    image: user.image || "",
    hasGithub: !!user.githubId,
  };

  return (
    <div className="max-w-3xl mx-auto h-full py-8 px-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account details and connections.
        </p>
      </div>
      
      <ProfileClient user={safeUser} />
    </div>
  );
}
