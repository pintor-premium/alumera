import Link from 'next/link'
import Image from 'next/image'
import { FileText, Compass, Send, CheckCircle2 } from 'lucide-react'

export default function SejaParceiroPage() {
  const steps = [
    {
      icon: Send,
      title: '1. Envio do Projeto',
      desc: 'Crie sua conta no portal e envie o projeto com os arquivos técnicos (PDF, DWG, SKP, etc.).'
    },
    {
      icon: Compass,
      title: '2. Análise da Engenharia',
      desc: 'Nossa equipe analisa as especificações, confere os detalhes de vãos e propõe as melhores estruturas de ACM.'
    },
    {
      icon: FileText,
      title: '3. Orçamento e Negociação',
      desc: 'Elaboramos uma proposta detalhada com itens e valores. Você pode solicitar revisões no próprio portal.'
    },
    {
      icon: CheckCircle2,
      title: '4. Execução e Conclusão',
      desc: 'Após aprovação e assinatura digital do contrato, iniciamos a fabricação e montagem com total conformidade técnica.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="Parceria Alumera"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-black/30" />
        </div>
        <div className="relative z-10 text-center">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.3em] uppercase block mb-3">PARCERIA EXCLUSIVA</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white sm:text-[#171513] tracking-wide">Seja Parceiro</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#171513] mb-6">Projetado por você. Materializado por nós.</h2>
        <div className="w-16 h-[2px] bg-[#C6A537] mx-auto mb-6" />
        <p className="text-sm sm:text-base text-[#6F6A64] font-light leading-relaxed max-w-3xl mx-auto mb-16">
          Trabalhamos em sinergia com escritórios de arquitetura e construtoras de alto padrão. Oferecemos suporte técnico completo desde a concepção dos detalhes executivos até a instalação final em obra. Com nossa plataforma, você acompanha o status de cada projeto, recebe orçamentos e aprova contratos de forma 100% digital.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {steps.map((s, idx) => (
            <div key={s.title} className="space-y-4">
              <div className="w-12 h-12 bg-[#171513] text-[#C6A537] border border-[#C6A537]/30 rounded-sm flex items-center justify-center">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#171513]">{s.title}</h3>
              <p className="text-xs text-[#6F6A64] font-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Callout */}
      <section className="bg-[#171513] text-[#E8E5E0] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
            <Image
              src="/imagens/QUARTO-INFANTIL.png"
              alt="Arquitetura de Qualidade"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide">Benefícios do nosso Portal do Profissional</h2>
            <div className="w-12 h-[2px] bg-[#C6A537]" />
            <ul className="space-y-4 text-sm font-light text-[#E8E5E0]/80">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#C6A537] rounded-full" />
                <span>Upload fácil de arquivos técnicos pesados de até 500MB.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#C6A537] rounded-full" />
                <span>Histórico centralizado de todas as mensagens e revisões de projetos.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#C6A537] rounded-full" />
                <span>Aprovação de orçamentos e consulta de contratos com um clique.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#C6A537] rounded-full" />
                <span>Timeline visual de progresso (do Envio à Execução final na obra).</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link
                href="/cadastro"
                className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-3.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                CRIAR MEU CADASTRO DE PARCEIRO
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
