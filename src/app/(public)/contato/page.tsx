'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function ContatoPage() {
  const toast = useToast()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Dúvidas Gerais',
    mensagem: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Sua mensagem foi enviada com sucesso! Em breve nossa equipe entrará em contato.')
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: 'Dúvidas Gerais',
        mensagem: ''
      })
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="bg-white">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="Contato Alumera"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-black/30" />
        </div>
        <div className="relative z-10 text-center">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.3em] uppercase block mb-3">FALE CONOSCO</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white sm:text-[#171513] tracking-wide">Contato</h1>
        </div>
      </section>

      {/* Grid Contato */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#171513] tracking-wide mb-4">Entre em contato direto</h2>
              <p className="text-sm text-[#6F6A64] font-light leading-relaxed">
                Nossa equipe de engenharia e atendimento comercial está pronta para atender suas solicitações. Fique à vontade para nos telefonar, enviar um e-mail ou visitar nosso escritório técnico.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#C6A537]/15 rounded-sm flex items-center justify-center text-[#C6A537] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-[#171513]">Telefone / WhatsApp</h4>
                  <p className="text-sm text-[#6F6A64] font-light">(11) 98888-7777</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#C6A537]/15 rounded-sm flex items-center justify-center text-[#C6A537] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-[#171513]">E-mail corporativo</h4>
                  <p className="text-sm text-[#6F6A64] font-light">contato@alumera.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#C6A537]/15 rounded-sm flex items-center justify-center text-[#C6A537] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-[#171513]">Escritório Técnico</h4>
                  <p className="text-sm text-[#6F6A64] font-light leading-relaxed">
                    Av. Arquitetura Premium, 1000 — Jardins, São Paulo - SP
                  </p>
                </div>
              </div>
            </div>

            {/* Fake Map */}
            <div className="relative aspect-[16/9] bg-[#E8E5E0] rounded-sm overflow-hidden border border-[#E8E5E0]">
              <Image
                src="/imagens/SALA.png"
                alt="Escritório Alumera"
                fill
                style={{ objectFit: 'cover' }}
                className="opacity-45"
              />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-[#171513] text-white p-4 rounded-sm shadow-xl text-center max-w-xs">
                  <h4 className="font-serif text-xs tracking-wider uppercase text-[#C6A537] mb-1 font-semibold">Alumera Showroom</h4>
                  <p className="text-[10px] text-[#6F6A64] font-light">Visitas agendadas exclusivamente para parceiros cadastrados.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#171513] text-white p-8 sm:p-10 rounded-sm shadow-2xl border border-[#2C241D]">
            <h3 className="font-serif text-xl tracking-wide mb-6">Envie uma mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#C6A537] uppercase mb-2">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Telefone</label>
                  <input
                    type="text"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Assunto</label>
                <select
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm"
                >
                  <option value="Dúvidas Gerais">Dúvidas Gerais</option>
                  <option value="Solicitar Visita">Solicitar Visita</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Marketing / Parcerias">Marketing / Parcerias</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Mensagem</label>
                <textarea
                  required
                  rows={4}
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  placeholder="Escreva sua mensagem..."
                  className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white font-semibold py-3.5 rounded-sm text-xs tracking-widest uppercase transition-colors"
              >
                {loading ? 'ENVIANDO...' : (
                  <>
                    ENVIAR MENSAGEM <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
