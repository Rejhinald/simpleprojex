"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Separator,
  InputOTPSeparator,
} from "@/components/shared";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  personalInfoSchema,
  contactInfoSchema,
  verificationSchema,
} from "@/zod-schemas/register/register-schema";
import { useRegister } from "@/hooks/api/auth/register";
import { useVerifyOtp } from "@/hooks/api/auth/verify-otp";

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type ContactInfoValues = z.infer<typeof contactInfoSchema>;
type VerificationValues = z.infer<typeof verificationSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register: registerUser, isLoading: isRegistering, error: registerError } = useRegister();
  const { verifyOtp, isLoading: isVerifyingOtp, error: verifyOtpError } = useVerifyOtp();

  // Form for Step 1: Personal Information
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  // Form for Step 2: Contact Information
  const contactInfoForm = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: formData.email,
      phone: formData.phone,
    },
  });

  // Form for Step 3: Verification
  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      otp: formData.otp,
    },
  });

  // Handle form submission for personal information
  const onPersonalInfoSubmit = (values: PersonalInfoValues) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep(2);
  };

  // Handle form submission for contact information
  const onContactInfoSubmit = async (values: ContactInfoValues) => {
    setIsLoading(true);
    try {
      setFormData((prev) => ({ ...prev, ...values }));
      // Call registration API here if you want to register after contact info
      const result = await registerUser({
        username: formData.username,
        email: values.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      toast.success("Verification code sent", {
        description: `A 6-digit verification code has been sent to ${values.email}`,
        duration: 3000,
        position: "top-center",
      });
      setStep(3);
    } catch (error) {
      toast.error("Error", {
        description: `Failed to send verification code. Please try again.`,
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerificationSubmit = async (values: VerificationValues) => {
    setIsLoading(true);
    try {
      const completeData = {
        ...formData,
        ...values,
      };

      const otpNumber = typeof values.otp === 'string' ? parseInt(values.otp, 10) : values.otp;
      const result = await verifyOtp({ otp: otpNumber });
      if (!result.success) {
        throw new Error(result.error || 'OTP verification failed');
      }
      toast.success("Registration successful!", {
        description: `Your account has been created successfully.`,
        duration: 3000,
        position: "top-center",
      });
    
      window.location.href = "/login";
    } catch (error) {
      toast.error("Registration failed", {
        description: "There was an error creating your account. Please try again.",
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Function to reset form and start over
  const handleReset = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      otp: "",
    });
    setStep(1);
    personalInfoForm.reset();
    contactInfoForm.reset();
    verificationForm.reset();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden w-5xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            {/* Form header */}
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-balance text-muted-foreground">
                Complete the steps below to register.
              </p>

              {/* Progress indicator */}
              <div className="flex items-center w-full max-w-md mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        step === i
                          ? "bg-primary text-primary-foreground"
                          : step > i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step > i ? <Check className="h-3 w-3" /> : i}
                    </div>
                    {i < 3 && (
                      <div
                        className={cn(
                          "h-1 flex-1",
                          step > i ? "bg-primary" : "bg-muted"
                        )}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Form {...personalInfoForm}>
                <form
                  onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={personalInfoForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="johndoe25"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalInfoForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="********"
                              className="pl-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalInfoForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="********"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <Form {...contactInfoForm}>
                <form
                  onSubmit={contactInfoForm.handleSubmit(onContactInfoSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={contactInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="john.doe@example.com"
                              type="email"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactInfoForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="1234567890"
                              type="tel"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Verify"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <Form {...verificationForm}>
                <form
                  onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium">
                      Enter verification code
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a 6-digit code to{" "}
                      <span className="font-medium">{formData.email}</span>
                    </p>
                  </div>

                  <FormField
                    control={verificationForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center justify-center w-full">
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSeparator />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => {
                        toast.success("Verification code resent", {
                          description: `A new code has been sent to ${formData.email}`,
                          duration: 3000,
                          position: "top-center",
                        });
                      }}
                    >
                      Didn't receive the code? Resend
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Complete"}
                      {!isLoading && <Check className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Footer with login link */}
            <div className="text-center mt-6">
              <Separator className="my-4" />
              <p className="text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Registration banner image */}
          <div className="relative hidden h-full p-0 md:block">
            <div
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
              <p className="text-sm opacity-90">
                Create an account to access exclusive features and connect with
                thousands of users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By registering, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
