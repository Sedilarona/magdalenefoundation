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
  ChevronDown,
  ChevronRight,
  User,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// Sidebar navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

// Family tree data based on the image
interface FamilyMember {
  id: string;
  name: string;
  nickname?: string;
  gender: "male" | "female" | "angel";
  birthYear?: string;
  deathYear?: string;
  spouse?: string;
  children?: FamilyMember[];
}

const familyTreeData: FamilyMember = {
  id: "magdeline",
  name: "Magdeline Bodilenyane",
  nickname: "Magatelane",
  gender: "female",
  deathYear: "02/2002",
  children: [
    {
      id: "tshose",
      name: "Tshose Edward",
      gender: "male",
      spouse: "Thomamiso Kgafela",
      children: [
        {
          id: "seabe",
          name: "Seabe Ogomoditse Hetanang",
          gender: "male",
          children: [
            {
              id: "thuso",
              name: "Thuso Boitumelo Hetanang",
              gender: "male",
              children: [
                { id: "thobo", name: "Thobo Hetanang", gender: "male" },
                { id: "tema", name: "Tema Hetanang", gender: "male" },
              ],
            },
            { id: "kago", name: "Kago Hetanang", gender: "female" },
          ],
        },
        {
          id: "dineo",
          name: "Dineo Kgafela",
          gender: "female",
          children: [
            { id: "thabang", name: "Thabang Kgafela", gender: "male" },
            { id: "omphile", name: "Omphile Kgafela", gender: "female" },
            { id: "tlotlo", name: "Tlotlo Phalatsa", gender: "female" },
          ],
        },
        {
          id: "lesego",
          name: "Lesego Kgafela",
          gender: "female",
          children: [
            { id: "prince", name: "Prince Kgafela", gender: "male" },
            { id: "princess", name: "Princess Kgafela", gender: "female" },
          ],
        },
        {
          id: "tefo-k",
          name: "Tefo Kgafela",
          gender: "male",
          children: [
            { id: "latoyah", name: "Latoyah Motshelanoka", gender: "female" },
          ],
        },
        {
          id: "letsogile",
          name: "Letsogile Kgafela",
          gender: "female",
          children: [
            { id: "tumiso", name: "Tumiso Segale", gender: "male" },
            { id: "mosa", name: "Mosa Segale", gender: "female" },
          ],
        },
        { id: "bontle", name: "Bontle Kgafela", gender: "female" },
      ],
    },
    {
      id: "lawerance",
      name: "Lawerance Bodilenyane",
      gender: "male",
      spouse: "Judith Bodilenyane",
      children: [
        {
          id: "kabelo",
          name: "Kabelo Joyce Bodilenyane",
          gender: "female",
          children: [
            { id: "leile", name: "Leile Bodilenyane-Dube", gender: "female" },
          ],
        },
        {
          id: "topo",
          name: "Topo Bodilenyane",
          gender: "male",
          children: [
            { id: "anaya", name: "Anaya Bodilenyane-Tlhabologang", gender: "female" },
          ],
        },
      ],
    },
    {
      id: "tshepho",
      name: "Tshepho Poane",
      gender: "female",
      children: [
        {
          id: "patrick",
          name: "Patrick Keamogetse Jansen",
          gender: "male",
          children: [
            { id: "lebone", name: "Lebone Jansen", gender: "female" },
            { id: "lelentle", name: "Lelentle Jansen", gender: "female" },
            { id: "danny", name: "Danny Jansen", gender: "male" },
          ],
        },
        {
          id: "tumisang",
          name: "Tumisang Pelonomi Poane",
          gender: "female",
          children: [
            { id: "leina", name: "Leina Poane", gender: "female" },
            { id: "liana", name: "Liana Poane", gender: "female" },
          ],
        },
        {
          id: "oaitse",
          name: "Oaitse Poane",
          gender: "male",
          children: [
            { id: "riley", name: "Riley Mdaku", gender: "male" },
          ],
        },
        {
          id: "oankgoga",
          name: "Oankgoga Poane",
          gender: "female",
          children: [
            { id: "abale", name: "Abale Poane", gender: "female" },
            { id: "zoe", name: "Zoe Poane", gender: "female" },
          ],
        },
      ],
    },
    {
      id: "grace",
      name: "Grace Poane",
      gender: "female",
      children: [
        {
          id: "tshidiso",
          name: "Tshidiso Mpho Gabegwe",
          gender: "male",
          children: [
            { id: "tlaang", name: "Tlaang Gabegwe", gender: "female" },
            { id: "aasa", name: "Aasa Gabegwe", gender: "female" },
          ],
        },
        {
          id: "tefo-m",
          name: "Tefo Maipelo Kebitseng",
          gender: "female",
          children: [
            { id: "letso", name: "Letso Kebitseng", gender: "male" },
            { id: "nyakallo", name: "Nyakallo Kebitseng", gender: "female" },
          ],
        },
        {
          id: "mopati",
          name: "Mopati Moupo",
          gender: "male",
          children: [
            { id: "warona", name: "Warona Castro", gender: "female" },
          ],
        },
      ],
    },
    {
      id: "donald",
      name: "Donald Joyce Keagakwa Poane",
      gender: "male",
      children: [
        {
          id: "kelebogile",
          name: "Kelebogile Poane",
          gender: "female",
          deathYear: "2011",
          children: [
            { id: "loago", name: "Loago Poane", gender: "female" },
          ],
        },
        {
          id: "kefilwe",
          name: "Kefilwe Poane",
          gender: "female",
          children: [
            { id: "letang", name: "Letang Poane", gender: "male" },
          ],
        },
      ],
    },
    {
      id: "florance",
      name: "Florance Basetsana Poane",
      gender: "female",
      deathYear: "1988",
      children: [
        {
          id: "keemenao",
          name: "Keemenao Kealeboga Kabalano",
          gender: "female",
          children: [
            { id: "larona", name: "Larona Gabositwe", gender: "female" },
            { id: "kutlwano", name: "Kutlwano Kabalano", gender: "male" },
          ],
        },
      ],
    },
    {
      id: "bawili",
      name: "Bawili Caroline Sedilame Motladiile",
      gender: "female",
      deathYear: "1999",
      children: [
        {
          id: "mooketsi",
          name: "Mooketsi Poane",
          gender: "male",
          spouse: "Palesa Mohlomi",
          children: [
            { id: "motheo", name: "Motheo Mohlomi", gender: "male" },
            { id: "lefika", name: "Lefika Mohlomi", gender: "male" },
            { id: "seiso", name: "Seiso Poane", gender: "male" },
            { id: "ajay", name: "Ajay Poane", gender: "male" },
          ],
        },
        {
          id: "gaone",
          name: "Gaone Poane",
          gender: "female",
          children: [
            { id: "sedilame", name: "Sedilame Poane", gender: "female" },
          ],
        },
        {
          id: "obakeng",
          name: "Obakeng Poane",
          gender: "male",
          children: [
            { id: "imani", name: "Imani Bontshetse", gender: "female" },
            { id: "halimah", name: "Halimah Mantha", gender: "female" },
          ],
        },
        { id: "olefile", name: "Olefile Poane", gender: "female" },
      ],
    },
  ],
};

// Member node component
const MemberNode = ({ 
  member, 
  level = 0,
  isExpanded,
  onToggle 
}: { 
  member: FamilyMember; 
  level?: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const hasChildren = member.children && member.children.length > 0;
  
  const getGenderStyles = () => {
    switch (member.gender) {
      case "male":
        return "bg-blue-100 border-blue-300 text-blue-900";
      case "female":
        return "bg-amber-100 border-amber-300 text-amber-900";
      case "angel":
        return "bg-purple-100 border-purple-300 text-purple-900";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative px-4 py-2 rounded-xl border-2 ${getGenderStyles()} min-w-[160px] text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
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
            <p className="font-medium text-sm">{member.name}</p>
            {member.nickname && (
              <p className="text-xs opacity-75">"{member.nickname}"</p>
            )}
            {member.spouse && (
              <p className="text-xs mt-1 font-medium">&amp; {member.spouse}</p>
            )}
            {member.deathYear && (
              <p className="text-xs opacity-60">✝ {member.deathYear}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Recursive tree branch component
const TreeBranch = ({ 
  member, 
  level = 0,
  expandedNodes,
  toggleNode
}: { 
  member: FamilyMember; 
  level?: number;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
}) => {
  const isExpanded = expandedNodes.has(member.id);
  const hasChildren = member.children && member.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <MemberNode 
        member={member} 
        level={level}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(member.id)}
      />
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Vertical connector */}
            <div className="w-0.5 h-6 bg-sage-300 mx-auto" />
            
            {/* Horizontal connector bar */}
            {member.children!.length > 1 && (
              <div className="h-0.5 bg-sage-300 mx-4" style={{ 
                width: `calc(${Math.min(member.children!.length, 4) * 180}px - 2rem)` 
              }} />
            )}
            
            {/* Children */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {member.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {member.children!.length > 1 && (
                    <div className="w-0.5 h-4 bg-sage-300" />
                  )}
                  <TreeBranch 
                    member={child} 
                    level={level + 1}
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["magdeline"]));
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

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
    const getAllIds = (member: FamilyMember): string[] => {
      const ids = [member.id];
      if (member.children) {
        member.children.forEach((child) => {
          ids.push(...getAllIds(child));
        });
      }
      return ids;
    };
    setExpandedNodes(new Set(getAllIds(familyTreeData)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(["magdeline"]));
  };

  if (loading || !user) {
    return null;
  }

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
                        item.href === "/family-tree"
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
                Collapse All
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap gap-4 justify-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-300" />
              <span className="text-sm text-muted-foreground">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300" />
              <span className="text-sm text-muted-foreground">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">✝ = Deceased</span>
            </div>
          </motion.div>

          {/* Family Tree */}
          <div className="overflow-x-auto pb-8">
            <div className="min-w-[800px] flex justify-center">
              <TreeBranch 
                member={familyTreeData}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FamilyTree;