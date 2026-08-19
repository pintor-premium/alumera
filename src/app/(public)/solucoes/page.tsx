import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function SolucoesPage() {
  const categories = [
    {
      id: 'fachadas',
      title: 'Fachadas Residenciais em ACM',
      desc: 'Nossas fachadas em ACM trazem modernidade, leveza visual e durabilidade incomparável para residências de alto padrão. O ACM (Aluminum Composite Material) permite criar vãos livres imponentes, curvas e volumes arquitetônicos geométricos que seriam complexos de executar com alvenaria convencional.',
      specs: [
        'Excelente isolamento térmico e acústico',
        'Grande variedade de cores e acabamentos (brilho, fosco, amadeirados)',
        'Resistência superior a intempéries e raios UV',
        'Manutenção simples e limpeza fácil'
      ],
      image: '/imagens/imagem para hero e paralax.png'
    },
    {
      id: 'portas',
      title: 'Portas Monumentais em ACM',
      desc: 'Desenvolvemos portas de entrada pivotantes monumentais sob medida. Estruturadas com perfis internos de aço carbono ou alumínio naval e revestidas com chapas premium de ACM, nossas portas oferecem leveza na movimentação (fechadura magnética e eixos pivotantes especiais) combinada com uma estética limpa, sem emendas visíveis.',
      specs: [
        'Estruturas pivotantes projetadas para grandes vãos (altura até 6m+)',
        'Integráveis com puxadores esculpidos em ACM, inox ou madeira nobre',
        'Fechaduras digitais/biométricas embutidas na própria estrutura',
        'Borrachas de vedação dupla contra ventos e poeira'
      ],
      image: '/imagens/SUITE.png'
    },
    {
      id: 'portoes',
      title: 'Portões Eletrônicos em ACM',
      desc: 'Unimos segurança, automação tecnológica e estética arquitetônica nos portões eletrônicos da Alumera. Revestidos integralmente com chapas premium de ACM, os portões eletrônicos garantem abertura rápida, silenciosa e com o máximo de sofisticação, integrados perfeitamente ao projeto da fachada residencial.',
      specs: [
        'Automatizadores rápidos de alta vazão',
        'Camuflagem perfeita junto a painéis de fachada fixos',
        'Estrutura em metalon galvanizado com pintura epóxi anti-ferrugem',
        'Sistemas modernos de automação e controle tecnológico'
      ],
      image: '/imagens/SALA.png'
    },
    {
      id: 'moveis',
      title: 'Móveis Planejados em ACM',
      desc: 'Uma inovação da Alumera para ambientes sofisticados. O uso do ACM na estruturação e revestimento de frentes de gavetas e portas de móveis planejados (como copas gourmet, banheiros e áreas externas) garante imunidade total à umidade, facilidade de higienização e leveza extrema, com designs de espessura slim e acabamento minimalista.',
      specs: [
        'Resistência absoluta à água e vapores (ideal para áreas gourmet)',
        'Estruturas slim de espessura refinada com cantos arredondados',
        'Compatível com ferragens slow-motion de alto padrão',
        'Opções em acabamentos amadeirados premium e escovados'
      ],
      image: '/imagens/COZINHA.png'
    }
  ]

  return (
    <div className="bg-white">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="Soluções Alumera"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-black/30" />
        </div>
        <div className="relative z-10 text-center">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.3em] uppercase block mb-3">CONHEÇA AS OPÇÕES</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white sm:text-[#171513] tracking-wide">Nossas Soluções</h1>
        </div>
      </section>

      {/* Grid de Soluções detalhadas */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            id={cat.id}
            className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center scroll-mt-24 ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Texto */}
            <div className="flex-1 space-y-6">
              <span className="text-[#C6A537] text-xs font-bold tracking-widest uppercase block">SOLUÇÃO INDIVIDUAL</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#171513] tracking-wide font-medium">{cat.title}</h2>
              <div className="w-12 h-[2px] bg-[#C6A537]" />
              <p className="text-sm sm:text-base text-[#6F6A64] font-light leading-relaxed">{cat.desc}</p>
              
              <ul className="space-y-3">
                {cat.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-3 text-xs sm:text-sm text-[#171513]">
                    <span className="w-5 h-5 bg-[#C6A537]/15 border border-[#C6A537]/40 rounded-full flex items-center justify-center text-[#C6A537] flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Imagem */}
            <div className="flex-1 w-full relative aspect-[4/3] rounded-sm overflow-hidden shadow-xl border border-[#E8E5E0]">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        ))}
      </section>

      {/* CTA final */}
      <section className="bg-[#171513] py-20 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide text-white mb-4">Tem um projeto desenhado por um arquiteto?</h2>
          <p className="text-sm text-[#6F6A64] mb-8 font-light max-w-xl mx-auto">
            Traga as especificações técnicas, imagens e arquivos 3D para nossa análise. Desenvolveremos um orçamento sob medida para você.
          </p>
          <Link
            href="/portal/projetos/novo"
            className="bg-[#C6A537] hover:bg-[#DFBF52] text-white px-10 py-4 rounded-sm text-xs font-semibold tracking-widest uppercase transition-colors"
          >
            ENVIAR MEU PROJETO AGORA
          </Link>
        </div>
      </section>
    </div>
  )
}
