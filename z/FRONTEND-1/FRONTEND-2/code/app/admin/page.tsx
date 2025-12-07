import { Header } from "@/components/header"
import { AdminStats } from "@/components/admin-stats"
import { RecentActivity } from "@/components/recent-activity"
import { ContentManagement } from "@/components/content-management"
import { UserManagement } from "@/components/user-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">Gérez votre plateforme de streaming</p>
        </div>

        {/* Stats Overview */}
        <AdminStats />

        {/* Management Tabs */}
        <Tabs defaultValue="content" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <RecentActivity />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
