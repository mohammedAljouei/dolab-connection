import { Header } from "@/components/Header";
import { Feed } from "@/components/Feed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <Feed />
      </main>
    </div>
  );
};

export default Index;