import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    // LOG: Verifica que el webhook llega
    console.log("LemonSqueezy Webhook recibido")
    console.log("Body:", body)
    console.log("Signature:", signature)

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(body)
    const digest = hmac.digest("hex")

    if (signature !== digest) {
      console.log("Firma inválida")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    console.log("Evento recibido:", event.meta.event_name)
    console.log("Datos del evento:", event.data)

    switch (event.meta.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        console.log(`[Webhook] Entrando a handler de ${event.meta.event_name} para subscription_id: ${event.data.id}, user_id: ${event.data.attributes.custom_data?.user_id || event.meta.custom_data?.user_id}`);
        console.log("Evento de suscripción recibido:", event.meta.event_name, event.data)
        const subscription = event.data
        const userId =
          subscription.attributes.custom_data?.user_id ||
          event.meta.custom_data?.user_id;
        const subscriptionId = subscription.id;
        const planName = subscription.attributes.product_name;
        const status = subscription.attributes.status;
        // Conversión segura de fechas a string ISO para timestamptz
        const renewsAt = subscription.attributes.renews_at
          ? new Date(subscription.attributes.renews_at).toISOString()
          : null;
        const endsAt = subscription.attributes.ends_at
          ? new Date(subscription.attributes.ends_at).toISOString()
          : null;
        const customerId = subscription.attributes.customer_id;

        // Validación de campos clave
        if (!userId || !subscriptionId || !planName || !status) {
          console.error("[Webhook] Faltan campos clave en el evento:", { userId, subscriptionId, planName, status });
          break;
        }

        // Idempotencia mejorada: solo ignora si status y fechas son iguales
        const { data: existing } = await supabase
          .from("user_subscriptions")
          .select("status, renews_at, ends_at")
          .eq("subscription_id", subscriptionId)
          .single();

        const isSameStatus = existing?.status === status;
        const isSameRenews = existing?.renews_at === renewsAt;
        const isSameEnds = existing?.ends_at === endsAt;
        const needsUpdate =
          !existing?.renews_at || !existing?.ends_at ||
          !isSameRenews || !isSameEnds;

        if (isSameStatus && !needsUpdate) {
          console.log(`[Webhook] Upsert EVITADO (idempotente) para subscription_id: ${subscriptionId}, user_id: ${userId}. Status: ${status}, renews_at: ${renewsAt}, ends_at: ${endsAt}`);
          break;
        } else {
          console.log(`[Webhook] Upsert PERMITIDO para subscription_id: ${subscriptionId}, user_id: ${userId}. Status: ${status}, renews_at: ${renewsAt}, ends_at: ${endsAt}`);
        }
        // Log antes del upsert
        console.log(`[Webhook] Upsert ejecutado para subscription_id: ${subscriptionId}, user_id: ${userId}. Datos:`, {
          status,
          renews_at: renewsAt,
          ends_at: endsAt,
          plan_name: planName,
          customer_id: customerId,
        });

        // Limpieza de duplicados: dejar solo una fila por subscription_id y user_id (priorizar activa más reciente)
        const { data: dups } = await supabase
          .from("user_subscriptions")
          .select("id, status, updated_at")
          .eq("user_id", userId)
          .eq("subscription_id", subscriptionId);
        if (dups && dups.length > 1) {
          // Mantener la activa más reciente o la más reciente si no hay activa
          const keep = dups.find(d => d.status === "active") ||
            dups.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
          const toDelete = dups.filter(d => d.id !== keep.id).map(d => d.id);
          if (toDelete.length > 0) {
            await supabase.from("user_subscriptions").delete().in("id", toDelete);
            console.log("[Webhook] Duplicados eliminados:", toDelete);
          }
        }

        // Log de depuración: datos enviados a upsert
        console.log("[Webhook] Datos enviados a upsert:", {
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          status,
          plan_name: planName,
          renews_at: renewsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString(),
        });

        // Upsert por subscription_id
        const { error, data } = await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          status,
          plan_name: planName,
          renews_at: renewsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'subscription_id' });
        if (error) {
          console.error(`[Webhook] Error al hacer upsert para subscription_id: ${subscriptionId}, user_id: ${userId}:`, error);
        } else {
          console.log(`[Webhook] Upsert EXITOSO para subscription_id: ${subscriptionId}, user_id: ${userId}`);
        }
        break;
      }

      case "subscription_cancelled": {
        // Mejor idempotencia y limpieza de duplicados en cancelación
        const subscription = event.data;
        const userId = subscription.attributes.custom_data?.user_id || event.meta.custom_data?.user_id;
        const subscriptionId = subscription.id;
        const planName = subscription.attributes.product_name;
        const status = subscription.attributes.status;
        const renewsAt = subscription.attributes.renews_at
          ? new Date(subscription.attributes.renews_at).toISOString()
          : null;
        const endsAt = subscription.attributes.ends_at
          ? new Date(subscription.attributes.ends_at).toISOString()
          : null;
        const customerId = subscription.attributes.customer_id;

        if (!userId || !subscriptionId || !planName || !status) {
          console.error("[Webhook] Faltan campos clave en cancelación:", { userId, subscriptionId, planName, status });
          break;
        }

        // Idempotencia mejorada: solo ignora si status y fechas son iguales
        const { data: existing } = await supabase
          .from("user_subscriptions")
          .select("status, renews_at, ends_at")
          .eq("subscription_id", subscriptionId)
          .single();

        const isSameStatus = existing?.status === status;
        const needsUpdate =
          !existing?.renews_at || !existing?.ends_at ||
          existing.renews_at !== renewsAt || existing.ends_at !== endsAt;

        if (isSameStatus && !needsUpdate) {
          console.log("[Webhook] Evento idempotente ignorado para subscription_id:", subscriptionId);
          break;
        }

        // Limpieza de duplicados: dejar solo una fila por subscription_id y user_id
        const { data: dups } = await supabase
          .from("user_subscriptions")
          .select("id, status, updated_at")
          .eq("user_id", userId)
          .eq("subscription_id", subscriptionId);
        if (dups && dups.length > 1) {
          const keep = dups.find(d => d.status === "active") ||
            dups.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
          const toDelete = dups.filter(d => d.id !== keep.id).map(d => d.id);
          if (toDelete.length > 0) {
            await supabase.from("user_subscriptions").delete().in("id", toDelete);
            console.log("[Webhook] Duplicados eliminados en cancelación:", toDelete);
          }
        }

        // Log de depuración: datos enviados a upsert
        console.log("[Webhook] Datos enviados a upsert:", {
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          status,
          plan_name: planName,
          renews_at: renewsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString(),
        });

        // Upsert por subscription_id
        const { error, data } = await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          status,
          plan_name: planName,
          renews_at: renewsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'subscription_id' });
        if (error) {
          console.error(`[Webhook] Error al hacer upsert para subscription_id: ${subscriptionId}, user_id: ${userId}:`, error);
        } else {
          console.log(`[Webhook] Upsert EXITOSO para subscription_id: ${subscriptionId}, user_id: ${userId}`);
        }

        // Refuerzo de limpieza de duplicados: solo la fila más reciente por subscription_id y user_id
        const { data: allDups } = await supabase
          .from("user_subscriptions")
          .select("id, updated_at")
          .eq("user_id", userId)
          .eq("subscription_id", subscriptionId);
        if (allDups && allDups.length > 1) {
          const sorted = allDups.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          const toDelete = sorted.slice(1).map(d => d.id);
          if (toDelete.length > 0) {
            await supabase.from("user_subscriptions").delete().in("id", toDelete);
            console.log("[Webhook] Duplicados eliminados tras upsert:", toDelete);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
