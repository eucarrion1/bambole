import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/notificacoes")({
  component: NotifPage,
});

function NotifPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifs", user?.id],
    queryFn: async () => (await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });

  async function markAll() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifs"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Notificações</h1>
        <button onClick={markAll} className="text-sm text-primary font-semibold">Marcar todas como lidas</button>
      </div>
      <div className="space-y-2">
        {data?.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-10 text-center">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Sem notificações.</p>
          </div>
        ) : data?.map((n) => (
          <div key={n.id} className={`rounded-2xl border p-4 ${n.is_read ? "bg-card border-border" : "bg-primary/5 border-primary/30"}`}>
            <div className="font-semibold">{n.title}</div>
            {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
            <div className="text-xs text-muted-foreground mt-1">{formatDateTime(n.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
