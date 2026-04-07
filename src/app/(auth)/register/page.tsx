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

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().optional(),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message);
        return;
      }

      // Auto login after register
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
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
    <div className="min-h-screen bg-radial bg-grid flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <motion.div
        className="absolute w-125 h-125 rounded-full bg-neon-cyan/5 blur-[120px] -bottom-48 -left-48"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{
          duration: 12,
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
          <p className="text-slate-400">Tạo tài khoản để bắt đầu chơi</p>
        </div>

        <Card className="glass border border-white/5 shadow-lg">
          <Card.Header className="flex flex-col gap-1 px-6 pt-6">
            <h1 className="text-2xl font-bold">Đăng ký</h1>
          </Card.Header>
          <hr className="border-t border-white/10" />
          <Card.Content className="px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isInvalid={!!errors.name}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium">Họ và tên</Label>
                    <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-lg border w-full bg-transparent outline-none transition-colors" />
                    <FieldError className="text-xs text-danger">
                      {errors.name?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="email"
                    isInvalid={!!errors.email}
                    className="flex flex-col gap-1"
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
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="tel"
                    isInvalid={!!errors.phone}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium">
                      Số điện thoại (tùy chọn)
                    </Label>
                    <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-lg border w-full bg-transparent outline-none transition-colors" />
                    <FieldError className="text-xs text-danger">
                      {errors.phone?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="password"
                    isInvalid={!!errors.confirmPassword}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium">
                      Xác nhận mật khẩu
                    </Label>
                    <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-lg border w-full bg-transparent outline-none transition-colors" />
                    <FieldError className="text-xs text-danger">
                      {errors.confirmPassword?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isDisabled={isLoading}
                className="font-semibold text-base mt-2 shadow-lg"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
}
