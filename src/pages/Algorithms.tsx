import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Clock, Zap, ChevronRight, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AlgorithmCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Algorithm {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: string;
  time_complexity: string;
  space_complexity: string;
  category_id: string;
}

export default function Algorithms() {
  const [categories, setCategories] = useState<AlgorithmCategory[]>([]);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [filteredAlgorithms, setFilteredAlgorithms] = useState<Algorithm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAlgorithms();
  }, [algorithms, searchQuery, selectedCategory]);

  const fetchData = async () => {
    try {
      const [categoriesRes, algorithmsRes] = await Promise.all([
        supabase
          .from("algorithm_categories")
          .select("*")
          .eq("is_published", true)
          .order("sort_order"),
        supabase
          .from("algorithms")
          .select("*")
          .eq("is_published", true)
          .order("name"),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (algorithmsRes.data) setAlgorithms(algorithmsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAlgorithms = () => {
    let filtered = [...algorithms];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (algo) =>
          algo.name.toLowerCase().includes(query) ||
          algo.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((algo) => algo.category_id === selectedCategory);
    }

    setFilteredAlgorithms(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getAlgorithmsByCategory = (categoryId: string) => {
    return filteredAlgorithms.filter((algo) => algo.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">DSA Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Data Structures & Algorithms
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master the fundamentals of computer science. Learn DSA with detailed explanations, multi-language code examples, and complexity analysis.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {categories.map((category) => {
            const count = algorithms.filter(
              (a) => a.category_id === category.id
            ).length;
            return (
              <GlassCard
                key={category.id}
                className={`p-4 cursor-pointer text-center ${
                  selectedCategory === category.id
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
              >
                <span className="text-3xl mb-2 block">{category.icon}</span>
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {count} algorithms
                </p>
              </GlassCard>
            );
          })}
        </motion.div>

        {/* Algorithms by Category */}
        {categories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Accordion
              type="multiple"
              defaultValue={categories.map((c) => c.id)}
              className="space-y-4"
            >
              {categories
                .filter(
                  (category) =>
                    !selectedCategory || selectedCategory === category.id
                )
                .map((category) => {
                  const categoryAlgorithms = getAlgorithmsByCategory(category.id);
                  if (categoryAlgorithms.length === 0 && !searchQuery) return null;

                  return (
                    <AccordionItem
                      key={category.id}
                      value={category.id}
                      className="border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        {categoryAlgorithms.length > 0 ? (
                          <div className="grid gap-3 pt-2">
                            {categoryAlgorithms.map((algorithm) => (
                              <GlassCard
                                key={algorithm.id}
                                className="p-4 flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <Code2 className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                      {algorithm.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Badge
                                        variant="outline"
                                        className={getDifficultyColor(
                                          algorithm.difficulty
                                        )}
                                      >
                                        {algorithm.difficulty}
                                      </Badge>
                                      {algorithm.time_complexity && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {algorithm.time_complexity}
                                        </span>
                                      )}
                                      {algorithm.space_complexity && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Zap className="w-3 h-3" />
                                          {algorithm.space_complexity}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </GlassCard>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm py-4 text-center">
                            No algorithms found in this category
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </motion.div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Algorithm library is being prepared
            </h3>
            <p className="text-muted-foreground">
              Check back soon for comprehensive algorithm tutorials!
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
