'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()
  
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Verify if we have the recovery token/session in the URL (handled automatically by Supabase auth client on mount)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // In case they access directly without a recovery flow
        toast.info('Para redefinir sua senha, utilize o link enviado para seu e-mail.')
      }
    }
    checkSession()
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (senha !== confirmaSenha) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      toast.error('A senha deve conter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: senha
      })

      if (error) {
        toast.error(error.message || 'Erro ao atualizar a senha.')
      } else {
        toast.success('Senha atualizada com sucesso! Faça login com suas novas credenciais.')
        router.push('/login')
      }
    } catch (err) {
      toast.error('Ocorreu um erro ao redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white text-[#171513]">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171513]">
        <Image
          src="/imagens/imagem para hero e paralax.png"
          alt="Alumera"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-[#171513]/30" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="relative w-12 h-12 block mb-4">
              <Image
                src="/imagens/ÍCONE SEM FUNDO PARA BG CLARO.png"
                alt="Alumera Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <h1 className="font-serif text-3xl font-medium tracking-wide">Redefinir Senha</h1>
            <p className="text-xs text-[#6F6A64] mt-1.5 font-light">Defina sua nova senha de acesso.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A64] uppercase mb-2">Confirmar Nova Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full input-premium pl-10 pr-4 py-3.5 text-sm rounded-sm"
                />
                <Lock className="w-4 h-4 text-[#6F6A64] absolute left-3 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#171513] hover:bg-[#2C241D] disabled:bg-[#171513]/50 text-white font-semibold py-4 rounded-sm text-xs tracking-widest uppercase transition-colors"
            >
              {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
