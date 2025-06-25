'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/components/app-layout";
import { Input } from "@/components/ui/input";

const nivelesActividad = [
  { value: "sedentario", label: "Sedentario (poco o ningún ejercicio)" },
  { value: "ligero", label: "Ligera (ejercicio ligero 1-3 días/semana)" },
  { value: "moderado", label: "Moderada (ejercicio moderado 3-5 días/semana)" },
  { value: "intenso", label: "Intensa (ejercicio intenso 6-7 días/semana)" },
  { value: "muy_intenso", label: "Muy intensa (entrenamiento físico o trabajo muy demandante)" },
];

const objetivos = [
  { value: "mantener", label: "Mantener peso" },
  { value: "bajar", label: "Bajar de peso" },
  { value: "subir", label: "Subir de peso" },
];

export default function CalorieCalculatorPage() {
  const [edad, setEdad] = useState(25);
  const [genero, setGenero] = useState("male");
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(170);
  const [actividad, setActividad] = useState("sedentario");
  const [objetivo, setObjetivo] = useState("mantener");
  const [resultado, setResultado] = useState<number | null>(null);

  const calcularCalorias = () => {
    // Fórmula de Harris-Benedict
    let tmb =
      genero === "male"
        ? 88.36 + 13.4 * peso + 4.8 * altura - 5.7 * edad
        : 447.6 + 9.2 * peso + 3.1 * altura - 4.3 * edad;
    let factor = 1.2;
    if (actividad === "ligero") factor = 1.375;
    if (actividad === "moderado") factor = 1.55;
    if (actividad === "intenso") factor = 1.725;
    if (actividad === "muy_intenso") factor = 1.9;
    let calorias = tmb * factor;
    if (objetivo === "bajar") calorias -= 400;
    if (objetivo === "subir") calorias += 400;
    setResultado(Math.round(calorias));
  };

  return (
    <AppLayout title="Calculadora de Calorías">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/landing">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">Calculadora de Calorías</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Edad</label>
            <Input type="number" value={edad} min={10} max={100} onChange={e => setEdad(Number(e.target.value))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Género</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={genero} onChange={e => setGenero(e.target.value)}>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Peso (kg)</label>
            <Input type="number" value={peso} min={30} max={200} onChange={e => setPeso(Number(e.target.value))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Altura (cm)</label>
            <Input type="number" value={altura} min={120} max={230} onChange={e => setAltura(Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Nivel de actividad</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={actividad} onChange={e => setActividad(e.target.value)}>
              {nivelesActividad.map(n => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Objetivo</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
              {objetivos.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={calcularCalorias}>Calcular</Button>
        {resultado && (
          <div className="mt-6 text-center">
            <div className="text-lg font-semibold">Requerimiento calórico estimado:</div>
            <div className="text-3xl font-bold text-orange-600">{resultado} kcal/día</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 