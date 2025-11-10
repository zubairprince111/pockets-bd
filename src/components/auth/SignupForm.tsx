"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";


function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Google</title>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.55 1.9-3.47 0-6.3-2.89-6.3-6.4s2.83-6.4 6.3-6.4c1.93 0 3.27.79 4.27 1.74l2.55-2.55C17.43 2.72 15.25 1.5 12.48 1.5c-5.48 0-9.94 4.46-9.94 9.94s4.46 9.94 9.94 9.94c5.22 0 9.4-3.51 9.4-9.22 0-.6-.06-1.18-.16-1.72h-9.24z"
      />
    </svg>
  );
}

export function SignupForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all fields.",
        });
        return;
    }
    
    initiateEmailSignUp(auth, email, password);
    const unsubscribe = auth.onAuthStateChanged(newUser => {
      if (newUser) {
        const userRef = doc(firestore, "users", newUser.uid);
        setDocumentNonBlocking(userRef, {
            id: newUser.uid,
            name: name,
            email: email,
        }, { merge: true });
        unsubscribe();
      }
    });

    toast({
      title: "Creating account...",
      description: "Please wait a moment.",
    });
  };

  const handleGoogleSignUp = () => {
    // Here you would handle Google Sign-Up
    toast({
      title: "Google Sign-Up",
      description: "In a real app, this would open the Google Sign-Up popup.",
    });
  };

  if (isUserLoading || user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
                <CardDescription>
                Start tracking your finances in seconds.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Start tracking your finances in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="Your Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
    </Card>
  );
}
