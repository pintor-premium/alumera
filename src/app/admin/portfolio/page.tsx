'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { Plus, Image as ImageIcon, Search, Trash2, Edit, Save, CheckCircle, HelpCircle } from 'lucide-react'
import Image from 'next/image'

interface PortfolioProject {
  id: string
  titulo: string
  slug: string
  categoria: string
  descricao: string
  localizacao: string
  imagem_principal: string
  destaque: boolean
  ativo: boolean
}

export default function AdminPortfolioPage() {
  const supabase = createClient()
  const toast = useToast()

  const [projetos, setProjetos] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form States
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [titulo, setTitulo] = useState('')
  const [slug, setSlug] = useState('')
  const [categoria, setCategoria] = useState('Móveis Planejados')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [destaque, setDestaque] = useState(false)
  const [ativo, setAtivo] = useState(true)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImgUrl, setExistingImgUrl] = useState('')

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const { data, error } = await supabase
          .from('projetos_portfolio')
          .select('*')
          .order('criado_em', { ascending: false })

        if (!error && data) {
          setProjetos(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadPortfolio()
  }, [supabase])

  // Auto-generate slug from title
  useEffect(() => {
    if (!editId && titulo) {
      const cleanSlug = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setSlug(cleanSlug)
    }
  }, [titulo, editId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !slug || !descricao || !localizacao || (!imageFile && !existingImgUrl)) {
      toast.error('Preencha todos os campos obrigatórios e envie uma imagem.')
      return
    }

    setSubmitting(true)
    try {
      let finalImgUrl = existingImgUrl

      // 1. Upload new image if selected
      if (imageFile) {
        const fileId = Math.random().toString(36).substring(2, 9)
        const fileExt = imageFile.name.split('.').pop()
        const storagePath = `${fileId}_${slug}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(storagePath, imageFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage.from('portfolio').getPublicUrl(storagePath)
        finalImgUrl = data.publicUrl
      }

      const projectData = {
        titulo,
        slug,
        categoria,
        descricao,
        localizacao,
        imagem_principal: finalImgUrl,
        destaque,
        ativo
      }

      if (editId) {
        // Update
        const { error } = await supabase
          .from('projetos_portfolio')
          .update(projectData)
          .eq('id', editId)

        if (error) throw error

        setProjetos(prev =>
          prev.map(p => (p.id === editId ? { ...p, ...projectData } : p))
        )
        toast.success('Projeto atualizado com sucesso!')
      } else {
        // Insert
        const { data: newProj, error } = await supabase
          .from('projetos_portfolio')
          .insert(projectData)
          .select()
          .single()

        if (error) throw error

        setProjetos(prev => [newProj, ...prev])
        toast.success('Projeto adicionado ao portfólio!')
      }

      // Reset
      handleCloseForm()
    } catch (err) {
      toast.error('Erro ao salvar projeto no portfólio.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project: PortfolioProject) => {
    setEditId(project.id)
    setTitulo(project.titulo)
    setSlug(project.slug)
    setCategoria(project.categoria)
    setDescricao(project.descricao)
    setLocalizacao(project.localizacao)
    setDestaque(project.destaque)
    setAtivo(project.ativo)
    setExistingImgUrl(project.imagem_principal)
    setShowForm(true)
  }

  const handleDelete = async (pId: string) => {
    if (!confirm('Deseja realmente remover este projeto do portfólio público?')) return

    try {
      const { error } = await supabase
        .from('projetos_portfolio')
        .delete()
        .eq('id', pId)

      if (error) throw error

      setProjetos(prev => prev.filter(p => p.id !== pId))
      toast.success('Projeto removido do portfólio.')
    } catch (err) {
      toast.error('Erro ao excluir projeto.')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    setTitulo('')
    setSlug('')
    setCategoria('Móveis Planejados')
    setDescricao('')
    setLocalizacao('')
    setDestaque(false)
    setAtivo(true)
    setImageFile(null)
    setExistingImgUrl('')
  }

  const filteredProjetos = projetos.filter((p) => {
    return (
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
          <h1 className="font-serif text-2xl font-medium tracking-wide">Administração do Portfólio</h1>
          <p className="text-xs text-[#6F6A64] mt-1 font-light">
            Gerencie os projetos concluídos que são expostos no site público da Alumera.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
        >
          <Plus className="w-4 h-4" /> Adicionar Projeto
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 border border-[#E8E5E0] rounded-sm shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar projetos no portfólio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-premium pl-10 pr-4 py-2.5 text-xs rounded-sm"
          />
          <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Grid de Projetos do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjetos.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6F6A64] font-light col-span-full">
            Nenhum projeto cadastrado no portfólio.
          </div>
        ) : (
          filteredProjetos.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full bg-[#2C241D]">
                <Image
                  src={p.imagem_principal}
                  alt={p.titulo}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                {p.destaque && (
                  <span className="absolute top-3 left-3 bg-[#C6A537] text-white text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase">
                    Destaque
                  </span>
                )}
                {!p.ativo && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase">
                    Inativo
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-[#C6A537] uppercase">{p.categoria}</span>
                  <h3 className="font-serif text-sm font-semibold text-[#171513] leading-snug line-clamp-1">{p.titulo}</h3>
                  <p className="text-[10px] text-[#6F6A64] font-light">{p.localizacao}</p>
                </div>

                <div className="border-t border-[#E8E5E0] pt-4 flex justify-between gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="inline-flex items-center gap-1 border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-3 py-1.5 rounded-sm transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM ADICIONAR / EDITAR PROJETO (MODAL) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#171513] text-white rounded-sm border border-[#2C241D] w-full max-w-lg p-6 space-y-6 animate-fade-in text-xs my-8">
            <div>
              <h3 className="font-serif text-lg text-white font-semibold tracking-wide">
                {editId ? 'Editar Projeto do Portfólio' : 'Adicionar Projeto ao Portfólio'}
              </h3>
              <p className="text-[10px] text-[#6F6A64] mt-1 font-light">Preencha as informações que serão expostas ao público.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Título do Projeto *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Fachada Residência Contemporânea"
                  className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Slug (Gerado automaticamente) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm font-mono text-[10px]"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full input-premium-dark px-3 py-2.5 rounded-sm"
                  >
                    <option value="Fachadas Residenciais">Fachadas Residenciais</option>
                    <option value="Portas em ACM">Portas em ACM</option>
                    <option value="Portões Eletrônicos em ACM">Portões Eletrônicos em ACM</option>
                    <option value="Móveis Planejados em ACM">Móveis Planejados em ACM</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Localização *</label>
                  <input
                    type="text"
                    required
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Imagem de Capa *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full input-premium-dark px-4 py-2.5 rounded-sm"
                  />
                  {existingImgUrl && !imageFile && (
                    <span className="text-[10px] text-green-400 mt-1 block">Imagem atual já vinculada.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold tracking-wider text-[#C6A537] uppercase mb-2">Descrição Detalhada *</label>
                <textarea
                  required
                  rows={4}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Escreva a descrição do projeto detalhando o tipo de ACM, cores, puxadores e o diferencial estético do acabamento..."
                  className="w-full input-premium-dark p-3 rounded-sm resize-none"
                />
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#E8E5E0]">
                  <input
                    type="checkbox"
                    checked={destaque}
                    onChange={(e) => setDestaque(e.target.checked)}
                    className="rounded-sm border-gray-700 accent-[#C6A537]"
                  />
                  <span>Destacar Projeto na Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#E8E5E0]">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="rounded-sm border-gray-700 accent-[#C6A537]"
                  />
                  <span>Projeto Ativo (Visível)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
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
