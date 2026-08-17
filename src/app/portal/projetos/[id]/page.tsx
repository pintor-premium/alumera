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
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  RotateCcw,
  Check,
  ChevronRight
} from 'lucide-react'
import confetti from 'canvas-confetti'

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
  id: string
  descricao: string
  quantidade: number
  unidade: string
  valor_unitario: number
  total: number
}

interface Orcamento {
  id: string
  numero: string
  validade: string
  subtotal: number
  desconto: number
  total: number
  status: string
  observacoes: string
  itens_orcamento: ItemOrcamento[]
}

interface Contrato {
  id: string
  numero: string
  caminho_storage: string
  nome_original: string
  status: string
  observacoes: string
}

interface Atividade {
  id: string
  tipo: string
  descricao: string
  criado_em: string
}

export default function ProjetoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
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
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumo')

  // Chat Input
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  // Budget Adjustments Input
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustObs, setAdjustObs] = useState('')
  const [submittingAdjust, setSubmittingAdjust] = useState(false)

  // File Upload states
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false)

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
          .select('*')
          .eq('id', id)
          .single()

        if (projErr || !proj) {
          toast.error('Projeto não encontrado.')
          router.push('/portal/projetos')
          return
        }
        setProjeto(proj)

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
        }

        // 7. Fetch Contract
        const { data: contrs } = await supabase
          .from('contratos')
          .select('*')
          .eq('projeto_id', id)
          .order('criado_em', { ascending: false })
        if (contrs && contrs.length > 0) {
          setContrato(contrs[0])
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, supabase, router, toast])

  // Realtime subscription for Messages & status updates
  useEffect(() => {
    const chatChannel = supabase
      .channel(`chat_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `projeto_id=eq.${id}` },
        async (payload) => {
          // Fetch complete user profile for the new message author
          const { data: userProfile } = await supabase
            .from('usuarios')
            .select('nome_completo, perfil')
            .eq('id', payload.new.usuario_id)
            .single()

          const fullMsg = {
            ...payload.new,
            usuarios: userProfile || { nome_completo: 'Alumera', perfil: 'administrador' }
          } as Mensagem

          setMensagens(prev => [...prev, fullMsg])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      )
      .subscribe()

    const projectChannel = supabase
      .channel(`project_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projetos', filter: `id=eq.${id}` },
        (payload) => {
          setProjeto(prev => prev ? { ...prev, status: payload.new.status } : null)
          
          // Re-load activities on status update
          supabase
            .from('atividades')
            .select('*')
            .eq('projeto_id', id)
            .order('criado_em', { ascending: false })
            .then(({ data }) => {
              if (data) setAtividades(data)
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
      supabase.removeChannel(projectChannel)
    }
  }, [id, supabase])

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'mensagens') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTab, mensagens])

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
      toast.error('Falha na comunicação.')
    } finally {
      setSendingMsg(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentUser) return
    setUploadingFiles(true)

    try {
      for (const file of Array.from(e.target.files)) {
        const fileId = Math.random().toString(36).substring(2, 9)
        const fileExt = file.name.split('.').pop()
        const storageName = `${id}/${fileId}_${file.name}`
        const storagePath = `projetos/${storageName}`

        const { error: uploadError } = await supabase.storage
          .from('arquivos-projetos')
          .upload(storagePath, file)

        if (uploadError) {
          toast.error(`Falha no upload de ${file.name}`)
        } else {
          // Save database record
          const { data: newFile, error: dbErr } = await supabase
            .from('arquivos_projeto')
            .insert({
              projeto_id: id,
              usuario_id: currentUser.id,
              nome_original: file.name,
              nome_storage: storageName,
              caminho_storage: storagePath,
              extensao: fileExt || '',
              tipo_mime: file.type,
              tamanho_bytes: file.size
            })
            .select()
            .single()

          if (!dbErr && newFile) {
            setArquivos(prev => [newFile, ...prev])
            toast.success(`Arquivo ${file.name} enviado!`)
          }
        }
      }

      // Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Arquivo Enviado',
        descricao: 'Novos arquivos anexados ao projeto.'
      })

    } catch (err) {
      toast.error('Erro de upload.')
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleDownloadFile = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('arquivos-projetos')
        .createSignedUrl(path, 3600)

      if (error || !data?.signedUrl) {
        toast.error('Erro ao acessar o link do arquivo.')
      } else {
        window.open(data.signedUrl, '_blank')
      }
    } catch (err) {
      toast.error('Erro de conexão.')
    }
  }

  const handleDownloadContract = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('contratos')
        .createSignedUrl(path, 3600)

      if (error || !data?.signedUrl) {
        toast.error('Erro ao acessar o arquivo do contrato.')
      } else {
        window.open(data.signedUrl, '_blank')
      }
    } catch (err) {
      toast.error('Erro de conexão.')
    }
  }

  const handleApproveBudget = async () => {
    if (!orcamento || !currentUser) return
    try {
      // 1. Update budget status
      const { error: quoteErr } = await supabase
        .from('orcamentos')
        .update({ status: 'Aprovado' })
        .eq('id', orcamento.id)

      if (quoteErr) {
        toast.error('Erro ao aprovar o orçamento.')
        return
      }

      // 2. Update project status
      await supabase
        .from('projetos')
        .update({ status: 'Aprovado' })
        .eq('id', id)

      // 3. Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Orçamento Aprovado',
        descricao: 'O orçamento do projeto foi aprovado pelo profissional.'
      })

      setOrcamento(prev => prev ? { ...prev, status: 'Aprovado' } : null)
      setProjeto(prev => prev ? { ...prev, status: 'Aprovado' } : null)

      // Play Confetti effect
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })

      toast.success('Orçamento aprovado com sucesso! Iniciando fase de contrato.')
    } catch (err) {
      toast.error('Erro ao processar aprovação.')
    }
  }

  const handleRequestAdjust = async () => {
    if (!orcamento || !currentUser || !adjustObs.trim()) return
    setSubmittingAdjust(true)
    try {
      // 1. Update budget status
      await supabase
        .from('orcamentos')
        .update({ status: 'Em negociação', observacoes: adjustObs })
        .eq('id', orcamento.id)

      // 2. Update project status
      await supabase
        .from('projetos')
        .update({ status: 'Necessita informações' })
        .eq('id', id)

      // 3. Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Revisão Solicitada',
        descricao: `Solicitada revisão de orçamento: ${adjustObs}`
      })

      // 4. Send internal message to chat
      await supabase.from('mensagens').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        mensagem: `[SOLICITAÇÃO DE ALTERAÇÃO DE ORÇAMENTO]: ${adjustObs}`
      })

      setOrcamento(prev => prev ? { ...prev, status: 'Em negociação', observacoes: adjustObs } : null)
      setProjeto(prev => prev ? { ...prev, status: 'Necessita informações' } : null)
      
      setShowAdjustModal(false)
      setAdjustObs('')
      toast.success('Solicitação de alteração enviada com sucesso!')
    } catch (err) {
      toast.error('Erro de envio.')
    } finally {
      setSubmittingAdjust(false)
    }
  }

  const handleAcceptContract = async () => {
    if (!contrato || !currentUser) return
    try {
      // 1. Update Contract Status
      await supabase
        .from('contratos')
        .update({ status: 'Assinado' })
        .eq('id', contrato.id)

      // 2. Update Project Status
      await supabase
        .from('projetos')
        .update({ status: 'Contrato' })
        .eq('id', id)

      // 3. Log Activity
      await supabase.from('atividades').insert({
        projeto_id: id,
        usuario_id: currentUser.id,
        tipo: 'Contrato Assinado',
        descricao: 'O contrato de prestação de serviços foi assinado pelo profissional.'
      })

      setContrato(prev => prev ? { ...prev, status: 'Assinado' } : null)
      setProjeto(prev => prev ? { ...prev, status: 'Contrato' } : null)
      toast.success('Contrato aceito e assinado digitalmente com sucesso!')
    } catch (err) {
      toast.error('Erro ao assinar contrato.')
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
    { id: 'resumo', label: 'Resumo', icon: Compass },
    { id: 'arquivos', label: 'Arquivos', icon: Upload },
    { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
    { id: 'orcamento', label: 'Orçamento', icon: FileText },
    { id: 'contrato', label: 'Contrato', icon: FileSignature },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ]

  return (
    <div className="space-y-6 text-[#171513]">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8E5E0] pb-6">
        <div className="space-y-1">
          <Link
            href="/portal/projetos"
            className="inline-flex items-center gap-1.5 text-xs text-[#6F6A64] hover:text-[#C6A537]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Meus Projetos
          </Link>
          <h1 className="font-serif text-2xl font-medium tracking-wide">{projeto.nome}</h1>
          <p className="text-xs text-[#6F6A64] font-light">
            Obra em {projeto.cidade} - {projeto.estado} | {projeto.tipo_imovel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#6F6A64] font-semibold uppercase tracking-wider">Status:</span>
          <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${statusColors[projeto.status] || 'bg-gray-100'}`}>
            {projeto.status}
          </span>
        </div>
      </div>

      {/* Tabs list */}
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

      {/* TAB CONTENT PANELS */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm p-6 sm:p-8">
        
        {/* RESUMO */}
        {activeTab === 'resumo' && (
          <div className="space-y-8 animate-fade-in text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
                  Especificações da Obra
                </h3>
                <div className="space-y-3 font-light">
                  <p><strong>Nome do Projeto:</strong> {projeto.nome}</p>
                  <p><strong>Tipo de Imóvel:</strong> {projeto.tipo_imovel}</p>
                  <p><strong>Prazo Desejado:</strong> {projeto.prazo_desejado}</p>
                  <p><strong>Endereço da Obra:</strong> {projeto.endereco_obra}</p>
                  <p><strong>Cidade/Estado:</strong> {projeto.cidade} - {projeto.estado}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
                  Soluções em ACM
                </h3>
                {servicos.length === 0 ? (
                  <p className="text-xs text-[#6F6A64] font-light">Nenhum serviço mapeado.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {servicos.map((s) => (
                      <span key={s.id} className="bg-[#2C241D] text-[#E8E5E0] border border-[#C6A537]/20 px-3.5 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider">
                        {s.nome}
                      </span>
                    ))}
                  </div>
                )}
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#E8E5E0] pb-3">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537]">Arquivos do Projeto</h3>
              
              <label className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploadingFiles ? 'Enviando...' : 'Anexar Mais'}
                <input
                  type="file"
                  multiple
                  disabled={uploadingFiles}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {arquivos.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#6F6A64] font-light">Nenhum arquivo enviado.</p>
            ) : (
              <div className="divide-y divide-[#E8E5E0] border border-[#E8E5E0] rounded-sm">
                {arquivos.map((arq) => {
                  const sizeMb = (arq.tamanho_bytes / (1024 * 1024)).toFixed(2)
                  return (
                    <div key={arq.id} className="p-4 flex items-center justify-between gap-4 text-xs">
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
                        onClick={() => handleDownloadFile(arq.caminho_storage, arq.nome_original)}
                        className="border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] p-2 rounded-sm transition-colors"
                        title="Baixar/Visualizar Arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* MENSAGENS */}
        {activeTab === 'mensagens' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Comunicação Integrada do Projeto
            </h3>

            {/* Chatbox messages list */}
            <div className="h-96 border border-[#E8E5E0] bg-[#FDFCFB]/50 rounded-sm p-4 overflow-y-auto space-y-4 flex flex-col">
              {mensagens.length === 0 ? (
                <p className="text-center text-xs text-[#6F6A64] my-auto font-light">Envie uma mensagem para iniciar o contato sobre este projeto.</p>
              ) : (
                mensagens.map((msg) => {
                  const isAdmin = msg.usuarios?.perfil === 'administrador' || msg.usuarios?.perfil === 'operacional' || msg.usuarios?.perfil === 'financeiro'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] p-3.5 rounded-lg shadow-sm border text-xs leading-relaxed ${
                        isAdmin
                          ? 'self-start bg-[#2C241D] border-[#C6A537]/20 text-[#E8E5E0]'
                          : 'self-end bg-[#171513] border-[#2C241D] text-white'
                      }`}
                    >
                      <div className="flex justify-between items-baseline gap-4 mb-1 font-bold">
                        <span className={isAdmin ? 'text-[#C6A537]' : 'text-white'}>
                          {msg.usuarios?.nome_completo} ({isAdmin ? 'Alumera' : 'Parceiro'})
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
                placeholder="Digite sua dúvida ou observação sobre o andamento..."
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

        {/* ORÇAMENTO */}
        {activeTab === 'orcamento' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Orçamento de Execução do Projeto
            </h3>

            {!orcamento ? (
              <div className="p-12 text-center text-[#6F6A64] space-y-4">
                <AlertCircle className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
                <p className="text-xs font-light">Orçamento em fase de análise e elaboração pela equipe técnica da Alumera.</p>
              </div>
            ) : (
              <div className="space-y-8 text-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[#FDFCFB] p-5 border border-[#E8E5E0] rounded-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-[#6F6A64] font-semibold">Orçamento Nº {orcamento.numero}</p>
                    <p className="text-xs text-[#6F6A64] font-light">
                      Validade: {new Date(orcamento.validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#6F6A64] font-bold uppercase tracking-wider">Status Proposta:</span>
                    <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${
                      orcamento.status === 'Aprovado' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orcamento.status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-[#E8E5E0] rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FDFCFB] border-b border-[#E8E5E0] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                        <th className="p-4">Descrição do Item</th>
                        <th className="p-4 w-20 text-center">Qtd</th>
                        <th className="p-4 w-20 text-center">Un</th>
                        <th className="p-4 w-32 text-right">Valor Unitário</th>
                        <th className="p-4 w-32 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5E0] font-light">
                      {orcamento.itens_orcamento?.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FDFCFB]/40">
                          <td className="p-4 font-semibold text-[#171513]">{item.descricao}</td>
                          <td className="p-4 text-center">{Number(item.quantidade).toFixed(2)}</td>
                          <td className="p-4 text-center">{item.unidade}</td>
                          <td className="p-4 text-right">
                            {Number(item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="p-4 text-right">
                            {Number(item.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals panel */}
                <div className="flex justify-end">
                  <div className="w-80 border border-[#E8E5E0] rounded-sm p-4 space-y-2 bg-[#FDFCFB]">
                    <div className="flex justify-between text-xs text-[#6F6A64]">
                      <span>Subtotal:</span>
                      <span>{Number(orcamento.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {Number(orcamento.desconto) > 0 && (
                      <div className="flex justify-between text-xs text-red-600">
                        <span>Desconto:</span>
                        <span>-{Number(orcamento.desconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t border-[#E8E5E0] pt-2 text-[#171513]">
                      <span>Total Geral:</span>
                      <span className="text-[#C6A537]">
                        {Number(orcamento.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Obs */}
                {orcamento.observacoes && (
                  <div className="p-4 border border-dashed border-[#E8E5E0] text-xs font-light rounded-sm">
                    <span className="font-semibold block mb-1">Observações do Orçamento:</span>
                    <p className="text-[#6F6A64]">{orcamento.observacoes}</p>
                  </div>
                )}

                {/* Action buttons if status is 'Enviado' or 'Em negociação' */}
                {(orcamento.status === 'Enviado' || orcamento.status === 'Rascunho' || orcamento.status === 'Em negociação') && (
                  <div className="flex gap-4 border-t border-[#E8E5E0] pt-6 justify-end">
                    <button
                      onClick={() => setShowAdjustModal(true)}
                      className="border border-[#C6A537] text-[#C6A537] hover:bg-[#C6A537]/5 px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Solicitar Alteração
                    </button>
                    <button
                      onClick={handleApproveBudget}
                      className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      Aprovar Orçamento <ThumbsUp className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTRATO */}
        {activeTab === 'contrato' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Contrato de Prestação de Serviços
            </h3>

            {!contrato ? (
              <div className="p-12 text-center text-[#6F6A64] space-y-4">
                <FileSignature className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
                <p className="text-xs font-light">O contrato de prestação de serviços será anexado após a aprovação total do orçamento.</p>
              </div>
            ) : (
              <div className="space-y-6 text-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[#FDFCFB] p-5 border border-[#E8E5E0] rounded-sm">
                  <div>
                    <h4 className="font-semibold text-[#171513]">Contrato Nº {contrato.numero}</h4>
                    <p className="text-xs text-[#6F6A64] font-light mt-1">Anexo: {contrato.nome_original}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#6F6A64] font-bold uppercase tracking-wider">Status Assinatura:</span>
                    <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${
                      contrato.status === 'Assinado' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contrato.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border border-[#E8E5E0] p-6 rounded-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-xs text-[#171513]">Minuta do Contrato de Instalação Alumera</p>
                    <p className="text-xs text-[#6F6A64] font-light leading-relaxed">
                      Clique no botão para fazer download e ler a minuta do contrato contendo as cláusulas e cronogramas de entrega.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadContract(contrato.caminho_storage)}
                    className="inline-flex items-center gap-2 border border-[#171513] hover:border-[#C6A537] hover:text-[#C6A537] px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Visualizar PDF <Download className="w-4 h-4" />
                  </button>
                </div>

                {contrato.observacoes && (
                  <div className="p-4 bg-[#FDFCFB] rounded-sm border border-dashed border-[#E8E5E0] text-xs text-[#6F6A64]">
                    <strong>Observações do Contrato:</strong>
                    <p className="mt-1 font-light">{contrato.observacoes}</p>
                  </div>
                )}

                {/* Signature box if status is 'Enviado' or 'Aguardando assinatura' */}
                {(contrato.status === 'Enviado' || contrato.status === 'Aguardando assinatura' || contrato.status === 'Rascunho') && (
                  <div className="border border-[#C6A537]/20 bg-[#C6A537]/5 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537]">Assinatura Digital</h4>
                      <p className="text-xs text-[#6F6A64] font-light">
                        Ao clicar em assinar, você concorda eletronicamente com os termos estabelecidos e autoriza o início da produção técnica.
                      </p>
                    </div>
                    <button
                      onClick={handleAcceptContract}
                      className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      Assinar e Aceitar Contrato <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2">
              Timeline de Atividades da Obra
            </h3>

            {atividades.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#6F6A64] font-light">Nenhuma atividade registrada.</p>
            ) : (
              <div className="relative border-l border-[#E8E5E0] ml-4 pl-8 space-y-8 py-4">
                {atividades.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Circle bullet */}
                    <span className="absolute -left-11 top-0 bg-[#C6A537] border-4 border-white h-6 w-6 rounded-full flex items-center justify-center text-white" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-[#171513] uppercase tracking-wider">{act.tipo}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(act.criado_em).toLocaleDateString('pt-BR')} — {new Date(act.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6A64] font-light leading-relaxed">{act.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL SOLICITAÇÃO ALTERAÇÃO ORÇAMENTO */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#171513] text-white rounded-sm border border-[#2C241D] w-full max-w-md p-6 space-y-6 animate-fade-in">
            <div>
              <h3 className="font-serif text-lg text-white font-semibold tracking-wide">Solicitar Revisão de Orçamento</h3>
              <p className="text-xs text-[#6F6A64] mt-1 font-light">Descreva em detalhes quais itens precisam ser reajustados pela Alumera.</p>
            </div>
            
            <div className="space-y-4">
              <textarea
                required
                rows={5}
                value={adjustObs}
                onChange={(e) => setAdjustObs(e.target.value)}
                placeholder="Ex: Desejo remover o item dos puxadores pivotantes da porta em ACM e aumentar o tamanho do portão eletrônico para 4.5m de largura..."
                className="w-full input-premium-dark p-3.5 text-xs rounded-sm resize-none"
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false)
                    setAdjustObs('')
                  }}
                  className="flex-1 border border-[#2C241D] text-[#E8E5E0] py-3 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={submittingAdjust || !adjustObs.trim()}
                  onClick={handleRequestAdjust}
                  className="flex-1 bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {submittingAdjust ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
