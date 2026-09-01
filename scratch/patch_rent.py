import re

with open("src/app/(dashboard)/rent/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { Plus, Search, Filter, Wallet, TrendingUp, AlertCircle, Download, CheckCircle2, MessageCircle } from "lucide-react";',
    'import { Plus, Search, Filter, Wallet, TrendingUp, AlertCircle, Download, CheckCircle2, MessageCircle, Calendar, ChevronDown } from "lucide-react";'
)

# 2. Add generatePeriods and AVAILABLE_PERIODS
periods_code = """
const generatePeriods = () => {
  const periods = ["Global"];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  periods.push(`Année ${currentYear}`);
  
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    periods.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }
  return periods;
};

const AVAILABLE_PERIODS = generatePeriods();

export default function RentPage() {"""

content = content.replace("export default function RentPage() {", periods_code.strip())

# 3. Add state
state_code = """  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(AVAILABLE_PERIODS[2]);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);"""
  
content = content.replace(
    '  const [searchTerm, setSearchTerm] = useState("");\n  const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);',
    state_code
)

# 4. Filter logic
filter_code = """  const periodPayments = selectedPeriod === "Global"
    ? payments
    : selectedPeriod.startsWith("Année")
    ? payments.filter(p => p.month.includes(selectedPeriod.split(" ")[1]))
    : payments.filter(p => p.month === selectedPeriod);

  // Filter payments
  const enrichedPayments = periodPayments.map(payment => {"""
  
content = content.replace(
    '  // Filter payments\n  const enrichedPayments = payments.map(payment => {',
    filter_code
)

# 5. Commission Calculation
content = content.replace(
    '  // Commission Calculation\n  let totalCommission = 0;\n  payments.forEach(payment => {',
    '  // Commission Calculation\n  let totalCommission = 0;\n  periodPayments.forEach(payment => {'
)

# 6. Add UI dropdown
dropdown_ui = """        actions={
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative z-50">
              <div 
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="flex items-center bg-white rounded-full px-4 h-11 border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <Calendar className="h-4 w-4 text-slate-500 mr-2" />
                <span className="text-sm font-medium text-slate-700 mr-2 whitespace-nowrap">{selectedPeriod}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
              
              {isPeriodDropdownOpen && (
                <div className="absolute top-12 right-0 w-full min-w-[150px] bg-white rounded-xl shadow-lg border border-slate-100 py-2">
                  {AVAILABLE_PERIODS.map((period) => (
                    <button
                      key={period}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedPeriod(period);
                        setIsPeriodDropdownOpen(false);
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <motion.button"""
            
content = content.replace(
    '        actions={\n          <div className="hidden sm:flex items-center gap-3">\n            <motion.button',
    dropdown_ui
)

with open("src/app/(dashboard)/rent/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied successfully.")
