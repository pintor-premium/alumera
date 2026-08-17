'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { MapPin, User, ArrowRight } from 'lucide-react'

interface Proyecto {
  id: string
  nome: string
  status: string
  tipo_imovel: string
  cidade: string
  estado: string
  usuarios: {
    nome_completo: string
  }
}

interface Column {
  id: string
  title: string
  status: string
}

const KANBAN_COLUMNS: Column[] = [
  { id: 'enviado', title: 'Novo Contato', status: 'Enviado' },
  { id: 'analise', title: 'Projeto Recebido', status: 'Em análise' },
  { id: 'elaborando', title: 'Orçamento em Prep.', status: 'Orçamento em elaboração' },
  { id: 'enviado_orc', title: 'Orçamento Enviado', status: 'Orçamento enviado' },
  { id: 'negociando', title: 'Em Negociação', status: 'Aguardando aprovação' },
  { id: 'aprovado', title: 'Aprovado', status: 'Aprovado' },
  { id: 'contrato', title: 'Contrato', status: 'Contrato' },
  { id: 'executando', title: 'Em Execução', status: 'Em execução' },
  { id: 'concluido', title: 'Concluído', status: 'Concluído' }
]

export default function AdminKanbanPage() {
  const supabase = createClient()
  const toast = useToast()
  
  const [projetos, setProjetos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjetos() {
      try {
        const { data, error } = await supabase
          .from('projetos')
          .select('id, nome, status, tipo_imovel, cidade, estado, usuarios(nome_completo)')
          .order('criado_em', { ascending: false })

        if (!error && data) {
          setProjetos(data as any)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProjetos()
  }, [supabase])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('projectId', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    const projectId = e.dataTransfer.getData('projectId')
    if (!projectId) return

    // Find project
    const project = projetos.find(p => p.id === projectId)
    if (!project || project.status === targetStatus) return

    // Optimistic Update
    const previousProjetos = [...projetos]
    setProjetos(prev =>
      prev.map(p => (p.id === projectId ? { ...p, status: targetStatus } : p))
    )

    try {
      const { error } = await supabase
        .from('projetos')
        .update({ status: targetStatus })
        .eq('id', projectId)

      if (error) {
        throw error
      }

      // Log Activity
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('atividades').insert({
        projeto_id: projectId,
        usuario_id: user?.id,
        tipo: 'Status Alterado',
        descricao: `Status do projeto alterado para: ${targetStatus} (via Kanban).`
      })

      toast.success(`Projeto "${project.nome}" movido para "${targetStatus}"`)
    } catch (err) {
      // Rollback
      setProjetos(previousProjetos)
      toast.error('Erro ao atualizar o status do projeto no servidor.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-[#171513] h-[calc(100vh-14rem)] flex flex-col">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Pipeline Kanban</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">
          Arraste e solte os cartões dos projetos para atualizar o status do funil de produção.
        </p>
      </div>

      {/* Board Scroll wrapper */}
      <div className="flex-1 overflow-x-auto pb-4 flex items-start gap-4 select-none min-h-0">
        {KANBAN_COLUMNS.map((col) => {
          const colProjects = projetos.filter(p => {
            // Em produção maps to execution as well for this visual board
            if (col.status === 'Em execução') {
              return p.status === 'Em execução' || p.status === 'Em produção'
            }
            return p.status === col.status
          })

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className="w-72 max-h-full flex flex-col bg-[#FDFCFB] border border-[#E8E5E0] rounded-sm flex-shrink-0"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-[#E8E5E0] bg-[#171513] text-white flex justify-between items-center rounded-t-sm">
                <h3 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#C6A537] truncate max-w-[80%]">
                  {col.title}
                </h3>
                <span className="text-[10px] bg-[#2C241D] border border-[#C6A537]/25 text-[#E8E5E0] px-2 py-0.5 rounded-full font-bold">
                  {colProjects.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
                {colProjects.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-light italic border border-dashed border-gray-200 p-4 text-center rounded-sm">
                    Arraste projetos aqui
                  </div>
                ) : (
                  colProjects.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      className="bg-white p-4 border border-[#E8E5E0] rounded-sm hover:border-[#C6A537] hover:shadow-md transition-all cursor-grab active:cursor-grabbing text-xs space-y-3"
                    >
                      <div>
                        <h4 className="font-semibold text-[#171513] line-clamp-2 leading-tight">
                          {p.nome}
                        </h4>
                        <p className="text-[9px] text-gray-400 mt-1">{p.tipo_imovel}</p>
                      </div>

                      <div className="border-t border-[#E8E5E0] pt-2.5 space-y-1.5 text-[#6F6A64] text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#C6A537] flex-shrink-0" />
                          <span className="truncate max-w-[150px] font-medium">{p.usuarios?.nome_completo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C6A537] flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{p.cidade} - {p.estado}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <Link
                          href={`/admin/projetos/${p.id}`}
                          className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#C6A537] hover:underline uppercase tracking-wider"
                        >
                          Ver Detalhes <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
