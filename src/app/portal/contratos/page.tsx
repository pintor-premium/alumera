'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileSignature, ArrowRight, Download } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Contrato {
  id: string
  numero: string
  caminho_storage: string
  nome_original: string
  status: string
  criado_em: string
  projetos: {
    id: string
    nome: string
  }
}

export default function PortalContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    async function loadContratos() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('contratos')
            .select('*, projetos!inner(id, nome, usuario_id)')
            .eq('projetos.usuario_id', user.id)
            .order('criado_em', { ascending: false })

          if (!error && data) {
            setContratos(data as any)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadContratos()
  }, [supabase])

  const handleDownload = async (path: string) => {
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
      toast.error('Erro ao conectar com o armazenamento.')
    }
  }

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
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Meus Contratos</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">
          Consulte e realize o aceite de contratos de fornecimento e instalação em ACM.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {contratos.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] space-y-4">
            <FileSignature className="w-10 h-10 text-[#C6A537] mx-auto opacity-60" />
            <p className="text-sm font-light">Nenhum contrato anexado para seus projetos até o momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Número</th>
                  <th className="p-4">Projeto</th>
                  <th className="p-4">Anexo</th>
                  <th className="p-4">Criado em</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0]">
                {contratos.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FDFCFB]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#171513]">{c.numero}</td>
                    <td className="p-4">
                      <Link href={`/portal/projetos/${c.projetos?.id}`} className="hover:text-[#C6A537] font-semibold underline">
                        {c.projetos?.nome}
                      </Link>
                    </td>
                    <td className="p-4 text-xs text-[#6F6A64] truncate max-w-[150px]">{c.nome_original}</td>
                    <td className="p-4 text-[#6F6A64]">
                      {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        c.status === 'Assinado'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-3">
                      <button
                        onClick={() => handleDownload(c.caminho_storage)}
                        className="inline-flex items-center gap-1.5 border border-[#E8E5E0] hover:border-[#C6A537] text-[#171513] hover:text-[#C6A537] px-2.5 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </button>
                      <Link
                        href={`/portal/projetos/${c.projetos?.id}?tab=contrato`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C6A537] hover:underline uppercase tracking-wider"
                      >
                        Assinar <ArrowRight className="w-3.5 h-3.5" />
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
