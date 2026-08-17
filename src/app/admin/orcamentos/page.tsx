'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileText, ArrowRight, Search } from 'lucide-react'

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
    usuarios: {
      nome_completo: string
    }
  }
}

export default function AdminOrcamentosPage() {
  const supabase = createClient()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadOrcamentos() {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*, projetos!inner(id, nome, usuarios!inner(nome_completo))')
          .order('criado_em', { ascending: false })

        if (!error && data) {
          setOrcamentos(data as any)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadOrcamentos()
  }, [supabase])

  const filteredOrcamentos = orcamentos.filter((o) => {
    return (
      o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.projetos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.projetos?.usuarios?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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
        <h1 className="font-serif text-2xl font-medium tracking-wide">Todos os Orçamentos</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">Controle geral de propostas comerciais emitidas.</p>
      </div>

      <div className="bg-white p-4 border border-[#E8E5E0] rounded-sm shadow-sm flex justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar por número, projeto, parceiro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-premium pl-10 pr-4 py-2.5 text-xs rounded-sm"
          />
          <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {filteredOrcamentos.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] space-y-4">
            <FileText className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
            <p className="text-sm font-light">Nenhum orçamento encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Número</th>
                  <th className="p-4">Projeto Relacionado</th>
                  <th className="p-4">Parceiro</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0]">
                {filteredOrcamentos.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FDFCFB]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#171513]">{o.numero}</td>
                    <td className="p-4">
                      <Link href={`/admin/projetos/${o.projetos?.id}`} className="hover:text-[#C6A537] font-semibold underline">
                        {o.projetos?.nome}
                      </Link>
                    </td>
                    <td className="p-4 text-[#6F6A64]">{o.projetos?.usuarios?.nome_completo}</td>
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
                        href={`/admin/projetos/${o.projetos?.id}?tab=orcamento`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C6A537] hover:underline uppercase tracking-wider"
                      >
                        Gerenciar Proposta <ArrowRight className="w-3.5 h-3.5" />
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
