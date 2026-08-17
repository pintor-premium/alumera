'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Calendar, Compass, ArrowLeft } from 'lucide-react'

interface PortfolioProject {
  id: string
  titulo: string
  slug: string
  categoria: string
  descricao: string
  localizacao: string
  imagem_principal: string
  destaque: boolean
}

const fallbackProjects: PortfolioProject[] = [
  {
    id: 'f1',
    titulo: 'Living Gourmet & Cozinha Integrada',
    slug: 'living-gourmet-cozinha',
    categoria: 'Móveis Planejados',
    descricao: 'Projeto residencial de alto padrão executado com estruturas inovadoras de ACM na cor preto fosco e perfis internos reforçados. O design integra a churrasqueira, balcão e bancada molhada com resistência absoluta à umidade e calor, combinando alta engenharia com estilo minimalista contemporâneo.',
    localizacao: 'Alphaville, SP',
    imagem_principal: '/imagens/COZINHA.png',
    destaque: true
  },
  {
    id: 'f2',
    titulo: 'Suíte Master com Revestimento ACM',
    slug: 'suite-master',
    categoria: 'Móveis Planejados',
    descricao: 'Acabamentos internos e painel de cabeceira em ACM texturizado dourado escovado, desenhado sob medida. Traz design elegante, leveza e sofisticação de longa duração para o quarto principal.',
    localizacao: 'Jardins, SP',
    imagem_principal: '/imagens/SUITE.png',
    destaque: true
  },
  {
    id: 'f3',
    titulo: 'Sala de Estar Integrada',
    slug: 'sala-estar-integrada',
    categoria: 'Outros',
    descricao: 'Portas de correr internas e brises verticais de ACM desenhados sob medida para controle de luminosidade e privacidade da área social integrada com a varanda.',
    localizacao: 'Itaim Bibi, SP',
    imagem_principal: '/imagens/SALA.png',
    destaque: false
  },
  {
    id: 'f4',
    titulo: 'Sala de Banho Suíte Especial',
    slug: 'sala-banho-suite',
    categoria: 'Outros',
    descricao: 'Solução impermeável em ACM amadeirado para nichos, fechamentos de banheira e teto rebaixado da suíte master. Totalmente resistente a vapores e umidade.',
    localizacao: 'Pinheiros, SP',
    imagem_principal: '/imagens/BANHEIRO-SUITE.png',
    destaque: false
  },
  {
    id: 'f5',
    titulo: 'Banheiro Social Contemporâneo',
    slug: 'banheiro-social',
    categoria: 'Outros',
    descricao: 'Armários suspensos e bancada estruturada em ACM na cor dourado escovado Alumera, oferecendo imunidade a infiltrações.',
    localizacao: 'Moema, SP',
    imagem_principal: '/imagens/BANHEIRO-SOCIAL.png',
    destaque: false
  },
  {
    id: 'f6',
    titulo: 'Quarto Infantil Planejado',
    slug: 'quarto-infantil',
    categoria: 'Móveis Planejados',
    descricao: 'Mobiliário com detalhes coloridos e frentes de gaveta com revestimento leve de ACM anti-risco e fácil higienização.',
    localizacao: 'Perdizes, SP',
    imagem_principal: '/imagens/QUARTO-INFANTIL.png',
    destaque: false
  }
]

export default function ProjetoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [project, setProject] = useState<PortfolioProject | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from('projetos_portfolio')
          .select('*')
          .eq('slug', resolvedParams.slug)
          .single()

        if (!error && data) {
          setProject(data)
        } else {
          // Check fallbacks
          const local = fallbackProjects.find((p) => p.slug === resolvedParams.slug)
          if (local) setProject(local)
        }
      } catch (err) {
        console.error(err)
        const local = fallbackProjects.find((p) => p.slug === resolvedParams.slug)
        if (local) setProject(local)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [resolvedParams.slug, supabase])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A537]"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="font-serif text-2xl">Projeto não encontrado</h2>
        <Link href="/projetos" className="text-[#C6A537] hover:underline">Voltar para o Portfólio</Link>
      </div>
    )
  }

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F6A64] hover:text-[#C6A537] mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portfólio
        </Link>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Imagem Principal */}
          <div className="lg:col-span-2 relative aspect-[4/3] w-full bg-[#2C241D] rounded-sm overflow-hidden shadow-2xl border border-[#E8E5E0]">
            <Image
              src={project.imagem_principal}
              alt={project.titulo}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          {/* Ficha Técnica */}
          <div className="space-y-8 lg:border-l lg:border-[#E8E5E0] lg:pl-12">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#C6A537] uppercase block mb-1">
                {project.categoria}
              </span>
              <h1 className="font-serif text-3xl text-[#171513] font-medium leading-tight mb-4">
                {project.titulo}
              </h1>
              <div className="w-12 h-[2px] bg-[#C6A537] mb-6" />
            </div>

            <div className="space-y-4 text-sm text-[#171513]">
              <div className="flex items-center gap-3 border-b border-[#E8E5E0] pb-3">
                <MapPin className="w-5 h-5 text-[#C6A537]" />
                <div>
                  <span className="text-xs text-[#6F6A64] block font-light">Localização</span>
                  <span className="font-medium">{project.localizacao}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-[#E8E5E0] pb-3">
                <Calendar className="w-5 h-5 text-[#C6A537]" />
                <div>
                  <span className="text-xs text-[#6F6A64] block font-light">Data de Conclusão</span>
                  <span className="font-medium">17/08/2026</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-[#E8E5E0] pb-3">
                <Compass className="w-5 h-5 text-[#C6A537]" />
                <div>
                  <span className="text-xs text-[#6F6A64] block font-light">Serviço Executado</span>
                  <span className="font-medium">Sob Medida</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#171513]">Descrição do Projeto</h3>
              <p className="text-sm text-[#6F6A64] leading-relaxed font-light">
                {project.descricao}
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/cadastro"
                className="w-full text-center block bg-[#C6A537] hover:bg-[#DFBF52] text-white py-4 rounded-sm text-xs font-semibold tracking-widest uppercase transition-colors"
              >
                Solicitar Proposta Equivalente
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
