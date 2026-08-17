'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { ArrowLeft, ArrowRight, Check, Key, MapPin, User, Briefcase } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Credenciais
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<'arquiteto' | 'engenheiro'>('arquiteto')
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')

  // Step 2: Contato e Endereço
  const [telefone, setTelefone] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  // Step 3: Opcionais
  const [empresa, setEmpresa] = useState('')
  const [registro, setRegistro] = useState('') // CAU/CREA
  const [cnpj, setCnpj] = useState('')
  const [instagram, setInstagram] = useState('')
  const [site, setSite] = useState('')

  // Fetch CEP using ViaCEP api
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
        } else {
          toast.error('CEP não encontrado.')
        }
      } catch (err) {
        toast.error('Erro ao buscar o CEP.')
      }
    }
  }

  const validateStep1 = () => {
    if (!nome || !email || !senha || !confirmaSenha) {
      toast.error('Preencha todos os campos obrigatórios.')
      return false
    }
    if (senha !== confirmaSenha) {
      toast.error('As senhas não coincidem.')
      return false
    }
    if (senha.length < 6) {
      toast.error('A senha deve conter no mínimo 6 caracteres.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!telefone || !cep || !endereco || !numero || !bairro || !cidade || !estado) {
      toast.error('Preencha todos os campos de contato e endereço.')
      return false
    }
    return true
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome_completo: nome,
            perfil,
            tipo_profissional: perfil === 'arquiteto' ? 'Arquiteto' : 'Engenheiro',
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
          }
        }
      })

      if (error) {
        toast.error(error.message || 'Erro ao realizar cadastro.')
      } else {
        toast.success('Cadastro realizado! Seja bem-vindo à Alumera.')
        router.push('/portal')
        router.refresh()
      }
    } catch (err) {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white text-[#171513]">
      {/* Lado Esquerdo - Imagem (apenas desktop) */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-[#171513]">
        <Image
          src="/imagens/imagem para hero e paralax.png"
          alt="Alumera Cadastro"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-[#171513]/40" />
        <div className="absolute bottom-16 left-12 z-10 max-w-sm">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.2em] uppercase block mb-3">PARCERIA</span>
          <h2 className="font-serif text-2xl text-white tracking-wide leading-snug mb-4">
            Envie projetos, receba orçamentos e acompanhe suas obras de forma digital.
          </h2>
        </div>
      </div>

      {/* Lado Direito - Multi-step Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <Link href="/" className="relative w-12 h-12 block mb-4">
                <Image
                  src="/imagens/ÍCONE SEM FUNDO PARA BG CLARO.png"
                  alt="Alumera Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Link>
              <h1 className="font-serif text-3xl font-medium tracking-wide">Crie sua conta profissional</h1>
              <p className="text-xs text-[#6F6A64] mt-1.5 font-light">
                Envie seus projetos para a Alumera e solicite uma proposta personalizada.
              </p>
            </div>
            
            {/* Step Indicators */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-[#C6A537] w-12'
                      : s < step
                      ? 'bg-[#171513]'
                      : 'bg-[#E8E5E0]'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* STEP 1: CONTA */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex gap-2 items-center text-xs font-bold text-[#C6A537] uppercase tracking-wider">
                  <Key className="w-4 h-4" /> Passo 1 — Credenciais e Identificação
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Tipo Profissional *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPerfil('arquiteto')}
                      className={`py-3.5 rounded-sm border text-xs font-semibold uppercase tracking-wider transition-colors ${
                        perfil === 'arquiteto'
                          ? 'border-[#C6A537] bg-[#C6A537]/5 text-[#C6A537]'
                          : 'border-[#E8E5E0] text-[#171513] hover:border-[#C6A537]'
                      }`}
                    >
                      Arquiteto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfil('engenheiro')}
                      className={`py-3.5 rounded-sm border text-xs font-semibold uppercase tracking-wider transition-colors ${
                        perfil === 'engenheiro'
                          ? 'border-[#C6A537] bg-[#C6A537]/5 text-[#C6A537]'
                          : 'border-[#E8E5E0] text-[#171513] hover:border-[#C6A537]'
                      }`}
                    >
                      Engenheiro
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Senha *</label>
                    <input
                      type="password"
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="No mínimo 6 dígitos"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Confirmar Senha *</label>
                    <input
                      type="password"
                      required
                      value={confirmaSenha}
                      onChange={(e) => setConfirmaSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => validateStep1() && setStep(2)}
                    className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors"
                  >
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ENDEREÇO & CONTATO */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex gap-2 items-center text-xs font-bold text-[#C6A537] uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Passo 2 — Contato e Endereço
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">CEP *</label>
                    <input
                      type="text"
                      required
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Endereço (Rua/Av) *</label>
                    <input
                      type="text"
                      required
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Logradouro"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Número *</label>
                    <input
                      type="text"
                      required
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Nº"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto, Sala, Bloco"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Cidade *</label>
                    <input
                      type="text"
                      required
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Cidade"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
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
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 border border-[#E8E5E0] text-[#171513] px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest hover:bg-black/5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => validateStep2() && setStep(3)}
                    className="inline-flex items-center gap-2 bg-[#171513] hover:bg-[#2C241D] text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors"
                  >
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: OPCIONAIS / DETALHES PROFISSIONAIS */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex gap-2 items-center text-xs font-bold text-[#C6A537] uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" /> Passo 3 — Dados Profissionais (Opcionais)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Empresa ou Escritório</label>
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Ex: Arquitetura Estúdio"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Registro Profissional (CAU/CREA)</label>
                    <input
                      type="text"
                      value={registro}
                      onChange={(e) => setRegistro(e.target.value)}
                      placeholder="Ex: A12345-6"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Instagram</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@seu.perfil"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Site corporativo</label>
                    <input
                      type="text"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      placeholder="www.seusite.com.br"
                      className="w-full input-premium px-4 py-3 text-sm rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 border border-[#E8E5E0] text-[#171513] px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest hover:bg-black/5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleCadastro}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white px-8 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors"
                  >
                    {loading ? 'CADASTRANDO...' : (
                      <>
                        CONCLUIR CADASTRO <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-[#6F6A64] font-light">
            Já possui uma conta?{' '}
            <Link href="/login" className="font-semibold text-[#C6A537] hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
