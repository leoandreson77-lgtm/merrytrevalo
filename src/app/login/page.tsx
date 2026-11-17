"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plane, Lock, Mail, Loader2 } from "lucide-react";

const loginSchema = zod.object({
  email: zod.string().email({ message: "Please enter a valid email address" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        toast({
          title: "Sign in failed",
          description: res.error,
          variant: "destructive",
        });
      } else if (res?.ok) {
        toast({
          title: "Welcome back!",
          description: "Opening Admin Console...",
        });
        const safeTarget = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin";
        window.location.assign(safeTarget);
      } else {
        toast({
          title: "Sign in failed",
          description: "Unable to create session. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "An error occurred",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 z-0" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl z-0" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 backdrop-blur-md text-white shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex justify-center">
            <span className="text-2xl font-black text-white tracking-tight">MerryTravelo</span>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Enterprise Console</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your CRM, Call Tracking, and Vendor panels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  className="pl-10 border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:ring-offset-0"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  className="pl-10 border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:ring-offset-0"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/50 py-4">
          <p className="text-xs text-slate-500">
            Secure, encrypted TLS connection. Authorized personnel only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-semibold">Loading...</div>}>
      <LoginPageContent />
    </React.Suspense>
  );
}
