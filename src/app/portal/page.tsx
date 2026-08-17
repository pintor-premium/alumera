'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, FileText, Compass, Send, CheckCircle2, Play, Archive, ArrowRight } from 'lucide-react'

interface Projeto {
  id: string
  nome: string
  tipo_imovel: string
  cidade: string
  estado: string
  status: string
  criado_em: string
}

export default function PortalDashboard() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Status mapping to counts
  const [stats, setStats] = useState({
    enviados: 0,
    analise: 0,
    orcamentos: 0,
    aprovados: 0,
    execucao: 0,
    concluidos: 0,
  })

  useEffect(() => {
    async function loadDashboardData() {
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
            
            // Calculate stats
            const s = {
              enviados: data.length,
              analise: data.filter(p => p.status === 'Em análise' || p.status === 'Enviado').length,
              orcamentos: data.filter(p => p.status === 'Orçamento enviado').length,
              aprovados: data.filter(p => p.status === 'Aprovado' || p.status === 'Contrato').length,
              execucao: data.filter(p => p.status === 'Em produção' || p.status === 'Em execução').length,
              concluidos: data.filter(p => p.status === 'Concluído').length,
            }
            setStats(s)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
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

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-sm w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-sm" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-sm w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 text-[#171513]">
      {/* Welcome Banner / CTA */}
      <div className="bg-[#171513] text-white p-6 sm:p-8 rounded-sm border border-[#2C241D] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="space-y-2">
          <h1 className="font-serif text-xl sm:text-2xl tracking-wide text-white">Central de Projetos</h1>
          <p className="text-xs text-[#6F6A64] font-light max-w-xl leading-relaxed">
            Aqui você gerencia o progresso das suas obras em ACM, consulta orçamentos e aprova contratos. 
            Mantenha seus arquivos 3D e PDFs atualizados para nossa análise técnica.
          </p>
        </div>
        <Link
          href="/portal/projetos/novo"
          className="inline-flex items-center gap-2 bg-[#C6A537] hover:bg-[#DFBF52] text-white px-5 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Enviar Novo Projeto
        </Link>
      </div>

      {/* Stats Indicator Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Projetos Enviados', value: stats.enviados, icon: Send },
          { label: 'Em Análise', value: stats.analise, icon: Compass },
          { label: 'Orçamentos Recebidos', value: stats.orcamentos, icon: FileText },
          { label: 'Orçamentos Aprovados', value: stats.aprovados, icon: CheckCircle2 },
          { label: 'Em Execução', value: stats.execucao, icon: Play },
          { label: 'Concluídos', value: stats.concluidos, icon: Archive },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 border border-[#E8E5E0] rounded-sm hover:border-[#C6A537] transition-all shadow-sm"
          >
            <div className="flex justify-between items-start text-[#6F6A64]">
              <span className="text-[10px] uppercase font-bold tracking-wider leading-snug">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-[#C6A537]" />
            </div>
            <p className="font-serif text-2xl font-semibold mt-3 text-[#171513]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm">
        <div className="p-6 border-b border-[#E8E5E0] flex justify-between items-center">
          <h3 className="font-serif text-base font-semibold text-[#171513] tracking-wide">Meus Projetos Recentes</h3>
          {projetos.length > 0 && (
            <Link
              href="/portal/projetos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C6A537] hover:underline"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {projetos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#6F6A64] font-light mb-6">Você ainda não enviou nenhum projeto para análise.</p>
            <Link
              href="/portal/projetos/novo"
              className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              Enviar Primeiro Projeto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Projeto</th>
                  <th className="p-4">Tipo Imóvel</th>
                  <th className="p-4">Localização</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Criado em</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0]">
                {projetos.slice(0, 5).map((p) => (
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
                        className="inline-block border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-3.5 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-all"
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
