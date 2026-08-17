'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Grid, Layers } from 'lucide-react'

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

// Fallback projects static metadata matching our images
const fallbackProjects: PortfolioProject[] = [
  {
    id: 'f1',
    titulo: 'Living Gourmet & Cozinha Integrada',
    slug: 'living-gourmet-cozinha',
    categoria: 'Móveis Planejados',
    descricao: 'Projeto residencial integrado de cozinha gourmet executado com estruturas inovadoras de ACM na cor preto fosco.',
    localizacao: 'Alphaville, SP',
    imagem_principal: '/imagens/COZINHA.png',
    destaque: true
  },
  {
    id: 'f2',
    titulo: 'Suíte Master com Revestimento ACM',
    slug: 'suite-master',
    categoria: 'Móveis Planejados',
    descricao: 'Acabamentos internos e painel de cabeceira em ACM texturizado trazendo design elegante e sofisticação duradoura.',
    localizacao: 'Jardins, SP',
    imagem_principal: '/imagens/SUITE.png',
    destaque: true
  },
  {
    id: 'f3',
    titulo: 'Sala de Estar Integrada',
    slug: 'sala-estar-integrada',
    categoria: 'Outros',
    descricao: 'Portas de correr internas e brises verticais de ACM desenhados sob medida para controle de luminosidade e privacidade.',
    localizacao: 'Itaim Bibi, SP',
    imagem_principal: '/imagens/SALA.png',
    destaque: false
  },
  {
    id: 'f4',
    titulo: 'Sala de Banho Suíte Especial',
    slug: 'sala-banho-suite',
    categoria: 'Outros',
    descricao: 'Solução impermeável em ACM amadeirado para nichos, fechamentos de banheira e teto rebaixado da suíte master.',
    localizacao: 'Pinheiros, SP',
    imagem_principal: '/imagens/BANHEIRO-SUITE.png',
    destaque: false
  },
  {
    id: 'f5',
    titulo: 'Banheiro Social Contemporâneo',
    slug: 'banheiro-social',
    categoria: 'Outros',
    descricao: 'Armários suspensos e bancada estruturada em ACM na cor dourado escovado Alumera.',
    localizacao: 'Moema, SP',
    imagem_principal: '/imagens/BANHEIRO-SOCIAL.png',
    destaque: false
  },
  {
    id: 'f6',
    titulo: 'Quarto Infantil Planejado',
    slug: 'quarto-infantil',
    categoria: 'Móveis Planejados',
    descricao: 'Mobiliário com detalhes coloridos e frentes de gaveta com revestimento leve de ACM anti-risco.',
    localizacao: 'Perdizes, SP',
    imagem_principal: '/imagens/QUARTO-INFANTIL.png',
    destaque: false
  }
]

export default function ProjetosPage() {
  const [dbProjects, setDbProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const supabase = createClient()

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from('projetos_portfolio')
          .select('*')
          .eq('ativo', true)
          .order('destaque', { ascending: false })
          .order('criado_em', { ascending: false })

        if (!error && data && data.length > 0) {
          setDbProjects(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [supabase])

  const projects = dbProjects.length > 0 ? dbProjects : fallbackProjects

  const categories = ['Todos', ...Array.from(new Set(projects.map((p) => p.categoria)))]

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.localizacao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'Todos' || project.categoria === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="/imagens/imagem para hero e paralax.png"
            alt="Portfólio Alumera"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-black/30" />
        </div>
        <div className="relative z-10 text-center">
          <span className="text-[#C6A537] text-xs font-bold tracking-[0.3em] uppercase block mb-3">CONHEÇA AS OPÇÕES</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white sm:text-[#171513] tracking-wide">Portfólio</h1>
        </div>
      </section>

      {/* Busca e Filtros */}
      <section className="py-12 border-b border-[#E8E5E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Categorias */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                  selectedCategory === cat
                    ? 'bg-[#C6A537] text-white border-[#C6A537]'
                    : 'bg-white text-[#171513] border-[#E8E5E0] hover:border-[#C6A537]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Pesquisar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-premium pl-10 pr-4 py-2 text-sm rounded-sm"
            />
            <Search className="w-4 h-4 text-[#6F6A64] absolute left-3 top-3" />
          </div>
        </div>
      </section>

      {/* Grid de Projetos */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-[#6F6A64] font-light">
            Nenhum projeto encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden bg-white border border-[#E8E5E0] rounded-sm flex flex-col hover:shadow-xl transition-all duration-300"
              >
                {/* Imagem */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2C241D]">
                  <Image
                    src={project.imagem_principal}
                    alt={project.titulo}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  {project.destaque && (
                    <span className="absolute top-4 left-4 bg-[#C6A537] text-white text-[9px] font-bold tracking-widest px-2 py-1 uppercase rounded-sm">
                      Destaque
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#C6A537] uppercase">
                      {project.categoria}
                    </span>
                    <h3 className="font-serif text-lg font-medium text-[#171513] group-hover:text-[#C6A537] transition-colors leading-snug">
                      {project.titulo}
                    </h3>
                    <p className="text-xs text-[#6F6A64] font-light line-clamp-2 leading-relaxed">
                      {project.descricao}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8E5E0] flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1 text-[#6F6A64]">
                      <MapPin className="w-3.5 h-3.5 text-[#C6A537]" />
                      {project.localizacao}
                    </span>
                    <Link
                      href={`/projetos/${project.slug}`}
                      className="font-semibold text-[#171513] hover:text-[#C6A537] transition-colors uppercase tracking-wider text-[10px]"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
