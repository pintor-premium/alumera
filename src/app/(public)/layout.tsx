import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col bg-white">
        {children}
      </main>
      <Footer />
    </>
  )
}
