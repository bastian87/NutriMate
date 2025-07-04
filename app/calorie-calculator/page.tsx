'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/context";

const nivelesActividad = [
  { value: "sedentario", labelKey: 0 },
  { value: "ligero", labelKey: 1 },
  { value: "moderado", labelKey: 2 },
  { value: "intenso", labelKey: 3 },
  { value: "muy_intenso", labelKey: 4 },
];

const objetivos = [
  { value: "mantener", labelKey: 0 },
  { value: "bajar", labelKey: 1 },
  { value: "subir", labelKey: 2 },
];

export default function CalorieCalculatorPage() {
  const [edad, setEdad] = useState(25);
  const [genero, setGenero] = useState("male");
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(170);
  const [actividad, setActividad] = useState("sedentario");
  const [objetivo, setObjetivo] = useState("mantener");
  const [resultado, setResultado] = useState<number | null>(null);
  const { t } = useLanguage();

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
    <AppLayout title={t("calorieCalculator.title")}>
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/landing">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("calorieCalculator.back")}
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">{t("calorieCalculator.title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">{t("calorieCalculator.age")}</label>
            <Input type="number" value={edad} min={10} max={100} onChange={e => setEdad(Number(e.target.value))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("calorieCalculator.gender")}</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={genero} onChange={e => setGenero(e.target.value)}>
              <option value="male">{t("calorieCalculator.male")}</option>
              <option value="female">{t("calorieCalculator.female")}</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("calorieCalculator.weight")}</label>
            <Input type="number" value={peso} min={30} max={200} onChange={e => setPeso(Number(e.target.value))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("calorieCalculator.height")}</label>
            <Input type="number" value={altura} min={120} max={230} onChange={e => setAltura(Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">{t("calorieCalculator.activity")}</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={actividad} onChange={e => setActividad(e.target.value)}>
              {nivelesActividad.map(n => (
                <option key={n.value} value={n.value}>{t(`calorieCalculator.activities.${n.labelKey}`)}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">{t("calorieCalculator.goal")}</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
              {objetivos.map(o => (
                <option key={o.value} value={o.value}>{t(`calorieCalculator.goals.${o.labelKey}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={calcularCalorias}>{t("calorieCalculator.calculate")}</Button>
        {resultado && (
          <div className="mt-6 text-center">
            <div className="text-lg font-semibold">{t("calorieCalculator.estimated")}</div>
            <div className="text-3xl font-bold text-orange-600">{resultado} {t("calorieCalculator.kcalPerDay")}</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 