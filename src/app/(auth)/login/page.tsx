"use client";

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial bg-grid flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        className="absolute w-125 h-125 rounded-full bg-primary-500/30 blur-[120px] -top-48 -right-48"
        animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-neon-cyan flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-2xl font-bold">MiniQuiz</span>
          </Link>
          <p className="text-slate-400">Đăng nhập để tiếp tục chơi</p>
        </div>

        <Card className="glass border border-white/5 shadow-lg">
          <Card.Header className="flex flex-col gap-1 px-6 pt-6">
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
          </Card.Header>
          <hr className="border-t border-white/10" />
          <Card.Content className="px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    className="flex flex-col gap-1"
                    isInvalid={!!errors.email}
                  >
                    <Label className="text-sm font-medium">Email</Label>
                    <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-lg border w-full bg-transparent outline-none transition-colors" />
                    <FieldError className="text-xs text-danger">
                      {errors.email?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    isInvalid={!!errors.password}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium">Mật khẩu</Label>
                    <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-lg border w-full bg-transparent outline-none transition-colors" />
                    <FieldError className="text-xs text-danger">
                      {errors.password?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="font-semibold text-base mt-2 shadow-lg"
                isDisabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
}
