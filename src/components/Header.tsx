'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const menuItems = [
    { label: 'A Alumera', href: '/a-alumera' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Portfólio', href: '/projetos' },
    { label: 'Seja Parceiro', href: '/seja-parceiro' },
    { label: 'Contato', href: '/contato' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#171513]/95 border-b border-[#2C241D]/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative w-48 h-10">
                <Image
                  src="/imagens/LOGO%20COM%20DIMENS%C3%83O%20E%20VOLUME.png"
                  alt="Alumera"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#E8E5E0] hover:text-[#C6A537] px-3 py-2 text-sm font-medium tracking-wide transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 border border-[#C6A537] text-[#C6A537] hover:bg-[#C6A537] hover:text-white px-5 py-2 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all duration-300"
              >
                <User className="w-4 h-4" />
                Meu Portal
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-6 py-2.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all duration-300"
              >
                Área do Profissional
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#E8E5E0] hover:text-[#C6A537] focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#171513] border-b border-[#2C241D] animate-fade-in">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-[#E8E5E0] hover:text-[#C6A537] block px-3 py-3 rounded-md text-base font-medium tracking-wide transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#2C241D] px-3">
              {user ? (
                <Link
                  href="/portal"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 border border-[#C6A537] text-[#C6A537] hover:bg-[#C6A537] hover:text-white py-3 rounded-sm text-sm font-semibold tracking-wider uppercase transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  Meu Portal
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block bg-[#C6A537] hover:bg-[#DFBF52] text-white py-3 rounded-sm text-sm font-semibold tracking-wider uppercase transition-all duration-300"
                >
                  Área do Profissional
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
