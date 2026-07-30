import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  BookHeart,
  Library,
  Gamepad2,
  FolderOpen,
  Sparkles,
  Menu,
  X,
  Settings,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree", active: true },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

interface FamilyMember {
  id: string;
  full_name: string;
  nickname: string | null;
  gender: string | null;
  birth_year: string | null;
  death_year: string | null;
  is_deceased: boolean | null;
  generation_level: number | null;
  location: string | null;
  occupation: string | null;
  parent_id: string | null;
  spouse_id: string | null;
  sibling_order?: number | null;
  birth_month?: number | null;
  birth_day?: number | null;
  children?: FamilyMember[];
}

const sortSiblings = (a: FamilyMember, b: FamilyMember) => {
  const ao = a.sibling_order ?? 9999;
  const bo = b.sibling_order ?? 9999;
  if (ao !== bo) return ao - bo;
  const ay = parseInt(a.birth_year || "") || 9999;
  const by = parseInt(b.birth_year || "") || 9999;
  if (ay !== by) return ay - by;
  return a.full_name.localeCompare(b.full_name);
};

const MemberNode = ({ 
  member, 
  isExpanded,
  onToggle,
  hasChildren 
}: { 
  member: FamilyMember; 
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}) => {
  const getGenderStyles = () => {
    if (member.is_deceased) {
      return "bg-purple-100 border-purple-300 text-purple-900"; // Angels
    }
    switch (member.gender) {
      case "male":
        return "bg-blue-100 border-blue-400 text-blue-900";
      case "female":
        return "bg-pink-100 border-pink-400 text-pink-900";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative px-4 py-3 rounded-xl border-2 ${getGenderStyles()} min-w-[180px] text-center shadow-sm cursor-pointer hover:shadow-md transition-all`}
      onClick={hasChildren ? onToggle : undefined}
    >
      <div className="flex items-center justify-center gap-2">
        {hasChildren && (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.span>
        )}
        <div>
          <p className="font-medium text-sm">{member.full_name}</p>
          {member.nickname && (
            <p className="text-xs opacity-75">"{member.nickname}"</p>
          )}
          {member.is_deceased && member.death_year && (
            <p className="text-xs opacity-60 mt-1">✝ {member.death_year}</p>
          )}
          {member.is_deceased && !member.death_year && (
            <p className="text-xs opacity-60 mt-1">✝ Passed</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TreeBranch = ({ 
  member, 
  allMembers,
  expandedNodes,
  toggleNode
}: { 
  member: FamilyMember; 
  allMembers: FamilyMember[];
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
}) => {
  const isExpanded = expandedNodes.has(member.id);
  const children = allMembers.filter(m => m.parent_id === member.id).sort(sortSiblings);
  const hasChildren = children.length > 0;
  
  // Find spouse
  const spouse = member.spouse_id 
    ? allMembers.find(m => m.id === member.spouse_id)
    : null;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <MemberNode 
          member={member}
          isExpanded={isExpanded}
          onToggle={() => toggleNode(member.id)}
          hasChildren={hasChildren}
        />
        {spouse && (
          <>
            <div className="w-4 h-0.5 bg-sage-400" />
            <MemberNode 
              member={spouse}
              isExpanded={false}
              onToggle={() => {}}
              hasChildren={false}
            />
          </>
        )}
      </div>
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="w-0.5 h-6 bg-sage-300 mx-auto" />
            
            {children.length > 1 && (
              <div 
                className="h-0.5 bg-sage-300 mx-auto" 
                style={{ width: `${Math.min(children.length, 5) * 200}px` }} 
              />
            )}
            
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {children
                .filter(child => !child.spouse_id || child.id < (child.spouse_id || ''))
                .map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {children.length > 1 && (
                    <div className="w-0.5 h-4 bg-sage-300" />
                  )}
                  <TreeBranch 
                    member={child}
                    allMembers={allMembers}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FamilyTree = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .order("generation_level", { ascending: true });
    
    if (!error && data) {
      setFamilyMembers(data);
      // Expand root by default
      const root = data.find(m => m.generation_level === 0);
      if (root) {
        setExpandedNodes(new Set([root.id]));
      }
    }
    setLoading(false);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(familyMembers.map(m => m.id)));
  };

  const collapseAll = () => {
    const root = familyMembers.find(m => m.generation_level === 0);
    setExpandedNodes(root ? new Set([root.id]) : new Set());
  };

  const rootMember = familyMembers.find(m => m.generation_level === 0);

  const filteredMembers = searchQuery
    ? familyMembers.filter(m => 
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.nickname && m.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Stats
  const totalMembers = familyMembers.length;
  const maleCount = familyMembers.filter(m => m.gender === "male").length;
  const femaleCount = familyMembers.filter(m => m.gender === "female").length;
  const deceasedCount = familyMembers.filter(m => m.is_deceased).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:relative z-40 w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
          >
            <div className="p-6 border-b border-sidebar-border">
              <Logo size="md" />
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        item.active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-sidebar-border">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Family Tree
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 border border-sage-100 text-center">
              <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
              <p className="text-2xl font-bold text-blue-700">{maleCount}</p>
              <p className="text-sm text-blue-600">Male</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-200 text-center">
              <p className="text-2xl font-bold text-pink-700">{femaleCount}</p>
              <p className="text-sm text-pink-600">Female</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
              <p className="text-2xl font-bold text-purple-700">{deceasedCount}</p>
              <p className="text-sm text-purple-600">Angels ✝</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search family members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Search Results ({filteredMembers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      // Expand path to this member
                      const path = new Set<string>();
                      let current: FamilyMember | undefined = member;
                      while (current) {
                        path.add(current.id);
                        current = familyMembers.find(m => m.id === current?.parent_id);
                      }
                      setExpandedNodes(prev => new Set([...prev, ...path]));
                      setSearchQuery("");
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      member.gender === "male" 
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                        : "bg-pink-100 text-pink-800 hover:bg-pink-200"
                    } ${member.is_deceased ? "opacity-60" : ""}`}
                  >
                    {member.full_name}
                    {member.is_deceased && " ✝"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400" />
              <span className="text-muted-foreground">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-pink-100 border-2 border-pink-400" />
              <span className="text-muted-foreground">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300" />
              <span className="text-muted-foreground">Angels (Deceased)</span>
            </div>
          </div>

          {/* Tree */}
          <div className="overflow-x-auto pb-8">
            <div className="min-w-max flex justify-center">
              {rootMember ? (
                <TreeBranch
                  member={rootMember}
                  allMembers={familyMembers}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                />
              ) : (
                <div className="text-center py-12">
                  <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No family members found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FamilyTree;