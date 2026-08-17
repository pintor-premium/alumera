'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { Plus, Search, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Calendar, Tag, FileSpreadsheet, Trash2, TrendingDown } from 'lucide-react'

interface Transacao {
  id: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  data_vencimento: string
  data_pagamento: string | null
  status: string
  observacoes: string | null
  projetos: {
    id: string
    nome: string
  } | null
  categorias_financeiras: {
    id: string
    nome: string
  }
}

interface Categoria {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
}

interface Projeto {
  id: string
  nome: string
}

export default function AdminFinanceiroPage() {
  const supabase = createClient()
  const toast = useToast()

  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [timeFilter, setTimeFilter] = useState('Mês')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  // New Transaction Form States
  const [showForm, setShowForm] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita')
  const [valor, setValor] = useState(0)
  const [projetoId, setProjetoId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [status, setStatus] = useState('A receber')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    async function loadFinanceData() {
      try {
        // Load Transactions
        const { data: txs } = await supabase
          .from('transacoes_financeiras')
          .select('*, projetos(id, nome), categorias_financeiras(id, nome)')
          .order('data_vencimento', { ascending: false })

        if (txs) setTransacoes(txs as any)

        // Load Categories
        const { data: cats } = await supabase
          .from('categorias_financeiras')
          .select('*')
          .eq('ativo', true)
        if (cats) setCategorias(cats as any)

        // Load Projects
        const { data: projs } = await supabase
          .from('projetos')
          .select('id, nome')
        if (projs) setProjetos(projs)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadFinanceData()
  }, [supabase])

  // Update default status/category when switching transaction type
  useEffect(() => {
    if (tipo === 'receita') {
      setStatus('A receber')
    } else {
      setStatus('A pagar')
    }
    // Set first matching category
    const matched = categorias.find(c => c.tipo === tipo)
    if (matched) setCategoriaId(matched.id)
  }, [tipo, categorias])

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descricao || !valor || !categoriaId || !vencimento) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    setSubmitting(true)
    try {
      const { data: newTx, error } = await supabase
        .from('transacoes_financeiras')
        .insert({
          descricao,
          tipo,
          valor,
          projeto_id: projetoId || null,
          categoria_id: categoriaId,
          data_vencimento: vencimento,
          data_pagamento: pagamento || null,
          status,
          observacoes: observacoes || null
        })
        .select('*, projetos(id, nome), categorias_financeiras(id, nome)')
        .single()

      if (error) throw error

      setTransacoes(prev => [newTx as any, ...prev])
      toast.success('Transação registrada com sucesso!')

      // Reset form
      setDescricao('')
      setValor(0)
      setProjetoId('')
      setVencimento('')
      setPagamento('')
      setObservacoes('')
      setShowForm(false)
    } catch (err) {
      toast.error('Erro ao registrar transação.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return

    try {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', txId)

      if (error) throw error

      setTransacoes(prev => prev.filter(t => t.id !== txId))
      toast.success('Transação excluída.')
    } catch (err) {
      toast.error('Erro ao excluir transação.')
    }
  }

  // Financial calculations
  const calculateTotals = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const filteredTxs = transacoes.filter((t) => {
      // Time filter logic
      if (timeFilter === 'Mês') {
        const d = new Date(t.data_vencimento)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }
      return true
    })

    const entradas = filteredTxs
      .filter(t => t.tipo === 'receita' && t.status === 'Recebido')
      .reduce((sum, t) => sum + Number(t.valor), 0)

    const saidas = filteredTxs
      .filter(t => t.tipo === 'despesa' && t.status === 'Paga')
      .reduce((sum, t) => sum + Number(t.valor), 0)

    const saldo = entradas - saidas

    const aReceber = filteredTxs
      .filter(t => t.tipo === 'receita' && (t.status === 'A receber' || t.status === 'Previsto'))
      .reduce((sum, t) => sum + Number(t.valor), 0)

    const aPagar = filteredTxs
      .filter(t => t.tipo === 'despesa' && (t.status === 'A pagar' || t.status === 'Prevista'))
      .reduce((sum, t) => sum + Number(t.valor), 0)

    return { entradas, saidas, saldo, aReceber, aPagar }
  }

  const { entradas, saidas, saldo, aReceber, aPagar } = calculateTotals()

  // Filter transactions list
  const filteredList = transacoes.filter((t) => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.categorias_financeiras.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.projetos?.nome && t.projetos.nome.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === 'Todos' || t.tipo === typeFilter

    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-[#171513]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-wide">Fluxo de Caixa</h1>
          <p className="text-xs text-[#6F6A64] mt-1 font-light">Controle financeiro gerencial e lançamentos de receitas/despesas.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
        >
          <Plus className="w-4 h-4" /> Registrar Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Entradas (Recebidas)', value: entradas, icon: ArrowUpRight, color: 'text-green-600 bg-green-50 border-green-100' },
          { label: 'Saídas (Pagas)', value: saidas, icon: ArrowDownRight, color: 'text-red-600 bg-red-50 border-red-100' },
          { label: 'Saldo de Caixa', value: saldo, icon: Wallet, color: saldo >= 0 ? 'text-[#C6A537] bg-yellow-50 border-yellow-100' : 'text-red-700 bg-red-50 border-red-200' },
          { label: 'A Receber (Previsão)', value: aReceber, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'A Pagar (Previsão)', value: aPagar, icon: TrendingDown, color: 'text-orange-600 bg-orange-50 border-orange-100' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 border border-[#E8E5E0] rounded-sm shadow-sm">
            <div className="flex justify-between items-start text-[#6F6A64]">
              <span className="text-[9px] uppercase font-bold tracking-wider leading-snug">{card.label}</span>
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center border ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-lg font-bold mt-3 truncate">
              {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 border border-[#E8E5E0] rounded-sm shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Time Filter Button */}
          {['Mês', 'Todos'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3.5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all border ${
                timeFilter === f ? 'bg-[#171513] text-white border-[#171513]' : 'bg-white text-[#171513] border-[#E8E5E0]'
              }`}
            >
              {f}
            </button>
          ))}
          
          <div className="h-6 w-[1px] bg-[#E8E5E0] hidden sm:block" />
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-premium px-3 py-1.5 text-xs rounded-sm"
          >
            <option value="Todos">Todos Lançamentos</option>
            <option value="receita">Apenas Receitas</option>
            <option value="despesa">Apenas Despesas</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Pesquisar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-premium pl-10 pr-4 py-2.5 text-xs rounded-sm"
          />
          <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] font-light">Nenhum lançamento registrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Projeto</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0] font-sans">
                {filteredList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FDFCFB]/40">
                    <td className="p-4 pl-6 font-semibold text-[#171513]">{tx.descricao}</td>
                    <td className="p-4 text-[#6F6A64] font-medium">{tx.categorias_financeiras?.nome}</td>
                    <td className="p-4">
                      {tx.projetos ? (
                        <Link href={`/admin/projetos/${tx.projetos.id}`} className="hover:text-[#C6A537] underline font-semibold">
                          {tx.projetos.nome}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(tx.data_vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-gray-500">
                      {tx.data_pagamento ? new Date(tx.data_pagamento).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className={`p-4 font-bold ${tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.tipo === 'receita' ? '+' : '-'} {Number(tx.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        tx.status === 'Recebido' || tx.status === 'Paga'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'Atrasado' || tx.status === 'Atrasada'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Excluir Lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM REGISTRAR LANÇAMENTO (MODAL) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#171513] text-white rounded-sm border border-[#2C241D] w-full max-w-lg p-6 space-y-6 animate-fade-in text-xs">
            <div>
              <h3 className="font-serif text-lg text-white font-semibold tracking-wide">Novo Lançamento Financeiro</h3>
              <p className="text-[10px] text-[#6F6A64] mt-1 font-light">Registre entradas ou saídas de caixa no controle financeiro gerencial.</p>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Tipo de Lançamento *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipo('receita')}
                      className={`py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        tipo === 'receita' ? 'border-[#C6A537] bg-[#C6A537]/10 text-[#C6A537]' : 'border-[#2C241D] text-[#E8E5E0]'
                      }`}
                    >
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('despesa')}
                      className={`py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        tipo === 'despesa' ? 'border-[#C6A537] bg-[#C6A537]/10 text-[#C6A537]' : 'border-[#2C241D] text-[#E8E5E0]'
                      }`}
                    >
                      Despesa
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Parcela 01/03 - Fachada ACM Dourado"
                  className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Categoria Financeira *</label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full input-premium-dark px-3 py-2.5 rounded-sm"
                  >
                    {categorias.filter(c => c.tipo === tipo).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Projeto Relacionado</label>
                  <select
                    value={projetoId}
                    onChange={(e) => setProjetoId(e.target.value)}
                    className="w-full input-premium-dark px-3 py-2.5 rounded-sm"
                  >
                    <option value="">Nenhum</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Data Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Data Pagamento (Caso recebido/pago)</label>
                  <input
                    type="date"
                    value={pagamento}
                    onChange={(e) => setPagamento(e.target.value)}
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Status do Lançamento</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full input-premium-dark px-3 py-2.5 rounded-sm"
                >
                  {tipo === 'receita' ? (
                    <>
                      <option value="A receber">A receber</option>
                      <option value="Recebido">Recebido</option>
                      <option value="Previsto">Previsto</option>
                      <option value="Atrasado">Atrasado</option>
                      <option value="Cancelado">Cancelado</option>
                    </>
                  ) : (
                    <>
                      <option value="A pagar">A pagar</option>
                      <option value="Paga">Paga</option>
                      <option value="Prevista">Prevista</option>
                      <option value="Atrasada">Atrasada</option>
                      <option value="Cancelada">Cancelada</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Observações</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full input-premium-dark p-3 rounded-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#2C241D] text-[#E8E5E0] py-3 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {submitting ? 'SALVANDO...' : 'REGISTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
