'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { Upload, X, FileText, CheckCircle, AlertCircle, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  nome: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function NovoProjetoPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  // Form Fields
  const [nome, setNome] = useState('')
  const [tipoImovel, setTipoImovel] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [prazo, setPrazo] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Files
  const [files, setFiles] = useState<UploadingFile[]>([])

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome')
        .eq('ativo', true)
        .order('ordem', { ascending: true })

      if (!error && data) {
        setServices(data)
      }
    }
    loadServices()
  }, [supabase])

  const handleServiceToggle = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServices.length === 0) {
      toast.error('Selecione pelo menos um serviço desejado.')
      return
    }
    if (files.length === 0) {
      toast.error('Envie pelo menos um arquivo de projeto (PDF, DWG, etc.) para análise.')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Usuário não autenticado.')
        return
      }

      // 1. Insert Project
      const { data: project, error: projectError } = await supabase
        .from('projetos')
        .insert({
          usuario_id: user.id,
          nome,
          tipo_imovel: tipoImovel,
          endereco_obra: endereco,
          cidade,
          estado,
          descricao,
          observacoes_tecnicas: observacoes,
          prazo_desejado: prazo,
          status: 'Enviado'
        })
        .select()
        .single()

      if (projectError || !project) {
        toast.error('Erro ao salvar os dados do projeto.')
        console.error(projectError)
        setLoading(false)
        return
      }

      const projectId = project.id

      // 2. Link services
      const projectServicesData = selectedServices.map(serviceId => ({
        projeto_id: projectId,
        servico_id: serviceId
      }))

      const { error: servicesError } = await supabase
        .from('projeto_servicos')
        .insert(projectServicesData)

      if (servicesError) {
        console.error(servicesError)
      }

      // 3. Log Activity
      await supabase.from('atividades').insert({
        projeto_id: projectId,
        usuario_id: user.id,
        tipo: 'Criado',
        descricao: 'Projeto enviado pelo profissional.'
      })

      // 4. Upload Files
      for (const fileObj of files) {
        // Update state to uploading
        setFiles(prev =>
          prev.map(f => (f.id === fileObj.id ? { ...f, status: 'uploading' } : f))
        )

        const fileExt = fileObj.file.name.split('.').pop()
        const storageName = `${projectId}/${fileObj.id}_${fileObj.file.name}`
        const storagePath = `projetos/${storageName}`

        // Upload using browser client storage APIs with progress callback
        // Note: For compatibility, we'll run standard upload, if progress fails we fall back.
        // `@supabase/storage-js` upload signature: upload(path, file, options)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('arquivos-projetos')
          .upload(storagePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error(uploadError)
          setFiles(prev =>
            prev.map(f => (f.id === fileObj.id ? { ...f, status: 'error', error: uploadError.message } : f))
          )
          toast.error(`Falha no upload do arquivo: ${fileObj.file.name}`)
        } else {
          // Upload successful, record in files table
          const { error: dbFileError } = await supabase
            .from('arquivos_projeto')
            .insert({
              projeto_id: projectId,
              usuario_id: user.id,
              nome_original: fileObj.file.name,
              nome_storage: storageName,
              caminho_storage: storagePath,
              extensao: fileExt || '',
              tipo_mime: fileObj.file.type,
              tamanho_bytes: fileObj.file.size
            })

          if (dbFileError) {
            console.error('Erro ao salvar no banco de dados o arquivo:', dbFileError)
          }

          setFiles(prev =>
            prev.map(f => (f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f))
          )
        }
      }

      // Check if all uploads completed or if there were errors
      const failedUploads = files.filter(f => f.status === 'error')
      
      // Log notification for administrators
      await supabase.from('notificacoes').insert({
        usuario_id: user.id, // Notification on themselves (can be viewed/filtered in admin)
        tipo: 'Novo Projeto',
        titulo: 'Novo projeto recebido',
        mensagem: `O projeto "${nome}" foi enviado e está aguardando análise.`
      })

      if (failedUploads.length > 0) {
        toast.info('Projeto criado, porém alguns arquivos falharam no upload. Você pode enviá-los novamente na tela de detalhes.')
      } else {
        toast.success('Projeto e arquivos enviados com sucesso!')
      }

      router.push(`/portal/projetos/${projectId}`)
    } catch (err) {
      toast.error('Erro ao enviar o projeto. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#171513]">
      {/* Back Link */}
      <Link
        href="/portal/projetos"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F6A64] hover:text-[#C6A537] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancelar e Voltar
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Enviar Novo Projeto</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">
          Preencha as especificações técnicas da obra e envie seus arquivos técnicos para elaboração de orçamento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações Gerais */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C6A537] border-b border-[#E8E5E0] pb-2">
            1. Dados da Obra
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Nome do Projeto *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Residência Alphaville - Lote 14"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Tipo de Imóvel *</label>
              <input
                type="text"
                required
                value={tipoImovel}
                onChange={(e) => setTipoImovel(e.target.value)}
                placeholder="Ex: Residencial Alto Padrão (2 Pavimentos)"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Endereço da Obra *</label>
              <input
                type="text"
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Avenida, condomínio"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Cidade *</label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="São Paulo"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Estado *</label>
              <input
                type="text"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="SP"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Serviços Solicitados */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C6A537] border-b border-[#E8E5E0] pb-2">
            2. Soluções em ACM Desejadas *
          </h3>
          <p className="text-[10px] text-[#6F6A64] font-light">Selecione uma ou mais soluções solicitadas para este projeto:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => handleServiceToggle(s.id)}
                className={`flex items-center gap-3 p-4 border rounded-sm text-left transition-all ${
                  selectedServices.includes(s.id)
                    ? 'border-[#C6A537] bg-[#C6A537]/5 text-[#C6A537]'
                    : 'border-[#E8E5E0] hover:border-[#C6A537] text-[#171513]'
                }`}
              >
                <div className={`w-4 h-4 border rounded-sm flex items-center justify-center flex-shrink-0 ${
                  selectedServices.includes(s.id) ? 'bg-[#C6A537] border-[#C6A537] text-white' : 'border-gray-300'
                }`}>
                  {selectedServices.includes(s.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-xs font-semibold">{s.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3: Especificações */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C6A537] border-b border-[#E8E5E0] pb-2">
            3. Descrição & Cronograma
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Prazo Desejado *</label>
              <input
                type="text"
                required
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                placeholder="Ex: 90 dias úteis / Novembro 2026"
                className="w-full input-premium px-4 py-2.5 text-xs rounded-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Descrição Geral do Escopo *</label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o escopo e detalhes gerais das fachadas, brises ou móveis planejados em ACM..."
              className="w-full input-premium px-4 py-2.5 text-xs rounded-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Observações Técnicas (Opcional)</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais de vãos, ancoragem metálica, fixação, brises ou tipos de chapas requeridos..."
              className="w-full input-premium px-4 py-2.5 text-xs rounded-sm resize-none"
            />
          </div>
        </div>

        {/* Bloco 4: Upload de Arquivos */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C6A537] border-b border-[#E8E5E0] pb-2">
            4. Arquivos do Projeto *
          </h3>
          <p className="text-[10px] text-[#6F6A64] font-light leading-relaxed">
            Envie as plantas baixas, fachadas executivas, cortes e modelos 3D.<br/>
            Formatos aceitos: <strong>PDF, JPG, PNG, DWG, DXF, SKP, ZIP, RAR</strong>. Limite de <strong>500MB por arquivo</strong>.
          </p>

          {/* Area Drag & Drop */}
          <div className="border-2 border-dashed border-[#E8E5E0] hover:border-[#C6A537] transition-colors rounded-sm p-8 text-center bg-[#FDFCFB] cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-[#C6A537]" />
              <p className="text-xs font-semibold text-[#171513]">Selecione múltiplos arquivos do computador</p>
              <p className="text-[10px] text-[#6F6A64] font-light">ou arraste e solte os arquivos aqui</p>
            </div>
          </div>

          {/* Lista de Uploads */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#171513] uppercase tracking-wider">Arquivos selecionados:</h4>
              <div className="divide-y divide-[#E8E5E0] border border-[#E8E5E0] rounded-sm">
                {files.map((fileObj) => {
                  const sizeMb = (fileObj.file.size / (1024 * 1024)).toFixed(2)
                  return (
                    <div key={fileObj.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="w-5 h-5 text-[#C6A537] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#171513] truncate">{fileObj.file.name}</p>
                          <p className="text-[10px] text-[#6F6A64] font-light">{sizeMb} MB</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {fileObj.status === 'uploading' && (
                          <span className="text-[#C6A537] font-semibold animate-pulse text-[10px] uppercase tracking-widest">Enviando...</span>
                        )}
                        {fileObj.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {fileObj.status === 'error' && (
                          <div className="flex items-center gap-1 text-red-500" title={fileObj.error}>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[9px] font-bold">Erro</span>
                          </div>
                        )}
                        {fileObj.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(fileObj.id)}
                            className="text-[#6F6A64] hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#171513] hover:bg-[#2C241D] disabled:bg-[#171513]/50 text-white font-semibold py-4 rounded-sm text-xs tracking-widest uppercase transition-colors"
        >
          {loading ? 'SALVANDO PROJETO E ENVIANDO ARQUIVOS...' : 'ENVIAR PROJETO PARA ANÁLISE'}
        </button>
      </form>
    </div>
  )
}
