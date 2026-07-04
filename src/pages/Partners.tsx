import { useState } from "react";
import { Search, Plus, Users, Briefcase, Edit2, Trash2 } from "lucide-react";
import { useApp, PartnerListItem } from "@/lib/AppContext";
import { NewPartnerModal } from "@/components/NewPartnerModal";

export function Partners() {
  const { partnerList, addPartnerListItem, updatePartnerListItem, deletePartnerListItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<PartnerListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPartners = partnerList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.contact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSavePartner = (data: Omit<PartnerListItem, "id">) => {
    if (partnerToEdit) {
      updatePartnerListItem(partnerToEdit.id, data);
    } else {
      addPartnerListItem(data);
    }
    setPartnerToEdit(null);
  };

  const handleEdit = (partner: PartnerListItem) => {
    setPartnerToEdit(partner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deletePartnerListItem(id);
  };

  const openNewPartnerModal = () => {
    setPartnerToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Partenaires</h1>
          <p className="text-[12px] text-slate-500 m-0">Gérez vos clients et fournisseurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openNewPartnerModal} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:opacity-90 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Partenaire
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-end gap-4">

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom..."
                className="w-full sm:w-[250px] pl-9 pr-4 py-1.5 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Nom du Partenaire</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Contact</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Convention</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50 border-b border-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{partner.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{partner.contact}</span>
                      <span className="text-[10px] text-slate-500">{partner.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700 text-[12px] font-medium">{partner.convention || "-"}</span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(partner)} title="Modifier" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(partner.id)} title="Supprimer" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 border-b border-slate-50">
                    Aucun partenaire trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 bg-white border-t border-slate-100">
          <div>Affichage de 1 à {filteredPartners.length} sur {filteredPartners.length} entrées</div>
        </div>
      </div>

      <NewPartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePartner}
        editPartner={partnerToEdit}
      />
    </div>
  );
}
