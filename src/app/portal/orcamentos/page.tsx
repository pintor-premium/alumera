'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileText, ArrowRight, TrendingUp } from 'lucide-react'

interface Orcamento {
  id: string
  numero: string
  validade: string
  total: number
  status: string
  criado_em: string
  projetos: {
    id: string
    nome: string
  }
}

export default function PortalOrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadOrcamentos() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fetch quotes for projects owned by the user
          const { data, error } = await supabase
            .from('orcamentos')
            .select('*, projetos!inner(id, nome, usuario_id)')
            .eq('projetos.usuario_id', user.id)
            .order('criado_em', { ascending: false })

          if (!error && data) {
            setOrcamentos(data as any)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadOrcamentos()
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
        <h1 className="font-serif text-2xl font-medium tracking-wide">Meus Orçamentos</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">
          Visualize e aprove as propostas financeiras de execução dos seus projetos em ACM.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {orcamentos.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] space-y-4">
            <FileText className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
            <p className="text-sm font-light">Nenhum orçamento recebido até o momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Número</th>
                  <th className="p-4">Projeto Relacionado</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0]">
                {orcamentos.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FDFCFB]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#171513]">{o.numero}</td>
                    <td className="p-4">
                      <Link href={`/portal/projetos/${o.projetos?.id}`} className="hover:text-[#C6A537] font-semibold underline">
                        {o.projetos?.nome}
                      </Link>
                    </td>
                    <td className="p-4 font-bold text-[#171513]">
                      {Number(o.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4 text-[#6F6A64]">
                      {new Date(o.validade).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        o.status === 'Aprovado'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : o.status === 'Enviado'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/portal/projetos/${o.projetos?.id}?tab=orcamento`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C6A537] hover:underline uppercase tracking-wider"
                      >
                        Ver Proposta <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
