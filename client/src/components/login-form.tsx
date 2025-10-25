import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import API from "@/api/axios";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/features/user/userSlice";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  setSignInModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  setSignInModal,
  ...props
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/user/login", { email, password });

      if (data.success) {
        // ✅ Store token in localStorage
        localStorage.setItem("token", data.token);

        // ✅ Fetch user data and store in Redux - FIXED
        await dispatch(fetchUser() as any).unwrap();

        // ✅ Show success message
        toast.success("Login Successful!");

        // ✅ Automatically redirect to global feed
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.log("Login error:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong during login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center lg:text-2xl">Sign in</CardTitle>
          <CardDescription className="text-center">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password here"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Continue"}
                </Button>
                <FieldDescription className="text-center mt-4">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setSignInModal(false)}
                    className="hover:underline font-bold text-blue-600 focus:outline-none"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
