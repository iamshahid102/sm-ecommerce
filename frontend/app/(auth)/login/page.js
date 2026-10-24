import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeNextPath } from "@/lib/navigation";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your SM Store account.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next, "/account");

  return (
    <Card className="rounded-3xl border-border/70 shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to manage your profile, orders, and reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          nextPath={nextPath}
          initialError={
            typeof params?.error === "string" ? params.error : undefined
          }
          initialMessage={
            typeof params?.message === "string" ? params.message : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
