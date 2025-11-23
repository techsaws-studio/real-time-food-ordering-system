"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function AuthForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
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
      toast.success("Signed in successfully!");
      console.log("Logged in:", formData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="md:w-[500px] w-full bg-card border-border">
      <CardContent className="pt-6">
        <form
          className="space-y-5"
          onSubmit={handleSubmit}
          aria-label="sign-in form"
        >
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              className="bg-input h-[50px]"
              required
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
