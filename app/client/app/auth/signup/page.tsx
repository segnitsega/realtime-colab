"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, User, AtSign, Mail, Lock, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { signUpSchema, type SignUpInput } from "validation";
import { authApi } from "@/lib/api";
import { api } from "@/lib/http";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SignUpInput) => {
      const res = await api.post(authApi.signup(), values);
      return res.data;
    },
    onSuccess: (data) => {
      const token = data?.data?.token;
      const refreshToken = data?.data?.refreshToken;
      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
        if (refreshToken) window.localStorage.setItem("refreshToken", refreshToken);
      }
      router.push("/");
      router.refresh();
    },
  });

  const onSubmit = (values: SignUpInput) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-[80px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 font-bold text-xl text-slate-50 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="tracking-tight">realtime co-lab</span>
        </Link>

        <div className="w-full max-w-[400px] rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Create an account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your details below to get started.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300">
                Display name <span className="text-slate-500">(optional)</span>
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="How you'll appear"
                  {...register("displayName")}
                  className={cn(
                    "w-full rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 pl-10 pr-3 text-slate-50 placeholder:text-slate-500",
                    "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                Username
              </label>
              <div className="relative mt-1">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="username"
                  {...register("username")}
                  className={cn(
                    "w-full rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 pl-10 pr-3 text-slate-50 placeholder:text-slate-500",
                    "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={cn(
                    "w-full rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 pl-10 pr-3 text-slate-50 placeholder:text-slate-500",
                    "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 pl-10 pr-3 text-slate-50 placeholder:text-slate-500",
                    "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {mutation.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {(mutation.error as Error).message}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-50",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              )}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
