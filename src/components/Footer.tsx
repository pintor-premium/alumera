import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#171513] text-[#E8E5E0] border-t border-[#2C241D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/imagens/ÍCONE SEM FUNDO PARA BG ESCURO.png"
                  alt="Alumera Ícone"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="font-serif tracking-widest text-[#C6A537] text-lg font-medium">
                ALUMERA
              </span>
            </div>
            <p className="text-sm text-[#6F6A64] leading-relaxed">
              Sua residência com requinte sofisticado, elegante e moderno. Soluções personalizadas em ACM de altíssimo padrão.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6F6A64] hover:text-[#C6A537] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#C6A537] tracking-wider uppercase mb-4">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-alumera" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  A Alumera
                </Link>
              </li>
              <li>
                <Link href="/solucoes" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Soluções em ACM
                </Link>
              </li>
              <li>
                <Link href="/projetos" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Portfólio de Projetos
                </Link>
              </li>
              <li>
                <Link href="/seja-parceiro" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Seja Parceiro
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions links */}
          <div>
            <h3 className="text-sm font-semibold text-[#C6A537] tracking-wider uppercase mb-4">
              Soluções
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/solucoes#fachadas" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Fachadas Residenciais
                </Link>
              </li>
              <li>
                <Link href="/solucoes#portas" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Portas em ACM
                </Link>
              </li>
              <li>
                <Link href="/solucoes#portoes" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Portões de Elevação
                </Link>
              </li>
              <li>
                <Link href="/solucoes#moveis" className="text-[#6F6A64] hover:text-[#E8E5E0] transition-colors">
                  Móveis Planejados
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-[#C6A537] tracking-wider uppercase mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-sm text-[#6F6A64]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C6A537] flex-shrink-0" />
                <span>Av. Arquitetura Premium, 1000 — Jardins, São Paulo - SP</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C6A537] flex-shrink-0" />
                <span>(11) 98888-7777</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C6A537] flex-shrink-0" />
                <span>contato@alumera.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2C241D] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#6F6A64]">
          <p>&copy; {currentYear} ALUMERA. Todos os direitos reservados.</p>
          <p>
            Desenvolvido com sofisticação para arquitetura de alto padrão.
          </p>
        </div>
      </div>
    </footer>
  )
}
