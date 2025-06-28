'use client'
import { Button } from '@repo/mobile-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/mobile-ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/mobile-ui/components/tabs'
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

export default function HomePage() {
  const handleCreateUser = async () => {
    const endpoint = 'https://cr14j094k1.execute-api.us-east-1.amazonaws.com/dev/users'
    const payload = {
      id: '1234567890',
      name: 234,
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'MZBzQlCwIS23M7JaIFpUmbOVw5Fz3dx5KDgnPlj',
      },
      body: JSON.stringify(payload),
    }

    try {
      const response = await fetch(endpoint, options)

      if (!response.ok) {
        const errorData = await response.json()
        // throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        console.error('Error creating user:', errorData)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      // throw error instanceof Error
      //   ? error
      //   : new Error('An unexpected error occurred while creating user')
    }
  }

  return (
    <div className="flex flex-col p-4 md:p-8 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your finances and track your spending.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowUpRight className="h-4 w-4" />
            <span>Income</span>
          </Button>
          <Button size="sm" className="gap-1">
            <ArrowDownRight className="h-4 w-4" />
            <span>Expense</span>
          </Button>
          <Button size="sm" className="gap-1" onClick={handleCreateUser}>
            <ArrowDownRight className="h-4 w-4" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234.00</div>
            <p className="text-xs text-muted-foreground">+4.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,677.89</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6,556.11</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
              <CardDescription>Your financial activity for today.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="rounded-md border">
                {/* Placeholder for daily transactions */}
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  No transactions recorded today
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Your financial summary for this month.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="rounded-md border">
                {/* Placeholder for monthly chart */}
                <div className="h-[200px] bg-muted/20"></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-8"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add new transaction</span>
      </Button>
    </div>
  )
}
