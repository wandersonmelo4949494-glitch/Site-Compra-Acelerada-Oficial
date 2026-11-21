import { Input } from "@/components/ui/input";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ search, setSearch, placeholder = "Pesquise sua moto" }: SearchBarProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full shadow-lg border-2 border-border pr-12 h-14 text-lg"
        />
        <img
          src="https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/lupa.png"
          alt="Buscar"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50"
        />
      </div>
    </div>
  );
};