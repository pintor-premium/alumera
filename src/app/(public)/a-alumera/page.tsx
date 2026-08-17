import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function AAlumeraPage() {
  const values = [
    { title: 'Qualidade Excepcional', desc: 'Trabalhamos exclusivamente com chapas de ACM de altíssima durabilidade e acabamento impecável.' },
    { title: 'Precisão de Engenharia', desc: 'Transformamos projetos arquitetônicos complexos em realidade através de medições precisas e tecnologia de corte CNC.' },
    { title: 'Design Sob Medida', desc: 'Não possuímos catálogo fixo de modulação. Cada peça é fabricada exclusivamente para a sua obra.' },
    { title: 'Comprometimento com Prazos', desc: 'Garantimos pontualidade na produção e instalação, honrando o cronograma planejado.' }
  ]

  return (
    <div className="bg-white text-[#171513]">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="A Alumera"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-black/30" />
        </div>
        <div className="relative z-10 text-center">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.3em] uppercase block mb-3">CONHEÇA A MARCA</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white sm:text-[#171513] tracking-wide">A Alumera</h1>
        </div>
      </section>

      {/* História e Propósito */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#171513] tracking-wide">
              Sua residência com requinte sofisticado, elegante e moderno.
            </h2>
            <div className="w-12 h-[2px] bg-[#C6A537]" />
            <p className="text-[#6F6A64] font-light leading-relaxed text-sm sm:text-base">
              A Alumera nasceu do desejo de preencher uma lacuna no mercado de acabamento imobiliário de alto padrão: a necessidade de soluções estruturadas e revestidas em ACM de altíssima precisão e customização. 
            </p>
            <p className="text-[#6F6A64] font-light leading-relaxed text-sm sm:text-base">
              Acreditamos que a entrada de uma residência, a fachada e os elementos de acabamento técnico são cartões de visita e assinaturas do estilo de vida de seus moradores. Por isso, aliamos a maleabilidade e leveza do ACM a estruturas metálicas robustas e engenharia de alto nível para executar portas pivotantes majestosas, portões eletrônicos perfeitamente alinhados e fachadas residenciais imponentes.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
            <Image
              src="/imagens/SUITE.png"
              alt="Design Alumera"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-[#171513] text-[#E8E5E0] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#C6A537] text-xs font-semibold tracking-[0.2em] uppercase block mb-3">NOSSA CONDUTA</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide">Diferenciais Alumera</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 bg-[#2C241D]/40 border border-[#2C241D] rounded-sm">
                <CheckCircle className="w-6 h-6 text-[#C6A537] flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-white mb-2 tracking-wide font-medium">{v.title}</h3>
                  <p className="text-xs text-[#6F6A64] leading-relaxed font-light">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 sm:py-24 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <h3 className="font-serif text-2xl sm:text-3xl mb-6">Pronto para elevar o nível da sua obra?</h3>
        <p className="text-sm text-[#6F6A64] mb-8 max-w-xl mx-auto font-light">
          Seja você arquiteto, engenheiro ou construtor, temos a infraestrutura necessária para materializar suas ideias em ACM de alto padrão.
        </p>
        <Link
          href="/cadastro"
          className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-3.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          CADASTRE-SE E ENVIE SEU PROJETO
        </Link>
      </section>
    </div>
  )
}
