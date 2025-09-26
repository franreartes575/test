"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Calendar, FileText, BarChart3, Clock } from "lucide-react"

export default function HomePage() {
  const modules = [
    {
      title: "Gestión de Pacientes",
      description: "Administra la información completa de los pacientes",
      icon: Users,
      href: "/pacientes",
      color: "text-blue-600",
    },
    {
      title: "Gestión de Profesionales",
      description: "Gestiona los profesionales sanitarios y sus horarios",
      icon: UserCheck,
      href: "/profesionales",
      color: "text-green-600",
    },
    {
      title: "Gestión de Citas",
      description: "Programa y administra las citas médicas",
      icon: Clock,
      href: "/citas",
      color: "text-purple-600",
    },
    {
      title: "Calendario",
      description: "Vista semanal de todas las citas programadas",
      icon: Calendar,
      href: "/calendario",
      color: "text-orange-600",
    },
    {
      title: "Historia Clínica",
      description: "Registros médicos y historial de los pacientes",
      icon: FileText,
      href: "/historial",
      color: "text-red-600",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold">Más Salud</h1>
          <img 
          src="/icono.webp" 
          alt="Más Salud Logo" 
          className="w-12 h-12"
          />
        </div>
        <p className="text-xl text-muted-foreground"> Sistema integral para la gestión de pacientes y citas médicas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon
          return (
            <Card key={module.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-8 w-8 ${module.color}`} />
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={module.href}>
                  <Button className="w-full">Acceder</Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Estadísticas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pacientes Registrados</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profesionales Activos</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Citas Programadas</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">Juan Pérez</p>
                <p className="text-muted-foreground">25 Ene - 10:00</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">María López</p>
                <p className="text-muted-foreground">26 Ene - 11:30</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Carmen Ruiz</p>
                <p className="text-muted-foreground">27 Ene - 15:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Acceso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/citas">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Nueva Cita
                </Button>
              </Link>
              <Link href="/pacientes">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Nuevo Paciente
                </Button>
              </Link>
              <Link href="/historial">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Nueva Historia
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
