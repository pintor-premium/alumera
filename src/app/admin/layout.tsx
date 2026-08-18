'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  KanbanSquare,
  FileText,
  FileSignature,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Lock
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState('Administrador')
  const [userRole, setUserRole] = useState('')
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAuthorized(false)
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('usuarios')
        .select('nome_completo, perfil')
        .eq('id', user.id)
        .single()

      const isDefaultAdmin = user.email === 'alumera@gmail.com'
      const activeRole = isDefaultAdmin ? 'administrador' : (profile?.perfil || '')

      if (isDefaultAdmin || (profile && ['administrador', 'operacional', 'financeiro'].includes(profile.perfil))) {
        setAuthorized(true)
        setUserName(isDefaultAdmin ? 'Administrador Alumera' : (profile?.nome_completo || 'Administrador'))
        setUserRole(activeRole)
      } else {
        setAuthorized(false)
        router.push('/portal')
      }
    }
    checkAuth()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Sessão administrativa encerrada.')
    router.push('/login')
    router.refresh()
  }

  const menuSections = [
    {
      title: 'Visão Geral',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Relacionamento',
      items: [
        { label: 'Clientes', href: '/admin/clientes', icon: Users },
      ]
    },
    {
      title: 'Projetos',
      items: [
        { label: 'Todos os Projetos', href: '/admin/projetos', icon: FolderKanban },
        { label: 'Pipeline Kanban', href: '/admin/projetos/kanban', icon: KanbanSquare },
      ]
    },
    {
      title: 'Comercial',
      items: [
        { label: 'Orçamentos', href: '/admin/orcamentos', icon: FileText },
        { label: 'Contratos', href: '/admin/contratos', icon: FileSignature },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { label: 'Fluxo de Caixa', href: '/admin/financeiro', icon: DollarSign },
        { label: 'Relatórios', href: '/admin/relatorios', icon: TrendingUp },
      ]
    },
    {
      title: 'Portfólio',
      items: [
        { label: 'Projetos Realizados', href: '/admin/portfolio', icon: ImageIcon },
      ]
    }
  ]

  const activePageLabel = menuSections
    .flatMap(s => s.items)
    .find(item => {
      if (item.href === '/admin') return pathname === '/admin'
      return pathname.startsWith(item.href)
    })?.label || 'CRM Admin'

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171513]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#171513] text-white flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="w-16 h-16 bg-red-950/40 border border-red-800 rounded-full flex items-center justify-center text-red-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="font-serif text-2xl text-white font-medium">Acesso Não Autorizado</h1>
          <p className="text-xs text-[#6F6A64] font-light leading-relaxed">
            Você não possui permissões administrativas para acessar este módulo. Se você for arquiteto ou engenheiro parceiro, acesse seu portal.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/portal"
            className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-6 py-3 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Acessar Meu Portal
          </Link>
          <button
            onClick={handleLogout}
            className="border border-[#2C241D] hover:bg-white/5 px-6 py-3 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#171513] text-[#E8E5E0] border-r border-[#2C241D] flex-shrink-0 overflow-y-auto">
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#2C241D] flex-shrink-0">
          <div className="relative w-8 h-8">
            <Image
              src="/imagens/ÍCONE SEM FUNDO PARA BG ESCURO.png"
              alt="Alumera"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span className="font-serif tracking-widest text-[#C6A537] font-semibold text-lg">ALUMERA</span>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-[#2C241D]/45 bg-[#2C241D]/20 flex-shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#C6A537]">CRM Administrativo</p>
          <h4 className="text-sm font-semibold text-white mt-1 truncate">{userName}</h4>
          <span className="text-[9px] bg-[#C6A537]/20 border border-[#C6A537]/40 text-[#C6A537] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold mt-2 inline-block">
            {userRole}
          </span>
        </div>

        {/* Nav Links divided by sections */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h5 className="px-4 text-[9px] uppercase font-extrabold tracking-widest text-[#6F6A64]">
                {section.title}
              </h5>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                        isActive
                          ? 'bg-[#C6A537] text-white'
                          : 'text-[#6F6A64] hover:bg-[#2C241D] hover:text-[#E8E5E0]'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-[#2C241D] flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair do CRM
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* HEADER TOP */}
        <header className="h-20 bg-white border-b border-[#E8E5E0] flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[#171513] hover:text-[#C6A537] focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-serif text-lg sm:text-xl text-[#171513] font-medium tracking-wide">
              {activePageLabel}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-[#E8E5E0]" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C6A537] text-white flex items-center justify-center font-serif text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#171513] hidden sm:block truncate max-w-[120px]">{userName}</span>
            </div>
          </div>
        </header>

        {/* CONTENT PAGES */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#171513] text-[#E8E5E0] h-full shadow-2xl z-10 animate-slide-in-right overflow-y-auto">
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#6F6A64] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Brand */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-[#2C241D] flex-shrink-0">
              <div className="relative w-8 h-8">
                <Image
                  src="/imagens/ÍCONE SEM FUNDO PARA BG ESCURO.png"
                  alt="Alumera"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="font-serif tracking-widest text-[#C6A537] font-semibold text-lg">ALUMERA</span>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-[#2C241D]/45 bg-[#2C241D]/20 flex-shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#C6A537]">CRM Administrativo</p>
              <h4 className="text-sm font-semibold text-white mt-1 truncate">{userName}</h4>
            </div>

            {/* Nav Links divided by sections */}
            <nav className="flex-1 px-4 py-6 space-y-6">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h5 className="px-4 text-[9px] uppercase font-extrabold tracking-widest text-[#6F6A64]">
                    {section.title}
                  </h5>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                            isActive
                              ? 'bg-[#C6A537] text-white'
                              : 'text-[#6F6A64] hover:bg-[#2C241D] hover:text-[#E8E5E0]'
                          }`}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-[#2C241D] flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair do CRM
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
