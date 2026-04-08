"use client";

import { useCallback, useEffect, useState } from "react";
import Form, { type DayFormData } from "@/components/admin/days/Form";
import Header from "@/components/admin/days/Header";
import Table from "@/components/admin/days/Table";
import type { GameDay } from "@/types";

export default function AdminDaysPage() {
  const [days, setDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<GameDay | null>(null);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadDays = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/days");
      const data = await res.json();
      setDays(data.days || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  function openCreate() {
    setEditingDay(null);
    setFormOpen(true);
  }

  function openEdit(day: GameDay) {
    setEditingDay(day);
    setFormOpen(true);
  }

  function cancelForm() {
    setFormOpen(false);
    setEditingDay(null);
  }

  async function onSubmit(data: DayFormData) {
    setSaving(true);
    try {
      const method = editingDay ? "PUT" : "POST";
      const body = editingDay ? { id: editingDay.id, ...data } : data;
      const res = await fetch("/api/admin/days", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFormOpen(false);
        setEditingDay(null);
        loadDays();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDay(id: string) {
    if (!confirm("Bạn có chắc muốn xóa ngày chơi này?")) return;
    try {
      await fetch(`/api/admin/days?id=${id}`, { method: "DELETE" });
      loadDays();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleActive(day: GameDay) {
    try {
      await fetch("/api/admin/days", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: day.id, isActive: !day.isActive }),
      });
      loadDays();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-80px)]">
      <Header
        daysCount={days.length}
        formOpen={formOpen}
        onOpenCreate={openCreate}
      />

      <Form
        formOpen={formOpen}
        editingDay={editingDay}
        saving={saving}
        onCancel={cancelForm}
        onSubmit={onSubmit}
        daysCount={days.length}
      />

      <div className="flex-1">
        <Table
          days={days}
          loading={loading}
          editingDay={editingDay}
          onOpenEdit={openEdit}
          onDeleteDay={deleteDay}
          onToggleActive={toggleActive}
          onOpenCreate={openCreate}
        />
      </div>
    </div>
  );
}
