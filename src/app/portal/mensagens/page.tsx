'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, ArrowRight } from 'lucide-react'

interface Projeto {
  id: string
  nome: string
  status: string
  criado_em: string
}

export default function PortalMensagensPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProjetos() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('projetos')
            .select('id, nome, status, criado_em')
            .eq('usuario_id', user.id)
            .order('criado_em', { ascending: false })

          if (!error && data) {
            setProjetos(data)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProjetos()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-64 bg-gray-200 rounded-sm w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-[#171513]">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Minhas Mensagens</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light font-sans">
          Central de comunicação. Selecione um projeto abaixo para acessar o chat técnico com a Alumera.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden divide-y divide-[#E8E5E0]">
        {projetos.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] space-y-4">
            <MessageSquare className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
            <p className="text-sm font-light">Nenhum projeto encontrado para iniciar mensagens.</p>
          </div>
        ) : (
          projetos.map((p) => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-[#FDFCFB]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#C6A537]/10 text-[#C6A537] rounded-sm flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#171513]">{p.nome}</h3>
                  <p className="text-[10px] text-[#6F6A64] font-light mt-0.5">
                    Criado em: {new Date(p.criado_em).toLocaleDateString('pt-BR')} | Status: {p.status}
                  </p>
                </div>
              </div>
              
              <Link
                href={`/portal/projetos/${p.id}?tab=mensagens`}
                className="inline-flex items-center gap-1.5 border border-[#E8E5E0] hover:border-[#C6A537] hover:text-[#C6A537] px-4 py-2 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-colors"
              >
                Abrir Chat <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
