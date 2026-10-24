import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your SM Store account.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="rounded-3xl border-border/70 shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter the email address linked to your account. We will send a secure,
          time-limited reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
