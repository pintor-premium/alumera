'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, FolderKanban, SlidersHorizontal } from 'lucide-react'

interface Projeto {
  id: string
  nome: string
  tipo_imovel: string
  cidade: string
  estado: string
  status: string
  criado_em: string
}

export default function MeusProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const supabase = createClient()

  useEffect(() => {
    async function loadProjetos() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('projetos')
            .select('*')
            .eq('usuario_id', user.id)
            .order('criado_em', { ascending: false })

          if (!error && data) {
            setProjetos(data)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar projetos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjetos()
  }, [supabase])

  const statusColors: { [key: string]: string } = {
    'Enviado': 'bg-blue-100 text-blue-800 border-blue-200',
    'Em análise': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Necessita informações': 'bg-orange-100 text-orange-800 border-orange-200',
    'Orçamento em elaboração': 'bg-purple-100 text-purple-800 border-purple-200',
    'Orçamento enviado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Aguardando aprovação': 'bg-pink-100 text-pink-800 border-pink-200',
    'Aprovado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Contrato': 'bg-teal-100 text-teal-800 border-teal-200',
    'Em produção': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Em execução': 'bg-amber-100 text-amber-800 border-amber-200',
    'Concluído': 'bg-green-100 text-green-800 border-green-200',
    'Arquivado': 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const statuses = ['Todos', ...Array.from(new Set(projetos.map((p) => p.status)))]

  const filteredProjetos = projetos.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.tipo_imovel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === 'Todos' || p.status === statusFilter
    return matchesSearch && matchesFilter
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-wide">Meus Projetos</h1>
          <p className="text-xs text-[#6F6A64] mt-1 font-light">Gerencie e acompanhe a evolução de todos os seus projetos.</p>
        </div>
        <Link
          href="/portal/projetos/novo"
          className="inline-flex items-center gap-2 bg-[#C6A537] hover:bg-[#DFBF52] text-white px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Projeto
        </Link>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 border border-[#E8E5E0] rounded-sm shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-premium pl-10 pr-4 py-2.5 text-xs rounded-sm"
          />
          <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-[#6F6A64]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 input-premium px-3 py-2.5 text-xs rounded-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Projetos */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {filteredProjetos.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] space-y-4">
            <FolderKanban className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
            <p className="text-sm font-light">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Nome do Projeto</th>
                  <th className="p-4">Tipo Imóvel</th>
                  <th className="p-4">Cidade / Estado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data Envio</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0]">
                {filteredProjetos.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFCFB]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#171513]">{p.nome}</td>
                    <td className="p-4 text-[#6F6A64]">{p.tipo_imovel}</td>
                    <td className="p-4 text-[#6F6A64]">
                      {p.cidade} - {p.estado}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        statusColors[p.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/portal/projetos/${p.id}`}
                        className="inline-block border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-4 py-2 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-all"
                      >
                        Gerenciar
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
