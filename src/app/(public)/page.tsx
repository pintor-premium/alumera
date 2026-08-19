import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Box, DoorOpen, Compass, Shield, Maximize2 } from 'lucide-react'

export default function HomePage() {
  const services = [
    {
      title: 'Fachadas Residenciais',
      description: 'Soluções personalizadas em ACM de alto padrão para projetos residenciais contemporâneos e luxuosos.',
      icon: Compass,
      image: '/imagens/imagem para hero e paralax.png',
    },
    {
      title: 'Portas em ACM',
      description: 'Portas imponentes desenvolvidas sob medida, integrando design moderno e alta durabilidade.',
      icon: DoorOpen,
      image: '/imagens/porta%20em%20ACM%20capa.png',
    },

    {
      title: 'Móveis Planejados em ACM',
      description: 'Móveis sob medida inovadores, aproveitando a leveza, durabilidade e flexibilidade do ACM.',
      icon: Maximize2,
      image: '/imagens/QUARTO-INFANTIL.png',
    },
    {
      title: 'Portões Eletrônicos',
      description: 'Automatização e controle tecnológico perfeitamente integrados ao design do seu portão.',
      icon: Shield,
      image: '/imagens/COZINHA.png',
    },
  ]

  const portfolioHighlights = [
    {
      title: 'Living Gourmet & Cozinha Integrada',
      category: 'Móveis Planejados',
      location: 'Alphaville, SP',
      image: '/imagens/COZINHA.png',
      slug: 'living-gourmet-cozinha'
    },
    {
      title: 'Suíte Master com Revestimento ACM',
      category: 'Móveis / Revestimento',
      location: 'Jardins, SP',
      image: '/imagens/SUITE.png',
      slug: 'suite-master'
    },
    {
      title: 'Sala de Estar Integrada',
      category: 'Soluções ACM',
      location: 'Itaim Bibi, SP',
      image: '/imagens/SALA.png',
      slug: 'sala-estar-integrada'
    },
    {
      title: 'Sala de Banho Suíte Especial',
      category: 'Soluções Personalizadas',
      location: 'Pinheiros, SP',
      image: '/imagens/BANHEIRO-SUITE.png',
      slug: 'sala-banho-suite'
    }
  ]

  return (
    <div 
      className="flex flex-col min-h-screen bg-fixed bg-cover bg-center bg-[#171513]"
      style={{ backgroundImage: "url('/imagens/imagem para hero e paralax.png')" }}
    >
      {/* HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-t from-[#171513] via-transparent to-black/50 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left text-white w-full">
          <div className="max-w-3xl">
            <span className="font-serif tracking-[0.3em] text-[#C6A537] text-xs sm:text-sm font-semibold uppercase block mb-6 animate-fade-in-up">
              ALUMERA ALTO PADRÃO
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-wider text-white mb-6 leading-tight animate-fade-in-up">
              Arquitetura sob medida.<br/>
              <span className="text-gold-gradient font-medium">Precisão em cada detalhe.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#E8E5E0] mb-10 font-light leading-relaxed tracking-wide animate-fade-in-up">
              Soluções personalizadas em ACM para fachadas, portas, portões e móveis planejados de alto padrão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start items-center animate-fade-in-up">
              <Link
                href="/portal/projetos/novo"
                className="w-full sm:w-auto bg-[#C6A537] hover:bg-[#DFBF52] text-white px-8 py-4 rounded-sm text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-black/20 text-center"
              >
                ENVIAR MEU PROJETO
              </Link>
              <Link
                href="/a-alumera"
                className="w-full sm:w-auto border border-[#E8E5E0] hover:border-[#C6A537] hover:text-[#C6A537] text-white px-8 py-4 rounded-sm text-xs font-semibold tracking-widest uppercase transition-all duration-300 text-center"
              >
                CONHECER A ALUMERA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS SECTION */}
      <section className="bg-[#171513]/75 backdrop-blur-md py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-serif text-xs sm:text-sm tracking-[0.2em] text-[#C6A537] font-semibold uppercase block mb-3">
              NOSSO CATALOGO
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-wide mb-6">
              Soluções Sob Medida em ACM
            </h2>
            <div className="w-16 h-[2px] bg-[#C6A537] mx-auto mb-6" />
            <p className="text-sm sm:text-base text-[#E8E5E0]/80 font-light leading-relaxed">
              Desenvolvemos produtos customizados a partir dos projetos técnicos enviados por arquitetos e engenheiros, unindo tecnologia de ponta com sofisticação artesanal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group relative overflow-hidden bg-[#171513] rounded-sm shadow-xl flex flex-col justify-end min-h-[350px] p-6 hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="opacity-40 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 bg-[#C6A537]/20 border border-[#C6A537]/45 rounded-sm flex items-center justify-center mb-4 text-[#C6A537]">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2 tracking-wide font-medium">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#E8E5E0]/85 font-light leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <Link
                    href="/solucoes"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#C6A537] hover:text-white transition-colors"
                  >
                    Saber Mais <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO HIGHLIGHTS */}
      <section className="bg-[#171513] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-6">
            <div>
              <span className="font-serif text-xs sm:text-sm tracking-[0.2em] text-[#C6A537] font-semibold uppercase block mb-3">
                GALERIA EXCLUSIVA
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-wide">
                Projetos Realizados
              </h2>
            </div>
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C6A537] hover:text-[#DFBF52] transition-colors"
            >
              Ver Portfólio Completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioHighlights.map((project) => (
              <Link
                href={`/projetos/${project.slug}`}
                key={project.title}
                className="group relative overflow-hidden rounded-sm aspect-[3/4] bg-[#2C241D] flex flex-col justify-end p-6 hover:shadow-lg hover:shadow-[#C6A537]/5 transition-all duration-500"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/90 via-[#171513]/30 to-transparent" />
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] font-bold tracking-widest text-[#C6A537] uppercase block mb-1">
                    {project.category}
                  </span>
                  <h3 className="font-serif text-lg text-white font-medium mb-1 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#6F6A64]">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PARA PROFISSIONAIS */}
      <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="Alumera Expertise"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-20 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171513] to-[#2C241D]/90" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-wide mb-6">
            Seu projeto. Nossa expertise em ACM.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#E8E5E0] max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Envie seu projeto para a Alumera e nossa equipe analisará as especificações para desenvolver uma proposta personalizada para sua obra.
          </p>
          <Link
            href="/cadastro"
            className="inline-block bg-[#C6A537] hover:bg-[#DFBF52] text-white px-10 py-4 rounded-sm text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-black/35"
          >
            CRIAR MINHA CONTA
          </Link>
        </div>
      </section>
    </div>
  )
}
