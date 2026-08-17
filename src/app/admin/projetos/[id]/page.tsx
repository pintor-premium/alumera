'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import {
  FileText,
  MessageSquare,
  FileSignature,
  Clock,
  Compass,
  ArrowLeft,
  Upload,
  Send,
  Download,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  DollarSign,
  TrendingDown
} from 'lucide-react'

interface Projeto {
  id: string
  nome: string
  tipo_imovel: string
  endereco_obra: string
  cidade: string
  estado: string
  descricao: string
  observacoes_tecnicas: string
  prazo_desejado: string
  status: string
  criado_em: string
  usuarios: {
    nome_completo: string
    email: string
  }
}

interface Servico {
  id: string
  nome: string
}

interface Arquivo {
  id: string
  nome_original: string
  caminho_storage: string
  extensao: string
  tamanho_bytes: number
  criado_em: string
}

interface Mensagem {
  id: string
  usuario_id: string
  mensagem: string
  criado_em: string
  usuarios: {
    nome_completo: string
    perfil: string
  }
}

interface ItemOrcamento {
  id?: string
  descricao: string
  quantidade: number
  unidade: string
  valor_unitario: number
  total: number
}

interface Orcamento {
  id?: string
  numero: string
  validade: string
  subtotal: number
  desconto: number
  total: number
  status: string
  observacoes: string
}

interface Contrato {
  id?: string
  numero: string
  caminho_storage: string
  nome_original: string
  status: string
  observacoes: string
  criado_em?: string
}

interface Atividade {
  id: string
  tipo: string
  descricao: string
  criado_em: string
}

export default function AdminProjetoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  
  // Budget States
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [budgetItems, setBudgetItems] = useState<ItemOrcamento[]>([])
  const [budgetValidade, setBudgetValidade] = useState('')
  const [budgetDesconto, setBudgetDesconto] = useState(0)
  const [budgetObs, setBudgetObs] = useState('')

  // Contract States
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [contractNumber, setContractNumber] = useState('')
  const [contractObs, setContractObs] = useState('')
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [uploadingContract, setUploadingContract] = useState(false)

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumo')
  
  // Status Update Select
  const [projStatus, setProjStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Chat Input
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  const projectStatuses = [
    'Enviado', 'Em análise', 'Necessita informações', 'Orçamento em elaboração', 
    'Orçamento enviado', 'Aguardando aprovação', 'Aprovado', 'Contrato', 
    'Em produção', 'Em execução', 'Concluído', 'Arquivado'
  ]

  // Status mapping colors
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

  // Load all data
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setCurrentUser(user)

        // 1. Fetch Project
        const { data: proj, error: projErr } = await supabase
          .from('projetos')
          .select('*, usuarios(nome_completo, email)')
          .eq('id', id)
          .single()

        if (projErr || !proj) {
          toast.error('Projeto não encontrado.')
          router.push('/admin/projetos')
          return
        }
        setProjeto(proj)
        setProjStatus(proj.status)

        // 2. Fetch linked Services
        const { data: projServs } = await supabase
          .from('projeto_servicos')
          .select('servicos(id, nome)')
          .eq('projeto_id', id)
        
        if (projServs) {
          const list = projServs.map((ps: any) => ps.servicos).filter(Boolean)
          setServicos(list)
        }

        // 3. Fetch Files
        const { data: files } = await supabase
          .from('arquivos_projeto')
          .select('*')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        if (files) setArquivos(files)

        // 4. Fetch Activities
        const { data: acts } = await supabase
          .from('atividades')
          .select('*')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        if (acts) setAtividades(acts)

        // 5. Fetch Messages
        const { data: msgs } = await supabase
          .from('mensagens')
          .select('*, usuarios(nome_completo, perfil)')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: true })
        if (msgs) setMensagens(msgs)

        // 6. Fetch Quote
        const { data: quotes } = await supabase
          .from('orcamentos')
          .select('*, itens_orcamento(*)')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        
        if (quotes && quotes.length > 0) {
          setOrcamento(quotes[0])
          setBudgetItems(quotes[0].itens_orcamento || [])
          setBudgetValidade(quotes[0].validade)
          setBudgetDesconto(Number(quotes[0].desconto))
          setBudgetObs(quotes[0].observacoes || '')
        } else {
          // Preset a blank item
          setBudgetItems([{ descricao: '', quantidade: 1, unidade: 'un', valor_unitario: 0, total: 0 }])
          setBudgetValidade(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // +15 days
        }

        // 7. Fetch Contract
        const { data: contrs } = await supabase
          .from('contratos')
          .select('*')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        if (contrs && contrs.length > 0) {
          setContrato(contrs[0])
          setContractNumber(contrs[0].numero)
          setContractObs(contrs[0].observacoes || '')
        } else {
          setContractNumber(`CON-${Math.floor(1000 + Math.random() * 9000)}`)
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, supabase, router, toast])

  // Realtime messages subscription
  useEffect(() => {
    const chatChannel = supabase
      .channel(`chat_admin_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `projeto_id=eq.${id}` },
        async (payload) => {
          const { data: userProfile } = await supabase
            .from('usuarios')
            .select('nome_completo, perfil')
            .eq('id', payload.new.usuario_id)
            .single()

          const fullMsg = {
            ...payload.new,
            usuarios: userProfile || { nome_completo: 'Parceiro', perfil: 'arquiteto' }
          } as Mensagem

          setMensagens(prev => [...prev, fullMsg])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [id, supabase])

  useEffect(() => {
    if (activeTab === 'mensagens') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTab, mensagens])

  const handleUpdateStatus = async (status: string) => {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('projetos')
        .update({ status })
        .eq('id', id)

      if (error) {
        toast.error('Erro ao atualizar status.')
      } else {
        setProjStatus(status)
        setProjeto(prev => prev ? { ...prev, status } : null)
        
        // Log Activity
        await supabase.from('atividades').insert({
          projeto_id: id,
          usuario_id: currentUser?.id,
          tipo: 'Status Alterado',
          descricao: `Status do projeto alterado administrativamente para: ${status}`
        })
        
        // Refresh Activities list
        const { data } = await supabase
          .from('atividades')
          .select('*')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        if (data) setAtividades(data)

        toast.success(`Status atualizado para: ${status}`)
      }
    } catch (err) {
      toast.error('Erro ao atualizar status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return
    setSendingMsg(true)

    try {
      const { error } = await supabase.from('mensagens').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        mensagem: newMessage
      })

      if (error) {
        toast.error('Erro ao enviar mensagem.')
      } else {
        setNewMessage('')
      }
    } catch (err) {
      toast.error('Erro de rede.')
    } finally {
      setSendingMsg(false)
    }
  }

  const handleDownloadFile = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('arquivos-projetos')
      .createSignedUrl(path, 3600)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      toast.error('Erro ao baixar arquivo.')
    }
  }

  const handleDownloadContract = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('contratos')
      .createSignedUrl(path, 3600)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      toast.error('Erro ao baixar contrato.')
    }
  }

  // Budget Builder Calculations
  const calculateBudgetTotals = () => {
    const subtotal = budgetItems.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0)
    const total = subtotal - budgetDesconto
    return { subtotal, total }
  }

  const handleBudgetFieldChange = (index: number, field: keyof ItemOrcamento, value: any) => {
    setBudgetItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }
        updated.total = updated.quantidade * updated.valor_unitario
        return updated
      })
    )
  }

  const handleAddBudgetItem = () => {
    setBudgetItems(prev => [...prev, { descricao: '', quantidade: 1, unidade: 'un', valor_unitario: 0, total: 0 }])
  }

  const handleRemoveBudgetItem = (index: number) => {
    setBudgetItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveBudget = async () => {
    if (budgetItems.length === 0 || !budgetValidade || !currentUser) {
      toast.error('Insira pelo menos um item e defina a validade.')
      return
    }

    const { subtotal, total } = calculateBudgetTotals()
    const orcNumber = orcamento?.numero || `ORC-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      let orcId = orcamento?.id

      if (orcId) {
        // Update existing budget
        const { error } = await supabase
          .from('orcamentos')
          .update({
            validade: budgetValidade,
            subtotal,
            desconto: budgetDesconto,
            total,
            status: 'Enviado',
            observacoes: budgetObs
          })
          .eq('id', orcId)

        if (error) throw error

        // Delete existing items and insert new ones
        await supabase.from('itens_orcamento').delete().eq('orcamento_id', orcId)
      } else {
        // Insert new budget
        const { data, error } = await supabase
          .from('orcamentos')
          .insert({
            projeto_id: id,
            numero: orcNumber,
            validade: budgetValidade,
            subtotal,
            desconto: budgetDesconto,
            total,
            status: 'Enviado',
            observacoes: budgetObs,
            criado_por: currentUser.id
          })
          .select()
          .single()

        if (error) throw error
        orcId = data.id
      }

      // Insert all budget items
      const itemsToInsert = budgetItems.map(item => ({
        orcamento_id: orcId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        unidade: item.unidade,
        valor_unitario: item.valor_unitario,
        total: item.quantidade * item.valor_unitario
      }))

      const { error: itemsErr } = await supabase.from('itens_orcamento').insert(itemsToInsert)
      if (itemsErr) throw itemsErr

      // Update project status
      await supabase
        .from('projetos')
        .update({ status: 'Orçamento enviado' })
        .eq('id', id)

      // Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Orçamento Enviado',
        descricao: `Orçamento Nº ${orcNumber} gerado e enviado ao parceiro.`
      })

      // Reload Quote state
      const { data: updatedOrc } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(*)')
        .eq('id', orcId)
        .single()

      if (updatedOrc) {
        setOrcamento(updatedOrc)
        setBudgetItems(updatedOrc.itens_orcamento || [])
      }

      setProjStatus('Orçamento enviado')
      if (projeto) setProjeto({ ...projeto, status: 'Orçamento enviado' })

      toast.success('Orçamento salvo e enviado ao parceiro!')
    } catch (err) {
      toast.error('Erro ao salvar orçamento.')
      console.error(err)
    }
  }

  // Contract Upload Handler
  const handleUploadContract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractFile || !contractNumber || !currentUser) {
      toast.error('Selecione o arquivo PDF do contrato.')
      return
    }

    setUploadingContract(true)
    try {
      const fileExt = contractFile.name.split('.').pop()
      const storageName = `${id}/${contractNumber}_${contractFile.name}`
      const storagePath = `contratos/${storageName}`

      // Upload Contract PDF to private bucket
      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(storagePath, contractFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      let contractId = contrato?.id
      if (contractId) {
        // Update existing contract
        const { error } = await supabase
          .from('contratos')
          .update({
            caminho_storage: storagePath,
            nome_original: contractFile.name,
            status: 'Enviado',
            observacoes: contractObs
          })
          .eq('id', contractId)
        if (error) throw error
      } else {
        // Insert new contract
        const { data, error } = await supabase
          .from('contratos')
          .insert({
            projeto_id: id,
            numero: contractNumber,
            caminho_storage: storagePath,
            nome_original: contractFile.name,
            status: 'Enviado',
            observacoes: contractObs,
            criado_por: currentUser.id
          })
          .select()
          .single()

        if (error) throw error
        contractId = data.id
      }

      // Update project status to "Contrato"
      await supabase
        .from('projetos')
        .update({ status: 'Contrato' })
        .eq('id', id)

      // Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Contrato Anexado',
        descricao: `Contrato Nº ${contractNumber} de prestação de serviços anexado ao projeto.`
      })

      // Reload Contract details
      const { data: updatedCont } = await supabase
        .from('contratos')
        .select('*')
        .eq('id', contractId)
        .single()

      if (updatedCont) setContrato(updatedCont)
      setProjStatus('Contrato')
      if (projeto) setProjeto({ ...projeto, status: 'Contrato' })

      toast.success('Contrato carregado e enviado com sucesso!')
      setContractFile(null)
    } catch (err) {
      toast.error('Erro ao enviar contrato.')
      console.error(err)
    } finally {
      setUploadingContract(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  if (!projeto) return null

  const tabs = [
    { id: 'resumo', label: 'Resumo & Status', icon: Compass },
    { id: 'arquivos', label: 'Arquivos Técnicos', icon: Upload },
    { id: 'mensagens', label: 'Chat do Parceiro', icon: MessageSquare },
    { id: 'orcamento', label: 'Construtor de Orçamento', icon: FileText },
    { id: 'contrato', label: 'Gestão de Contrato', icon: FileSignature },
    { id: 'timeline', label: 'Timeline & Histórico', icon: Clock },
  ]

  const { subtotal, total } = calculateBudgetTotals()

  return (
    <div className="space-y-6 text-[#171513]">
      {/* Header and Status control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E8E5E0] pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/projetos"
            className="inline-flex items-center gap-1.5 text-xs text-[#6F6A64] hover:text-[#C6A537]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Projetos
          </Link>
          <h1 className="font-serif text-2xl font-medium tracking-wide">{projeto.nome}</h1>
          <p className="text-xs text-[#6F6A64] font-light">
            Enviado por: <strong>{projeto.usuarios?.nome_completo}</strong> ({projeto.usuarios?.email})
          </p>
        </div>

        {/* Change status control */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 border border-[#E8E5E0] rounded-sm shadow-sm text-xs">
          <span className="font-semibold text-[#6F6A64] uppercase tracking-wider">Ajustar Status:</span>
          <select
            value={projStatus}
            disabled={updatingStatus}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="input-premium px-3 py-2.5 rounded-sm"
          >
            {projectStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className={`px-3 py-2 rounded-sm border font-semibold ${statusColors[projeto.status] || 'bg-gray-100'}`}>
            {projeto.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E8E5E0] flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'border-[#C6A537] text-[#C6A537] bg-white'
                : 'border-transparent text-[#6F6A64] hover:text-[#171513] hover:border-[#E8E5E0]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel contents */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm p-6 sm:p-8">
        
        {/* RESUMO */}
        {activeTab === 'resumo' && (
          <div className="space-y-8 animate-fade-in text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
                  Ficha do Projeto
                </h3>
                <div className="space-y-3 font-light">
                  <p><strong>Nome:</strong> {projeto.nome}</p>
                  <p><strong>Tipo:</strong> {projeto.tipo_imovel}</p>
                  <p><strong>Endereço da Obra:</strong> {projeto.endereco_obra}</p>
                  <p><strong>Cidade:</strong> {projeto.cidade} - {projeto.estado}</p>
                  <p><strong>Prazo Solicitado:</strong> {projeto.prazo_desejado}</p>
                  <p><strong>Enviado em:</strong> {new Date(projeto.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
                  Serviços Solicitados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {servicos.map((s) => (
                    <span key={s.id} className="bg-[#171513] text-white border border-[#C6A537]/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-sm">
                      {s.nome}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#E8E5E0] pt-6 font-light">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537]">Descrição Escopo</h3>
              <p className="leading-relaxed text-[#6F6A64]">{projeto.descricao}</p>
              {projeto.observacoes_tecnicas && (
                <div className="bg-[#FDFCFB] p-4 border border-[#E8E5E0] rounded-sm mt-4">
                  <h4 className="font-semibold text-xs text-[#171513] uppercase tracking-wider mb-2">Observações Técnicas</h4>
                  <p className="text-xs text-[#6F6A64] leading-relaxed">{projeto.observacoes_tecnicas}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ARQUIVOS */}
        {activeTab === 'arquivos' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Arquivos Técnicos e 3D Privados
            </h3>

            {arquivos.length === 0 ? (
              <p className="text-center py-12 text-[#6F6A64] font-light">Nenhum arquivo enviado para este projeto.</p>
            ) : (
              <div className="divide-y divide-[#E8E5E0] border border-[#E8E5E0] rounded-sm">
                {arquivos.map((arq) => {
                  const sizeMb = (arq.tamanho_bytes / (1024 * 1024)).toFixed(2)
                  return (
                    <div key={arq.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#C6A537]" />
                        <div>
                          <p className="font-semibold text-[#171513]">{arq.nome_original}</p>
                          <p className="text-[10px] text-[#6F6A64] font-light">
                            .{arq.extensao.toUpperCase()} | {sizeMb} MB | Enviado em {new Date(arq.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadFile(arq.caminho_storage)}
                        className="border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-3.5 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Baixar
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES / CHAT */}
        {activeTab === 'mensagens' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Conversa com o Parceiro
            </h3>

            {/* Chatbox */}
            <div className="h-96 border border-[#E8E5E0] bg-[#FDFCFB]/50 rounded-sm p-4 overflow-y-auto space-y-4 flex flex-col">
              {mensagens.length === 0 ? (
                <p className="text-center text-xs text-[#6F6A64] my-auto font-light">Nenhuma mensagem trocada.</p>
              ) : (
                mensagens.map((msg) => {
                  const isAdmin = msg.usuarios?.perfil === 'administrador' || msg.usuarios?.perfil === 'operacional' || msg.usuarios?.perfil === 'financeiro'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] p-3.5 rounded-lg shadow-sm border text-xs leading-relaxed ${
                        isAdmin
                          ? 'self-end bg-[#171513] border-[#2C241D] text-white'
                          : 'self-start bg-[#2C241D] border-[#C6A537]/20 text-[#E8E5E0]'
                      }`}
                    >
                      <div className="flex justify-between items-baseline gap-4 mb-1 font-bold">
                        <span className={isAdmin ? 'text-[#C6A537]' : 'text-white'}>
                          {msg.usuarios?.nome_completo} ({isAdmin ? 'Você' : 'Profissional'})
                        </span>
                        <span className="text-[9px] text-[#6F6A64] font-normal">
                          {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-light whitespace-pre-wrap">{msg.mensagem}</p>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva uma resposta técnica para o parceiro..."
                className="flex-1 input-premium px-4 py-3 text-xs rounded-sm"
              />
              <button
                type="submit"
                disabled={sendingMsg}
                className="bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white px-5 py-3 rounded-sm flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* BUDGET BUILDER */}
        {activeTab === 'orcamento' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-[#E8E5E0] pb-3">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537]">
                Construtor de Proposta de Orçamento
              </h3>
              {orcamento && (
                <span className={`px-2 py-0.5 rounded-full font-semibold border ${
                  orcamento.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Status: {orcamento.status}
                </span>
              )}
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Validade do Orçamento *</label>
                  <input
                    type="date"
                    required
                    value={budgetValidade}
                    onChange={(e) => setBudgetValidade(e.target.value)}
                    className="w-full input-premium px-4 py-2.5 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Desconto Geral (R$)</label>
                  <input
                    type="number"
                    value={budgetDesconto}
                    onChange={(e) => setBudgetDesconto(Number(e.target.value))}
                    className="w-full input-premium px-4 py-2.5 rounded-sm"
                  />
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[#171513] uppercase tracking-wider">Itens do Orçamento:</h4>
                  <button
                    type="button"
                    onClick={handleAddBudgetItem}
                    className="inline-flex items-center gap-1 bg-[#171513] hover:bg-[#2C241D] text-white px-3 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="border border-[#E8E5E0] rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FDFCFB] border-b border-[#E8E5E0] text-[9px] uppercase font-bold tracking-widest text-[#6F6A64]">
                        <th className="p-3">Descrição do Item</th>
                        <th className="p-3 w-20 text-center">Qtd</th>
                        <th className="p-3 w-20 text-center">Unidade</th>
                        <th className="p-3 w-32 text-right">Valor Unitário</th>
                        <th className="p-3 w-32 text-right">Total</th>
                        <th className="p-3 w-12 text-center">Excluir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5E0]">
                      {budgetItems.map((item, index) => (
                        <tr key={index} className="hover:bg-[#FDFCFB]/40">
                          <td className="p-3">
                            <input
                              type="text"
                              required
                              value={item.descricao}
                              onChange={(e) => handleBudgetFieldChange(index, 'descricao', e.target.value)}
                              placeholder="Ex: Execução de fachada em ACM Dourado #C6A537..."
                              className="w-full input-premium px-3 py-2 rounded-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              required
                              value={item.quantidade}
                              onChange={(e) => handleBudgetFieldChange(index, 'quantidade', Number(e.target.value))}
                              className="w-full input-premium px-3 py-2 text-center rounded-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              required
                              value={item.unidade}
                              onChange={(e) => handleBudgetFieldChange(index, 'unidade', e.target.value)}
                              placeholder="m²"
                              className="w-full input-premium px-3 py-2 text-center rounded-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              required
                              value={item.valor_unitario}
                              onChange={(e) => handleBudgetFieldChange(index, 'valor_unitario', Number(e.target.value))}
                              className="w-full input-premium px-3 py-2 text-right rounded-sm"
                            />
                          </td>
                          <td className="p-3 text-right font-semibold text-[#171513]">
                            {(item.quantidade * item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBudgetItem(index)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Obs and Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Observações / Detalhes Gerais</label>
                  <textarea
                    rows={4}
                    value={budgetObs}
                    onChange={(e) => setBudgetObs(e.target.value)}
                    placeholder="Condições de pagamento, prazos de entrega ou notas técnicas de material..."
                    className="w-full input-premium p-3 text-xs rounded-sm resize-none"
                  />
                </div>

                <div className="border border-[#E8E5E0] bg-[#FDFCFB] rounded-sm p-4 h-fit space-y-2 text-xs">
                  <div className="flex justify-between text-[#6F6A64]">
                    <span>Subtotal:</span>
                    <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {budgetDesconto > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto:</span>
                      <span>-{budgetDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-[#E8E5E0] pt-2 text-[#171513] text-sm">
                    <span>Total:</span>
                    <span className="text-[#C6A537]">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E8E5E0]">
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar e Enviar Orçamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACT MANAGEMENT */}
        {activeTab === 'contrato' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Gestão de Contrato do Projeto
            </h3>

            {contrato ? (
              <div className="bg-[#FDFCFB] p-5 border border-[#E8E5E0] rounded-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#171513]">Contrato Nº {contrato.numero}</h4>
                    <p className="text-[10px] text-[#6F6A64] font-light mt-0.5">Nome do Arquivo: {contrato.nome_original}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                    contrato.status === 'Assinado' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {contrato.status}
                  </span>
                </div>
                
                {contrato.observacoes && (
                  <p className="text-[#6F6A64] font-light italic">"{contrato.observacoes}"</p>
                )}

                <div className="pt-2 border-t border-[#E8E5E0] flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">
                    Enviado em: {new Date(contrato.criado_em || Date.now()).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => handleDownloadContract(contrato.caminho_storage)}
                    className="inline-flex items-center gap-1.5 border border-[#171513] hover:border-[#C6A537] hover:text-[#C6A537] px-4 py-2 rounded-sm font-bold uppercase tracking-wider transition-colors"
                  >
                    <Download className="w-4 h-4" /> Baixar Minuta
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[#6F6A64] font-light">Nenhum contrato ativo cadastrado para este projeto.</p>
            )}

            {/* Contract upload form */}
            <form onSubmit={handleUploadContract} className="border border-[#E8E5E0] bg-[#FDFCFB] rounded-sm p-6 space-y-4">
              <h4 className="font-bold text-sm text-[#171513] uppercase tracking-wider">
                {contrato ? 'Re-enviar / Atualizar Contrato' : 'Anexar Novo Contrato Técnico'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Número do Contrato *</label>
                  <input
                    type="text"
                    required
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="w-full input-premium px-4 py-2.5 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Selecione o Contrato (PDF) *</label>
                  <input
                    type="file"
                    required={!contrato}
                    accept="application/pdf"
                    onChange={(e) => setContractFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full input-premium px-4 py-2.5 rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6F6A64] uppercase tracking-wider mb-2">Observações / Instruções de Assinatura</label>
                <textarea
                  rows={3}
                  value={contractObs}
                  onChange={(e) => setContractObs(e.target.value)}
                  placeholder="Instruções para o parceiro realizar a assinatura digital..."
                  className="w-full input-premium p-3 rounded-sm resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingContract || (!contractFile && !contrato)}
                  className="bg-[#171513] hover:bg-[#2C241D] disabled:bg-gray-400 text-white px-6 py-3 rounded-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingContract ? 'ENVIANDO...' : 'SALVAR E ENVIAR CONTRATO'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Timeline de Atividades da Obra
            </h3>

            {atividades.length === 0 ? (
              <p className="text-center py-12 text-[#6F6A64] font-light">Nenhuma atividade registrada.</p>
            ) : (
              <div className="relative border-l border-[#E8E5E0] ml-4 pl-8 space-y-8 py-4">
                {atividades.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Circle bullet */}
                    <span className="absolute -left-11 top-0 bg-[#C6A537] border-4 border-white h-6 w-6 rounded-full flex items-center justify-center text-white" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#171513] uppercase tracking-wider">{act.tipo}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(act.criado_em).toLocaleDateString('pt-BR')} — {new Date(act.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#6F6A64] font-light leading-relaxed">{act.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
