import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeNextPath } from "@/lib/navigation";

export const metadata = {
  title: "Create account",
  description: "Create your SM Store customer account.",
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next, "/account");

  return (
    <Card className="rounded-3xl border-border/70 shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Create your account
        </CardTitle>
        <CardDescription>
          One account for checkout, order updates, and product reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm nextPath={nextPath} />
      </CardContent>
    </Card>
  );
}
