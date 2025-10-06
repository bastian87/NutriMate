'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Calculator, Target, Activity, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

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
    const tmb =
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <Link href="/landing">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("calorieCalculator.back")}
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t("calorieCalculator.title")}</h1>
          <p className="text-xl text-gray-600">
            Calculate your daily calorie needs based on your personal information
          </p>
        </motion.div>

        {/* Calculator Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t("calorieCalculator.age")}</Label>
                  <Input 
                    id="age"
                    type="number" 
                    value={edad} 
                    min={10} 
                    max={100} 
                    onChange={e => setEdad(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t("calorieCalculator.gender")}</Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("calorieCalculator.male")}</SelectItem>
                      <SelectItem value="female">{t("calorieCalculator.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">{t("calorieCalculator.weight")} (kg)</Label>
                  <Input 
                    id="weight"
                    type="number" 
                    value={peso} 
                    min={30} 
                    max={200} 
                    onChange={e => setPeso(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">{t("calorieCalculator.height")} (cm)</Label>
                  <Input 
                    id="height"
                    type="number" 
                    value={altura} 
                    min={120} 
                    max={230} 
                    onChange={e => setAltura(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity">{t("calorieCalculator.activity")}</Label>
                  <Select value={actividad} onValueChange={setActividad}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nivelesActividad.map(n => (
                        <SelectItem key={n.value} value={n.value}>
                          {t(`calorieCalculator.activities.${n.labelKey}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">{t("calorieCalculator.goal")}</Label>
                  <Select value={objetivo} onValueChange={setObjetivo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objetivos.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          {t(`calorieCalculator.goals.${o.labelKey}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                onClick={calcularCalorias}
                size="lg"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {t("calorieCalculator.calculate")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("calorieCalculator.estimated")}</h3>
                <div className="text-4xl font-bold text-orange-600 mb-2">{resultado}</div>
                <div className="text-lg text-gray-600">{t("calorieCalculator.kcalPerDay")}</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 
