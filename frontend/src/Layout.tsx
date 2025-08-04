import Footer from "./components/Footer"
import Header from "./components/Header"


export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="app-container">
      <Header></Header>
      <main className="children">{children}</main>
      <Footer></Footer>
    </div>
  )
}

