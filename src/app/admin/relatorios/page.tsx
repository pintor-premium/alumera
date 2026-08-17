'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Compass, Calendar, AlertCircle } from 'lucide-react'

interface ReportData {
  totalProjetos: number
  conversionRate: number
  ticketMedio: number
  projetosPorStatus: { status: string; count: number }[]
  receitasTotais: number
  despesasTotais: number
  resultadoOperacional: number
}

export default function AdminRelatoriosPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportData>({
    totalProjetos: 0,
    conversionRate: 0,
    ticketMedio: 0,
    projetosPorStatus: [],
    receitasTotais: 0,
    despesasTotais: 0,
    resultadoOperacional: 0
  })

  useEffect(() => {
    async function loadReports() {
      try {
        // Fetch projects
        const { data: projects } = await supabase
          .from('projetos')
          .select('id, status')

        // Fetch approved budgets
        const { data: budgets } = await supabase
          .from('orcamentos')
          .select('id, total, status')

        // Fetch transactions
        const { data: txs } = await supabase
          .from('transacoes_financeiras')
          .select('valor, tipo, status')

        if (projects && budgets && txs) {
          const totalProj = projects.length

          // Conversion rate: Approved quotes / Total quotes
          const totalQuotes = budgets.length
          const approvedQuotes = budgets.filter(b => b.status === 'Aprovado').length
          const convRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0

          // Ticket médio of approved budgets
          const approvedTotals = budgets.filter(b => b.status === 'Aprovado')
          const avgTicket = approvedTotals.length > 0
            ? approvedTotals.reduce((sum, b) => sum + Number(b.total), 0) / approvedTotals.length
            : 0

          // Count projects by status
          const statusMap: { [key: string]: number } = {}
          projects.forEach(p => {
            statusMap[p.status] = (statusMap[p.status] || 0) + 1
          })
          const projectsByStatus = Object.entries(statusMap).map(([status, count]) => ({
            status,
            count
          }))

          // Financial aggregates
          const revenues = txs
            .filter(t => t.tipo === 'receita' && t.status === 'Recebido')
            .reduce((sum, t) => sum + Number(t.valor), 0)

          const expenses = txs
            .filter(t => t.tipo === 'despesa' && t.status === 'Paga')
            .reduce((sum, t) => sum + Number(t.valor), 0)

          const resultado = revenues - expenses

          setReport({
            totalProjetos: totalProj,
            conversionRate: convRate,
            ticketMedio: avgTicket,
            projetosPorStatus: projectsByStatus,
            receitasTotais: revenues,
            despesasTotais: expenses,
            resultadoOperacional: resultado
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-[#171513]">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Relatórios Gerenciais</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">Métricas operacionais, comerciais e financeiras agregadas da Alumera.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6A64] block">Ticket Médio (Aprovados)</span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#171513]">
              {report.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-yellow-50 border border-yellow-100 flex items-center justify-center text-[#C6A537]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6A64] block">Conversão de Orçamentos</span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#171513]">
              {report.conversionRate.toFixed(1)}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6A64] block">Resultado Operacional</span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-green-600">
              {report.resultadoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects distribution */}
        <div className="bg-white border border-[#E8E5E0] rounded-sm p-6 space-y-4">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2 flex items-center gap-2">
            <Compass className="w-4 h-4" /> Distribuição de Projetos por Status
          </h3>
          {report.projetosPorStatus.length === 0 ? (
            <p className="text-xs text-[#6F6A64] font-light">Nenhum projeto cadastrado.</p>
          ) : (
            <div className="divide-y divide-[#E8E5E0] text-xs">
              {report.projetosPorStatus.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between">
                  <span className="font-semibold text-[#171513]">{item.status}</span>
                  <span className="font-bold text-[#C6A537]">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-white border border-[#E8E5E0] rounded-sm p-6 space-y-4">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Resumo Consolidado de Resultados
          </h3>
          <div className="divide-y divide-[#E8E5E0] text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="font-semibold text-[#171513]">Receitas Realizadas</span>
              <span className="text-green-600 font-bold">
                {report.receitasTotais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-semibold text-[#171513]">Despesas Pagas</span>
              <span className="text-red-600 font-bold">
                -{report.despesasTotais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center font-bold text-sm border-t border-[#E8E5E0] pt-3 text-[#171513]">
              <span>Lucro / Saldo Operacional</span>
              <span className={report.resultadoOperacional >= 0 ? 'text-[#C6A537]' : 'text-red-700'}>
                {report.resultadoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
