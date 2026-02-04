"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { setUser } from "@/store/slices/authSlice"
import { signup as signupUser } from "@/lib/auth"

const signupSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true)
    setError(null)
    try {
      // Signup will set HTTP-only cookies automatically via Better Auth
      const user = await signupUser(values.name, values.email, values.password)
      dispatch(setUser(user))
      router.push('/dashboard')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Signup failed. Please try again.'
      setError(errorMessage)
      console.error('Signup failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold tracking-tight text-center">Create account</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="name@example.com"
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-base transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card/50 px-2 text-muted-foreground backdrop-blur-xl">
              Already have an account?
            </span>
          </div>
        </div>
        
        <Link 
          href="/login" 
          className="w-full"
        >
          <Button variant="outline" className="w-full h-11 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
            Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
