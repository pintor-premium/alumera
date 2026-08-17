'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Mail, Phone, MapPin, Briefcase } from 'lucide-react'

interface Cliente {
  id: string
  usuario_id: string
  tipo_profissional: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  empresa_escritorio: string
  registro_profissional: string
  cnpj: string
  instagram: string
  site: string
  usuarios: {
    nome_completo: string
    email: string
    ativo: boolean
  }
}

export default function AdminClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadClientes() {
      try {
        const { data, error } = await supabase
          .from('perfis_profissionais')
          .select('*, usuarios(nome_completo, email, ativo)')
          .order('criado_em', { ascending: false })

        if (!error && data) {
          setClientes(data as any)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadClientes()
  }, [supabase])

  const filteredClientes = clientes.filter((c) => {
    const nomeCompleto = c.usuarios?.nome_completo || ''
    const email = c.usuarios?.email || ''
    return (
      nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.empresa_escritorio && c.empresa_escritorio.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-wide">Clientes e Parceiros</h1>
          <p className="text-xs text-[#6F6A64] mt-1 font-light">Listagem e CRM de Arquitetos e Engenheiros parceiros.</p>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 border border-[#E8E5E0] rounded-sm shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar por nome, email, empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-premium pl-10 pr-4 py-2.5 text-xs rounded-sm"
          />
          <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white border border-[#E8E5E0] rounded-sm shadow-sm overflow-hidden">
        {filteredClientes.length === 0 ? (
          <div className="p-16 text-center text-[#6F6A64] font-light">
            Nenhum cliente/parceiro cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5E0] bg-[#FDFCFB] text-[10px] uppercase font-bold tracking-widest text-[#6F6A64]">
                  <th className="p-4 pl-6">Nome Completo</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Empresa / Escritório</th>
                  <th className="p-4">CAU/CREA</th>
                  <th className="p-4">Contatos</th>
                  <th className="p-4">Localização</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E5E0] font-sans">
                {filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FDFCFB]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-[#171513]">{c.usuarios?.nome_completo}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{c.usuarios?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                        c.tipo_profissional === 'Arquiteto'
                          ? 'bg-[#C6A537]/15 border border-[#C6A537]/35 text-[#C6A537]'
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                      }`}>
                        {c.tipo_profissional}
                      </span>
                    </td>
                    <td className="p-4 text-[#6F6A64] font-medium">{c.empresa_escritorio || '—'}</td>
                    <td className="p-4 text-gray-500 font-mono">{c.registro_profissional || '—'}</td>
                    <td className="p-4 text-[#6F6A64] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C6A537] flex-shrink-0" />
                        <span>{c.telefone}</span>
                      </div>
                      {c.site && (
                        <div className="text-[10px] underline truncate max-w-[150px]">
                          <a href={`https://${c.site}`} target="_blank" rel="noreferrer">{c.site}</a>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[#6F6A64]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C6A537] flex-shrink-0" />
                        <span>{c.cidade} - {c.estado}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        c.usuarios?.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.usuarios?.ativo ? 'Ativo' : 'Inativo'}
                      </span>
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
