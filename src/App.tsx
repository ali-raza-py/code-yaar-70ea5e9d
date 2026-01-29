import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ForcedPasswordUpdateWrapper } from "@/components/auth/ForcedPasswordUpdateWrapper";
import Home from "./pages/Home";
import AITool from "./pages/AITool";
import Learn from "./pages/Learn";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Courses from "./pages/Courses";
import Algorithms from "./pages/Algorithms";
import Doubts from "./pages/Doubts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ForcedPasswordUpdateWrapper>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/ai-tool" element={<AITool />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/algorithms" element={<Algorithms />} />
                      <Route path="/doubts" element={<Doubts />} />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </ForcedPasswordUpdateWrapper>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
