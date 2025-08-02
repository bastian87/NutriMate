"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { getRecipeById } from "@/lib/services/recipe-service"

export default function DebugGroceryListPage() {
  const { user } = useAuthContext()
  const { groceryList, loading, error, addRecipeIngredients, refetch } = useGroceryList()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const runDiagnostic = async () => {
    if (!user) return

    setIsTesting(true)
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        groceryList: null,
        groceryListItems: [],
        recipeIngredients: [],
        testRecipe: null,
        addRecipeTest: null
      }

      // 1. Verificar lista de compras
      console.log("1. Verificando lista de compras...")
      const { data: groceryLists, error: listError } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("user_id", user.id)

      results.groceryList = {
        data: groceryLists,
        error: listError,
        count: groceryLists?.length || 0
      }

      // 2. Verificar items de la lista
      if (groceryLists && groceryLists.length > 0) {
        console.log("2. Verificando items de la lista...")
        const { data: items, error: itemsError } = await supabase
          .from("grocery_list_items")
          .select("*")
          .eq("grocery_list_id", groceryLists[0].id)
          .order("created_at", { ascending: false })

        results.groceryListItems = {
          data: items,
          error: itemsError,
          count: items?.length || 0
        }
      }

      // 3. Verificar ingredientes de recetas
      console.log("3. Verificando ingredientes de recetas...")
      const { data: recipeIngredients, error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .limit(5)

      results.recipeIngredients = {
        data: recipeIngredients,
        error: ingredientsError,
        count: recipeIngredients?.length || 0
      }

      // 4. Obtener una receta de prueba
      if (recipeIngredients && recipeIngredients.length > 0) {
        console.log("4. Obteniendo receta de prueba...")
        const testRecipeId = recipeIngredients[0].recipe_id
        const testRecipe = await getRecipeById(testRecipeId)
        results.testRecipe = {
          id: testRecipeId,
          recipe: testRecipe,
          ingredients: recipeIngredients.filter(ri => ri.recipe_id === testRecipeId)
        }
      }

      // 5. Probar agregar ingredientes
      if (results.testRecipe && groceryLists && groceryLists.length > 0) {
        console.log("5. Probando agregar ingredientes...")
        try {
          await addRecipeIngredients(results.testRecipe.id)
          results.addRecipeTest = {
            success: true,
            message: "Ingredientes agregados exitosamente"
          }
        } catch (addError) {
          results.addRecipeTest = {
            success: false,
            error: addError instanceof Error ? addError.message : addError
          }
        }
      }

      setDebugInfo(results)
      console.log("Diagnóstico completado:", results)

    } catch (error) {
      console.error("Error en diagnóstico:", error)
      setDebugInfo({
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testAddIngredients = async () => {
    if (!user || !debugInfo?.testRecipe) return

    setIsTesting(true)
    try {
      await addRecipeIngredients(debugInfo.testRecipe.id)
      console.log("✅ Ingredientes agregados exitosamente")
      
      // Recargar la lista
      await refetch()
      
      alert("✅ Ingredientes agregados exitosamente. Verifica la lista de compras.")
    } catch (error) {
      console.error("❌ Error agregando ingredientes:", error)
      alert(`❌ Error: ${error instanceof Error ? error.message : error}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">🔍 Debug: Lista de Compras</h1>
        <p className="text-gray-600 mb-6">
          Esta página ayuda a diagnosticar problemas con la funcionalidad "Add all to Grocery List".
        </p>
      </div>

      <div className="space-y-6">
        {/* Botones de acción */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runDiagnostic} 
                disabled={isTesting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isTesting ? "Ejecutando..." : "🔍 Ejecutar Diagnóstico Completo"}
              </Button>
              
              {debugInfo?.testRecipe && (
                <Button 
                  onClick={testAddIngredients} 
                  disabled={isTesting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isTesting ? "Probando..." : "🧪 Probar Agregar Ingredientes"}
                </Button>
              )}
              
              <Button 
                onClick={() => refetch()} 
                disabled={isTesting}
                variant="outline"
              >
                🔄 Recargar Lista
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado actual */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Usuario:</strong> {user?.email || "No autenticado"}</p>
              <p><strong>Loading:</strong> {loading ? "Sí" : "No"}</p>
              <p><strong>Error:</strong> {error || "Ninguno"}</p>
              <p><strong>Items en lista:</strong> {groceryList?.items?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Resultados del diagnóstico */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Lista de compras actual */}
        {groceryList && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Compras Actual ({groceryList.items.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              {groceryList.items.length === 0 ? (
                <p className="text-gray-500">La lista está vacía</p>
              ) : (
                <div className="space-y-2">
                  {groceryList.items.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit} {item.recipe_id ? `(Receta: ${item.recipe_id})` : ""}
                      </span>
                    </div>
                  ))}
                  {groceryList.items.length > 10 && (
                    <p className="text-sm text-gray-500">
                      ... y {groceryList.items.length - 10} items más
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 