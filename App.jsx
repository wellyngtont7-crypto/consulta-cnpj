import { useMemo, useState } from "react";

export default function App() {
  const [cnpj, setCnpj] = useState("");
  const [data, setData] = useState(null);
  const [rawJsonVisible, setRawJsonVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formattedCount = useMemo(() => {
    if (!data) return 0;

    let count = 0;

    const countFields = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(countFields);
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach((value) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            count++;
          }

          if (typeof value === "object") {
            countFields(value);
          }
        });
      }
    };

    countFields(data);

    return count;
  }, [data]);

  const formatCNPJ = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);

    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleSearch = async () => {
    const digits = cnpj.replace(/\D/g, "");

    if (digits.length !== 14) {
      setError("Digite um CNPJ válido.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(
        `https://publica.cnpj.ws/cnpj/${digits}`
      );

      if (!response.ok) {
        throw new Error("CNPJ não encontrado.");
      }

      const json = await response.json();

      setData(json);
    } catch (err) {
      setError(err.message || "Erro ao consultar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black tracking-tight mb-8">
          Consulta de CNPJ
        </h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) =>
                setCnpj(formatCNPJ(e.target.value))
              }
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-emerald-500 text-black font-bold px-8 py-4 rounded-2xl"
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-400">{error}</div>
          )}
        </div>

        {data && (
          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Dados da empresa
              </h2>

              <button
                onClick={() =>
                  setRawJsonVisible(!rawJsonVisible)
                }
                className="border border-zinc-700 px-4 py-2 rounded-xl"
              >
                {rawJsonVisible ? "Ocultar JSON" : "Ver JSON"}
              </button>
            </div>

            <pre className="overflow-auto text-sm text-emerald-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
