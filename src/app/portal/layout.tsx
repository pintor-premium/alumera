'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus,
  FileText,
  FileSignature,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState('Profissional Alumera')
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.nome_completo || 'Profissional Alumera')
        
        // Load notifications
        const { data } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('lida', false)
          .order('criado_em', { ascending: false })
          
        if (data) setNotifications(data)
      }
    }
    loadData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Sessão encerrada com sucesso.')
    router.push('/login')
    router.refresh()
  }

  const markNotificationsAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && notifications.length > 0) {
      await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', user.id)
      setNotifications([])
    }
  }

  const menuItems = [
    { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { label: 'Meus Projetos', href: '/portal/projetos', icon: FolderKanban },
    { label: 'Enviar Projeto', href: '/portal/projetos/novo', icon: FilePlus },
    { label: 'Orçamentos', href: '/portal/orcamentos', icon: FileText },
    { label: 'Contratos', href: '/portal/contratos', icon: FileSignature },
    { label: 'Mensagens', href: '/portal/mensagens', icon: MessageSquare },
    { label: 'Meu Perfil', href: '/portal/perfil', icon: User },
  ]

  const activePageLabel = menuItems.find(item => {
    if (item.href === '/portal') return pathname === '/portal'
    return pathname.startsWith(item.href)
  })?.label || 'Painel'

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#171513] text-[#E8E5E0] border-r border-[#2C241D] flex-shrink-0">
        {/* Brand */}
        <div className="h-28 flex items-center justify-center border-b border-[#2C241D]">
          <div className="relative w-[220px] h-[65px]">
            <Image
              src="/imagens/LOGO%20SEM%20FUNDO%20ALUMERA%20DOURADO%20E%20BRANCO.png"
              alt="Alumera"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-[#2C241D]/45 bg-[#2C241D]/20">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">Área do Profissional</p>
          <h4 className="text-sm font-semibold text-white mt-1 truncate">{userName}</h4>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.href === '/portal'
              ? pathname === '/portal'
              : item.href === '/portal/projetos'
              ? pathname.startsWith('/portal/projetos') && !pathname.startsWith('/portal/projetos/novo')
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
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
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-[#2C241D]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
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
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) markNotificationsAsRead()
                }}
                className="relative p-2 text-[#6F6A64] hover:text-[#C6A537] transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C6A537] rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8E5E0] shadow-xl rounded-sm py-2 z-50 animate-fade-in text-xs">
                  <div className="px-4 py-2 border-b border-[#E8E5E0] font-semibold text-[#171513] flex justify-between">
                    <span>Notificações</span>
                    {notifications.length > 0 && <span className="text-[#C6A537]">{notifications.length} novas</span>}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-[#6F6A64] font-light">Nenhuma nova notificação</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b border-[#E8E5E0] hover:bg-[#FDFCFB] last:border-0">
                          <h4 className="font-semibold text-[#171513]">{n.titulo}</h4>
                          <p className="text-[#6F6A64] mt-0.5 font-light leading-relaxed">{n.mensagem}</p>
                          <span className="text-[9px] text-gray-400 block mt-2">
                            {new Date(n.criado_em).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-[1px] bg-[#E8E5E0]" />
            
            {/* User Avatar Circle */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2C241D] text-white flex items-center justify-center font-serif text-sm font-semibold border border-[#C6A537]">
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
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#171513] text-[#E8E5E0] h-full shadow-2xl z-10 animate-slide-in-right">
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
            <div className="h-28 flex items-center justify-center border-b border-[#2C241D]">
              <div className="relative w-[220px] h-[65px]">
                <Image
                  src="/imagens/LOGO%20SEM%20FUNDO%20ALUMERA%20DOURADO%20E%20BRANCO.png"
                  alt="Alumera"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-[#2C241D]/45 bg-[#2C241D]/20">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">Área do Profissional</p>
              <h4 className="text-sm font-semibold text-white mt-1 truncate">{userName}</h4>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = item.href === '/portal'
                  ? pathname === '/portal'
                  : item.href === '/portal/projetos'
                  ? pathname.startsWith('/portal/projetos') && !pathname.startsWith('/portal/projetos/novo')
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
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
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-[#2C241D]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
