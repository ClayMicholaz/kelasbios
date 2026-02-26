import { useState } from "react";
import { Select } from "@/components/ui/SelectImproved";
import SearchableSelect from "@/components/ui/SearchableSelect";

// Demo component untuk showcase dropdown improvements
export default function DropdownShowcase() {
  const [basicValue, setBasicValue] = useState("");
  const [compactValue, setCompactValue] = useState("");
  const [searchableValue, setSearchableValue] = useState("");
  const [errorValue, setErrorValue] = useState("");

  const divisiOptions = [
    { value: "acara", label: "Acara" },
    { value: "pr", label: "Public Relation" },
    { value: "design", label: "Creative and Design" },
    { value: "dev", label: "Development and Project" },
    { value: "publikasi", label: "Publikasi dan Dokumentasi" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dropdown UI Improvements
        </h1>
        <p className="text-gray-600">
          Showcase komponen dropdown yang telah ditingkatkan
        </p>
      </div>

      {/* Basic Select */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          1. Basic Select (Default Variant)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Pilih Status"
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Pilih status..."
          >
            <option value="pending">Pending</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
          </Select>

          <Select
            label="Disabled State"
            value=""
            onChange={() => {}}
            placeholder="Tidak dapat dipilih"
            disabled
          >
            <option value="test">Test Option</option>
          </Select>
        </div>
      </div>

      {/* Compact Select */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          2. Compact Select Variant
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            variant="compact"
            label="Compact Size"
            value={compactValue}
            onChange={setCompactValue}
            placeholder="Pilih divisi..."
          >
            <option value="acara">Acara</option>
            <option value="pr">Public Relation</option>
            <option value="design">Creative and Design</option>
          </Select>

          <Select
            variant="compact"
            label="With Value"
            value="pr"
            onChange={() => {}}
          >
            <option value="pr">Public Relation</option>
            <option value="design">Creative and Design</option>
          </Select>

          <Select
            variant="compact"
            label="Error State"
            value={errorValue}
            onChange={setErrorValue}
            error="Field ini wajib diisi"
          >
            <option value="">Pilih...</option>
            <option value="test">Test Option</option>
          </Select>
        </div>
      </div>

      {/* Searchable Select */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          3. Searchable Select (Advanced)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Divisi dengan Search"
            options={divisiOptions}
            value={searchableValue}
            onChange={setSearchableValue}
            placeholder="Cari atau pilih divisi..."
            searchable={true}
            clearable={true}
          />

          <SearchableSelect
            label="Non-searchable"
            options={divisiOptions}
            value=""
            onChange={() => {}}
            placeholder="Dropdown biasa"
            searchable={false}
            clearable={false}
          />
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          ✨ Fitur Improvements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">🎨 Visual</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Modern rounded design</li>
              <li>• Smooth transitions</li>
              <li>• Custom dropdown arrow</li>
              <li>• Hover & focus states</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">⌨️ Interaction</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Keyboard navigation</li>
              <li>• Search functionality</li>
              <li>• Clear button</li>
              <li>• Outside click close</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">🛠️ Developer</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• TypeScript support</li>
              <li>• Clean props API</li>
              <li>• Error handling</li>
              <li>• Variants system</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          📝 Usage Examples
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Basic Select:</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {`<Select
  label="Pilih Status"
  value={status}
  onChange={setStatus}
  placeholder="Pilih status..."
>
  <option value="pending">Pending</option>
  <option value="accepted">Diterima</option>
</Select>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">
              Searchable Select:
            </h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {`<SearchableSelect
  label="Pilih Divisi"
  options={divisiOptions}
  value={selected}
  onChange={setSelected}
  searchable={true}
  clearable={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
