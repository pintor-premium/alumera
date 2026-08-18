'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // States for password recovery modal
  const [showRecoverModal, setShowRecoverModal] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverLoading, setRecoverLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
      } else {
        toast.success('Login realizado com sucesso! Redirecionando...')
        // Fetch user profile to redirect correctly
        const { data: profile } = await supabase
          .from('usuarios')
          .select('perfil')
          .eq('id', data.user.id)
          .single()

        const userProfile = data.user?.email === 'alumera@gmail.com' ? 'administrador' : (profile?.perfil || 'arquiteto')

        if (userProfile === 'administrador' || userProfile === 'operacional' || userProfile === 'financeiro') {
          router.push('/admin')
        } else {
          router.push('/portal')
        }
        router.refresh()
      }
    } catch (err) {
      toast.error('Erro de conexão. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoverLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      if (error) {
        toast.error('Erro ao enviar e-mail de recuperação. Verifique o endereço digitado.')
      } else {
        toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
        setShowRecoverModal(false)
        setRecoverEmail('')
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.')
    } finally {
      setRecoverLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white text-[#171513]">
      {/* Lado Esquerdo - Imagem (apenas desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171513]">
        <Image
          src="/imagens/imagem para hero e paralax.png"
          alt="Alumera Luxo"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-[#171513]/30" />
        <div className="absolute bottom-16 left-16 z-10 max-w-md">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.2em] uppercase block mb-3">EXCLUSIVIDADE</span>
          <h2 className="font-serif text-3xl text-white tracking-wide leading-snug mb-4">
            A sofisticação do ACM moldada sob medida para sua residência.
          </h2>
          <p className="text-xs text-[#E8E5E0]/75 leading-relaxed font-light">
            Área restrita para arquitetos, engenheiros e administradores do ecossistema Alumera.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
            <Link href="/" className="relative w-[280px] h-[70px] block">
              <Image
                src="/imagens/LOGO%20COM%20DIMENS%C3%83O%20E%20VOLUME.png"
                alt="Alumera Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-wide">Bem-vindo à Alumera</h1>
              <p className="text-xs text-[#6F6A64] mt-1.5 font-light">Acesse sua área exclusiva.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full input-premium pl-10 pr-4 py-3.5 text-sm rounded-sm"
                />
                <Mail className="w-4 h-4 text-[#6F6A64] absolute left-3 top-4" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase">Senha</label>
                <button
                  type="button"
                  onClick={() => setShowRecoverModal(true)}
                  className="text-[11px] font-semibold text-[#C6A537] hover:text-[#DFBF52] transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full input-premium pl-10 pr-10 py-3.5 text-sm rounded-sm"
                />
                <Lock className="w-4 h-4 text-[#6F6A64] absolute left-3 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-[#6F6A64] hover:text-[#171513] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#171513] hover:bg-[#2C241D] disabled:bg-[#171513]/50 text-white font-semibold py-4 rounded-sm text-xs tracking-widest uppercase transition-colors"
            >
              {loading ? 'CARREGANDO...' : 'ENTRAR'}
            </button>
          </form>

          {/* Cadastro Link */}
          <p className="text-center lg:text-left text-xs text-[#6F6A64] font-light">
            Não é um parceiro cadastrado?{' '}
            <Link href="/cadastro" className="font-semibold text-[#C6A537] hover:underline">
              Crie sua conta profissional
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showRecoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#171513] text-white rounded-sm border border-[#2C241D] w-full max-w-sm p-6 space-y-6">
            <div>
              <h3 className="font-serif text-lg text-white font-semibold tracking-wide">Recuperação de Senha</h3>
              <p className="text-xs text-[#6F6A64] mt-1 font-light">Digite seu e-mail cadastrado para receber as instruções.</p>
            </div>
            <form onSubmit={handleRecoverPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                className="w-full input-premium-dark px-4 py-3 text-sm rounded-sm"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecoverModal(false)}
                  className="flex-1 border border-[#2C241D] text-[#E8E5E0] py-3 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={recoverLoading}
                  className="flex-1 bg-[#C6A537] hover:bg-[#DFBF52] disabled:bg-[#C6A537]/50 text-white py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {recoverLoading ? 'ENVIANDO...' : 'ENVIAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
