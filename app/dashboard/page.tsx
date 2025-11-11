import { auth } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PassengerForm from "@/components/passenger-form"
import PassengerList from "@/components/passenger-list"
import MonthlySelection from "@/components/monthly-selection"
import ReportView from "@/components/report-view"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Header with logout button */}
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Bus Season Check System</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage passengers and monthly season selections</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="passengers" className="w-full">
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-4">
              <TabsTrigger value="passengers">List</TabsTrigger>
              <TabsTrigger value="add-passenger">Add Passenger</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Selection</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="passengers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Passenger List</CardTitle>
                  <CardDescription>View all registered passengers</CardDescription>
                </CardHeader>
                <CardContent>
                  <PassengerList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-passenger" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Passenger</CardTitle>
                  <CardDescription>Register a new passenger to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <PassengerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Season Selection</CardTitle>
                  <CardDescription>Select passengers for this month's season</CardDescription>
                </CardHeader>
                <CardContent>
                  <MonthlySelection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>View and print season reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportView />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}
