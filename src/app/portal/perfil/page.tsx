'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { User, MapPin, Briefcase, Check } from 'lucide-react'

export default function PortalPerfilPage() {
  const toast = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fields
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [tipoProfissional, setTipoProfissional] = useState('Arquiteto')
  const [telefone, setTelefone] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [registro, setRegistro] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [instagram, setInstagram] = useState('')
  const [site, setSite] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || '')
          
          // Fetch from usuarios
          const { data: usr } = await supabase
            .from('usuarios')
            .select('nome_completo')
            .eq('id', user.id)
            .single()
          
          if (usr) setNome(usr.nome_completo)

          // Fetch from perfis_profissionais
          const { data: prof } = await supabase
            .from('perfis_profissionais')
            .select('*')
            .eq('usuario_id', user.id)
            .single()

          if (prof) {
            setTipoProfissional(prof.tipo_profissional)
            setTelefone(prof.telefone)
            setCep(prof.cep)
            setEndereco(prof.endereco)
            setNumero(prof.numero)
            setComplemento(prof.complemento || '')
            setBairro(prof.bairro)
            setCidade(prof.cidade)
            setEstado(prof.estado)
            setEmpresa(prof.empresa_escritorio || '')
            setRegistro(prof.registro_profissional || '')
            setCnpj(prof.cnpj || '')
            setInstagram(prof.instagram || '')
            setSite(prof.site || '')
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [supabase])

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setEndereco(data.logradouro || '')
          setBairro(data.bairro || '')
          setCidade(data.localidade || '')
          setEstado(data.uf || '')
        }
      } catch (err) {
        toast.error('Erro ao buscar o CEP.')
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Update in usuarios
      const { error: usrErr } = await supabase
        .from('usuarios')
        .update({ nome_completo: nome })
        .eq('id', user.id)

      if (usrErr) {
        toast.error('Erro ao salvar os dados cadastrais.')
        setSaving(false)
        return
      }

      // 2. Update in perfis_profissionais
      const { error: profErr } = await supabase
        .from('perfis_profissionais')
        .update({
          tipo_profissional: tipoProfissional,
          telefone,
          cep,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          empresa_escritorio: empresa,
          registro_profissional: registro,
          cnpj,
          instagram,
          site
        })
        .eq('usuario_id', user.id)

      if (profErr) {
        toast.error('Erro ao salvar as informações profissionais.')
      } else {
        toast.success('Perfil atualizado com sucesso!')
      }
    } catch (err) {
      toast.error('Erro ao atualizar perfil.')
    } finally {
      setSaving(false)
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
    <div className="max-w-4xl mx-auto space-y-6 text-[#171513]">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-wide">Meu Perfil</h1>
        <p className="text-xs text-[#6F6A64] mt-1 font-light">Mantenha seus dados cadastrais e profissionais atualizados.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Identificação */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2 flex items-center gap-2">
            <User className="w-4 h-4" /> 1. Identificação Básica
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Nome Completo *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">E-mail (Não editável)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full input-premium bg-gray-50 text-gray-500 px-4 py-2.5 rounded-sm border-gray-200 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Tipo de Profissional *</label>
              <select
                value={tipoProfissional}
                onChange={(e) => setTipoProfissional(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              >
                <option value="Arquiteto">Arquiteto</option>
                <option value="Engenheiro">Engenheiro</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Telefone *</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Endereço */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> 2. Endereço Comercial
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">CEP *</label>
              <input
                type="text"
                required
                value={cep}
                onBlur={handleCepBlur}
                onChange={(e) => setCep(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Rua / Avenida *</label>
              <input
                type="text"
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Número *</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Bairro *</label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Cidade/Estado *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-3/4 input-premium px-4 py-2.5 rounded-sm"
                />
                <input
                  type="text"
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-1/4 input-premium px-2 py-2.5 text-center rounded-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Dados Opcionais */}
        <div className="bg-white p-6 border border-[#E8E5E0] rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#C6A537] border-b border-[#E8E5E0] pb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> 3. Detalhes Profissionais & Escritório
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Empresa ou Escritório</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Registro de Classe (CAU/CREA)</label>
              <input
                type="text"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Website</label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full input-premium px-4 py-2.5 rounded-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#171513] hover:bg-[#2C241D] disabled:bg-[#171513]/50 text-white font-semibold py-4 rounded-sm text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
        >
          {saving ? 'SALVANDO...' : (
            <>
              SALVAR ALTERAÇÕES <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
