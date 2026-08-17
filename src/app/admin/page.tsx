'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  FolderKanban,
  FileText,
  CheckCircle,
  PlayCircle,
  DollarSign,
  TrendingDown,
  ArrowRight,
  UserCheck,
  Plus
} from 'lucide-react'

interface Stats {
  novosProjetos: number
  orcamentosEnviados: number
  orcamentosAprovados: number
  projetosExecucao: number
  projetosConcluidos: number
  receitaMes: number
  aReceber: number
  aPagar: number
}

interface RecenteProjeto {
  id: string
  nome: string
  status: string
  criado_em: string
  usuarios: {
    nome_completo: string
    perfil: string
  }
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    novosProjetos: 0,
    orcamentosEnviados: 0,
    orcamentosAprovados: 0,
    projetosExecucao: 0,
    projetosConcluidos: 0,
    receitaMes: 0,
    aReceber: 0,
    aPagar: 0
  })
  const [recentes, setRecentes] = useState<RecenteProjeto[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Fetch projects
        const { data: projects } = await supabase
          .from('projetos')
          .select('*, usuarios(nome_completo, perfil)')
          .order('criado_em', { ascending: false })

        // 2. Fetch quotes
        const { data: quotes } = await supabase
          .from('orcamentos')
          .select('*')

        // 3. Fetch transactions
        const { data: txs } = await supabase
          .from('transacoes_financeiras')
          .select('*')

        if (projects && quotes && txs) {
          // Calculate counts
          const novos = projects.filter(p => p.status === 'Enviado').length
          const exec = projects.filter(p => p.status === 'Em produção' || p.status === 'Em execução').length
          const concl = projects.filter(p => p.status === 'Concluído').length

          const enviados = quotes.filter(q => q.status === 'Enviado' || q.status === 'Visualizado' || q.status === 'Em negociação').length
          const aprovados = quotes.filter(q => q.status === 'Aprovado').length

          // Financial sums
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()

          const receitaMes = txs
            .filter(t => {
              if (t.tipo !== 'receita' || t.status !== 'Recebido' || !t.data_pagamento) return false
              const payDate = new Date(t.data_pagamento)
              return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear
            })
            .reduce((sum, t) => sum + Number(t.valor), 0)

          const aReceber = txs
            .filter(t => t.tipo === 'receita' && (t.status === 'A receber' || t.status === 'Previsto' || t.status === 'Atrasado'))
            .reduce((sum, t) => sum + Number(t.valor), 0)

          const aPagar = txs
            .filter(t => t.tipo === 'despesa' && (t.status === 'A pagar' || t.status === 'Prevista' || t.status === 'Atrasada'))
            .reduce((sum, t) => sum + Number(t.valor), 0)

          setStats({
            novosProjetos: novos,
            orcamentosEnviados: enviados,
            orcamentosAprovados: aprovados,
            projetosExecucao: exec,
            projetosConcluidos: concl,
            receitaMes,
            aReceber,
            aPagar
          })

          setRecentes(projects.slice(0, 5) as any)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
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
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-sm" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-sm w-full" />
      </div>
    )
  }

  const indicatorCards = [
    { label: 'Novos Projetos', value: stats.novosProjetos, icon: FolderKanban, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { label: 'Orçamentos Enviados', value: stats.orcamentosEnviados, icon: FileText, color: 'text-purple-500 bg-purple-50 border-purple-100' },
    { label: 'Orçamentos Aprovados', value: stats.orcamentosAprovados, icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-100' },
    { label: 'Projetos em Execução', value: stats.projetosExecucao, icon: PlayCircle, color: 'text-amber-500 bg-amber-50 border-amber-100' },
    { label: 'Receita do Mês', value: stats.receitaMes, icon: DollarSign, color: 'text-[#C6A537] bg-yellow-50 border-yellow-100', isCurrency: true },
    { label: 'Contas a Receber', value: stats.aReceber, icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', isCurrency: true },
    { label: 'Contas a Pagar', value: stats.aPagar, icon: TrendingDown, color: 'text-red-500 bg-red-50 border-red-100', isCurrency: true },
    { label: 'Projetos Concluídos', value: stats.projetosConcluidos, icon: UserCheck, color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
  ]

  return (
    <div className="space-y-8 text-[#171513]">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicatorCards.map((c, i) => (
          <div
            key={i}
            className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6A64] block">
                {c.label}
              </span>
              <p className="font-serif text-xl sm:text-2xl font-semibold text-[#171513] leading-none">
                {c.isCurrency
                  ? c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                  : c.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-sm border flex items-center justify-center ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-[#E8E5E0] flex justify-between items-center bg-[#FDFCFB]">
            <h3 className="font-serif text-base font-semibold tracking-wide">Novos Projetos Recebidos</h3>
            <Link
              href="/admin/projetos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C6A537] hover:underline"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6F6A64] font-light">Nenhum projeto recebido ainda.</div>
          ) : (
            <div className="divide-y divide-[#E8E5E0] text-xs">
              {recentes.map((p) => (
                <div key={p.id} className="p-5 flex items-center justify-between hover:bg-[#FDFCFB]/50 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-[#171513]">{p.nome}</h4>
                    <p className="text-[10px] text-[#6F6A64] font-light">
                      Por: <strong>{p.usuarios?.nome_completo}</strong> | Enviado em: {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[p.status] || 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                    <Link
                      href={`/admin/projetos/${p.id}`}
                      className="border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-3.5 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-all"
                    >
                      Gerenciar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links / Actions */}
        <div className="bg-[#171513] text-white p-6 sm:p-8 rounded-sm border border-[#2C241D] flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <span className="text-[10px] text-[#C6A537] uppercase font-bold tracking-widest block">Ações Rápidas</span>
            <h3 className="font-serif text-lg tracking-wide text-white">Operações CRM Alumera</h3>
            <p className="text-xs text-[#6F6A64] font-light leading-relaxed">
              Use estes atalhos para pular diretamente para as telas mais comuns do fluxo de administração do CRM e financeiro.
            </p>
          </div>

          <div className="space-y-3 pt-8">
            <Link
              href="/admin/projetos/kanban"
              className="w-full flex items-center justify-between bg-[#2C241D]/60 hover:bg-[#2C241D] text-[#E8E5E0] px-4 py-3 rounded-sm border border-[#C6A537]/15 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <span>Visualizar Kanban</span>
              <ArrowRight className="w-4 h-4 text-[#C6A537]" />
            </Link>
            <Link
              href="/admin/clientes"
              className="w-full flex items-center justify-between bg-[#2C241D]/60 hover:bg-[#2C241D] text-[#E8E5E0] px-4 py-3 rounded-sm border border-[#C6A537]/15 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <span>Gestão de Clientes</span>
              <ArrowRight className="w-4 h-4 text-[#C6A537]" />
            </Link>
            <Link
              href="/admin/orcamentos"
              className="w-full flex items-center justify-between bg-[#2C241D]/60 hover:bg-[#2C241D] text-[#E8E5E0] px-4 py-3 rounded-sm border border-[#C6A537]/15 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <span>Listagem de Orçamentos</span>
              <ArrowRight className="w-4 h-4 text-[#C6A537]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
