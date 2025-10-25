import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import API from "@/api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/features/user/userSlice";

interface SignupProps extends React.HTMLAttributes<HTMLDivElement> {
  setSignInModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SignupForm: React.FC<SignupProps> = ({
  setSignInModal,
  ...divProps
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/user/register", {
        fullname: formData.fullname.trim(),
        username: formData.email.split("@")[0],
        email: formData.email.trim(),
        password: formData.password,
      });

      if (data.success) {
        // ✅ Store token in localStorage
        localStorage.setItem("token", data.token);

        // ✅ Fetch user data and store in Redux - FIXED
        await dispatch(fetchUser() as any).unwrap();

        toast.success("Account created successfully!");

        // ✅ Automatically redirect to global feed
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.log("Signup error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <Card {...divProps}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-3xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                required
                value={formData.fullname}
                onChange={handleChange}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setSignInModal(true)}
                    className="font-bold text-blue-600 hover:underline focus:outline-none"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
