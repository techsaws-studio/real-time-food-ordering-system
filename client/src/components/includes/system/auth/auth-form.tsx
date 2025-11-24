"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { ApiRequest } from "@/utils/api-request";
import { LoginResponse } from "@/types/components.includes-interfaces";

function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ApiRequest<LoginResponse>("auth/login", "POST", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.success && response.data) {
        const { user } = response.data;

        document.cookie = `user_role=${user.role}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;

        const userInfo = {
          userId: user.userId,
          email: user.email,
          name: user.name,
        };
        document.cookie = `user_info=${encodeURIComponent(
          JSON.stringify(userInfo)
        )}; path=/; max-age=${7 * 24 * 60 * 60}`;

        toast.success("Login successful!");

        const redirectMap = {
          ADMIN: "/admin/overview",
          KITCHEN: "/kitchen/orders-console",
          RECEPTIONIST: "/receptionist/tables-management",
        };

        router.push(redirectMap[user.role]);
        router.refresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="md:w-[500px] w-full bg-card border-border">
      <CardContent className="pt-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="bg-input h-[50px]"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="bg-input h-[50px]"
              required
              disabled={loading}
            />
          </div>

          <div className="w-full flex items-center justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="hover:bg-accent md:w-fit md:px-8 font-semibold bg-background text-accent hover:text-accent-foreground w-full h-[43px] border-border"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Please wait
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AuthForm;
