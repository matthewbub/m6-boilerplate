import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1">
        <h1>Home</h1>
      </main>
      <Footer />
    </div>
  );
}
