// Script para probar la API de LemonSqueezy
// Ejecuta: node test-lemonsqueezy.js

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJlNjFmMTUxNjI5OGVhYzRiYzJjM2IxMGIzNDAzYTdkNDFiY2Q0Yjg5MmE0NzdkN2FmZGM1M2Y3NWUzMjcyM2U0YjBhZDA4ODBiNDM2NmIxNyIsImlhdCI6MTc1MDE5NTUxNS42Mzc2ODIsIm5iZiI6MTc1MDE5NTUxNS42Mzc2ODYsImV4cCI6MjA2NTcyODMxNS41NzI3MjcsInN1YiI6IjQ5NTQ2MzciLCJzY29wZXMiOltdfQ.pt9Vdm9uGGNdzW0WifWbGquTwR5SkGgqOfm2BkfIaUVm6bIyIf4VZ5CsPcxlpVgJoUY1H9vVqjrcmryws4GZh_gLyokx4QnUpgXdEPKXQxC5VlfHa6eIaNEnZAKyfFZNHs1gpnTrB55wUZmkGtF3JtuCP9fQM8B-deWwmLobBYlTaAg7eGVTaTMU8NxO4qwNdDoM8A56uADISwxi7i5hYdI6rHxpEU9p3i1qmVUrAc6QNBSxoSPXUKHaS9wYqebZ9I4TCuleb9tS2-MCdzJiIMF8-BdPpndfp2tvcfJoJMqnyY73ot3qVD0fyNucKNabbeOKeMRaHENQ6kc0XLwz86yZBIznFiDQYbGoEJkj2dBZA2LvNTM4b9YwlM6M02rSmxZkjovmhZLgWfD1jiXRRrM_YOgzgmJHM0TTw4ZplYzdqsev5XGK9z6oGa62RAlVDO1FRlo2C4CF4JRHRLdLU6jSHcTE-HV_BGgajDFw0A210zlCkPZ1xUHJppsPMJrM';

async function testLemonSqueezyAPI() {
  console.log('🔍 Probando conectividad con LemonSqueezy...\n');

  try {
    // 1. Obtener Stores
    console.log('📋 Obteniendo stores...');
    const storesResponse = await fetch('https://api.lemonsqueezy.com/v1/stores', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
      }
    });

    if (!storesResponse.ok) {
      throw new Error(`Error al obtener stores: ${storesResponse.status} - ${await storesResponse.text()}`);
    }

    const storesData = await storesResponse.json();
    console.log('✅ Stores obtenidos correctamente');
    console.log(`📊 Número de stores: ${storesData.data.length}`);

    if (storesData.data.length > 0) {
      const store = storesData.data[0];
      console.log(`🏪 Store ID: ${store.id}`);
      console.log(`🏪 Store Name: ${store.attributes.name}`);
      console.log(`🏪 Store Slug: ${store.attributes.slug}`);
      console.log(`🏪 Store Domain: ${store.attributes.domain}`);
    }

    // 2. Obtener Products
    console.log('\n📦 Obteniendo productos...');
    const productsResponse = await fetch('https://api.lemonsqueezy.com/v1/products', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
      }
    });

    if (!productsResponse.ok) {
      throw new Error(`Error al obtener productos: ${productsResponse.status} - ${await productsResponse.text()}`);
    }

    const productsData = await productsResponse.json();
    console.log('✅ Productos obtenidos correctamente');
    console.log(`📊 Número de productos: ${productsData.data.length}`);

    productsData.data.forEach(product => {
      console.log(`\n📦 Producto: ${product.attributes.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.attributes.slug}`);
      console.log(`   Status: ${product.attributes.status}`);
    });

    // 3. Obtener Variants
    console.log('\n🔧 Obteniendo variantes...');
    const variantsResponse = await fetch('https://api.lemonsqueezy.com/v1/variants', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
      }
    });

    if (!variantsResponse.ok) {
      throw new Error(`Error al obtener variantes: ${variantsResponse.status} - ${await variantsResponse.text()}`);
    }

    const variantsData = await variantsResponse.json();
    console.log('✅ Variantes obtenidas correctamente');
    console.log(`📊 Número de variantes: ${variantsData.data.length}`);

    variantsData.data.forEach(variant => {
      console.log(`\n🔧 Variante: ${variant.attributes.name}`);
      console.log(`   ID: ${variant.id}`);
      console.log(`   Precio: $${variant.attributes.price}`);
      console.log(`   Intervalo: ${variant.attributes.interval}`);
      console.log(`   Intervalo Count: ${variant.attributes.interval_count}`);
      console.log(`   Status: ${variant.attributes.status}`);
    });

    console.log('\n🎉 ¡Todas las pruebas pasaron!');
    console.log('\n📝 Resumen de configuración:');
    console.log('1. ✅ API Key válida');
    console.log('2. ✅ Stores accesibles');
    console.log('3. ✅ Productos accesibles');
    console.log('4. ✅ Variantes accesibles');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verifica que tu API Key sea correcta');
    console.log('2. Verifica que tengas permisos de lectura');
    console.log('3. Verifica que tu cuenta esté activa');
  }
}

// Ejecutar la prueba
testLemonSqueezyAPI(); 