'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions';
import CustomInput from '@/components/CustomInput'; // adjust relative path if needed
import ConnectBank from '@/components/ConnectBank'; // mock connector (ensure file exists)

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState<null | { username: string }>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(type === 'sign-up' && {
        firstName: '',
        lastName: '',
        address1: '',
        state: '',
        postalCode: '',
        aadhar: '',
        dateOfBirth: '',
      }),
    },
  });

 const onSubmit = async (data: z.infer<typeof formSchema>) => {
  console.log("[onSubmit] fired with data:", data);
  alert("[onSubmit] fired — check console for details");
  setIsLoading(true);
  try {
    if (type === "sign-up") {
      console.log("[onSubmit] sign-up branch");
      const userData = {
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        address1: data.address1 ?? null,
        city: (data as any).city ?? null,
        state: data.state ?? null,
        postalCode: data.postalCode ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        aadhar: data.aadhar ?? null,
        email: data.email,
        password: data.password,
      };
      console.log("[onSubmit] signUp userData:", userData);
      const newUser = await signUp(userData).catch((e) => {
        console.error("[signUp] threw:", e);
        return { error: e?.message ?? String(e) };
      });
      console.log("[onSubmit] signUp returned:", newUser);
      setUser(newUser);
    }

    if (type === "sign-in") {
      console.log("[onSubmit] sign-in branch");
      const response = await signIn({
        email: data.email,
        password: data.password,
      }).catch((e) => {
        console.error("[signIn] threw:", e);
        return { ok: false, error: e?.message ?? String(e) };
      });
      console.log("[onSubmit] signIn returned:", response);
      if (response?.ok) {
        router.push("/");
      } else {
        alert("Sign in failed: " + (response?.error || "Unknown error"));
      }
    }
  } catch (error) {
    console.error("[onSubmit] unexpected error:", error);
    alert("Unexpected error. See console.");
  } finally {
    setIsLoading(false);
  }
};


  // Handler called when ConnectBank returns a selected/new account
  async function handleBankConnected(newAccount: any) {
    try {
      console.log('Connected bank (mock):', newAccount);
      // TODO: Persist this to Appwrite via an API call or server action.
      // Example placeholder:
      // await fetch('/api/accounts', { method: 'POST', body: JSON.stringify(newAccount) });

      // Give user feedback (replace with toast later)
      alert(`Connected bank: ${newAccount.accountName ?? newAccount.accountName}`);
    } catch (err) {
      console.error('Failed to persist connected bank:', err);
      alert('Could not connect bank. See console for details.');
    }
  }

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image src="/icons/logo.svg" width={34} height={34} alt="Horizon logo" />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user ? 'Link your account to get started' : 'Please enter your details'}
          </p>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          {/* Replaced PlaidLink with ConnectBank mock component */}
          <ConnectBank onConnect={(acc) => handleBankConnected(acc)} />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === 'sign-up' && (
                <>
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="firstName" label="First Name" placeholder="Enter your first name" />
                    <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Enter your last name" />
                  </div>
                  <CustomInput control={form.control} name="address1" label="Address" placeholder="Enter your address" />
                  <CustomInput control={form.control} name="city" label="City" placeholder="Enter your City" />
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="state" label="State" placeholder="Example: Maharashtra" />
                    <CustomInput control={form.control} name="postalCode" label="Postal Code" placeholder="Example: 560001" />
                  </div>
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="aadhar" label="Aadhar" placeholder="Example: 1234" />
                    <CustomInput control={form.control} name="dateOfBirth" label="Date of Birth" placeholder="DD-MM-YYYY" />
                  </div>
                </>
              )}

              <CustomInput control={form.control} name="email" label="E-mail" placeholder="Enter your E-mail" />
              <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />

              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="form-btn">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                    </>
                  ) : (
                    type === 'sign-in' ? 'Sign In' : 'Sign Up'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="form-link">
              {type === 'sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
