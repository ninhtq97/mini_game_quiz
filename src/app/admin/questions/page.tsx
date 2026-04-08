"use client";

import { useCallback, useEffect, useState } from "react";
import Filter from "@/components/admin/questions/Filter";
import Form, { type QuestionFormData } from "@/components/admin/questions/Form";
import Header from "@/components/admin/questions/Header";
import Table from "@/components/admin/questions/Table";
import type { GameDay, Question } from "@/types";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [days, setDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterDayId, setFilterDayId] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [qRes, dRes] = await Promise.all([
        fetch(
          `/api/admin/questions${filterDayId ? `?gameDayId=${filterDayId}` : ""}`,
        ),
        fetch("/api/admin/days"),
      ]);
      const qData = await qRes.json();
      const dData = await dRes.json();
      setQuestions(qData.questions || []);
      setDays(dData.days || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterDayId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingQuestion(null);
    setFormOpen(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);
    setFormOpen(true);
  }

  function cancelForm() {
    setFormOpen(false);
    setEditingQuestion(null);
  }

  async function onSubmit(data: QuestionFormData) {
    setSaving(true);
    try {
      const options = [
        { id: "a", text: data.optionA, isCorrect: data.correctOption === "a" },
        { id: "b", text: data.optionB, isCorrect: data.correctOption === "b" },
        { id: "c", text: data.optionC, isCorrect: data.correctOption === "c" },
        { id: "d", text: data.optionD, isCorrect: data.correctOption === "d" },
      ];

      const body = {
        ...(editingQuestion ? { id: editingQuestion.id } : {}),
        gameDayId: data.gameDayId,
        questionText: data.questionText,
        questionType: "MULTIPLE_CHOICE",
        options,
        correctAnswer: data.correctOption,
        order: Number(data.order),
        points: Number(data.points),
        timeLimitSeconds: Number(data.timeLimitSeconds),
      };

      const method = editingQuestion ? "PUT" : "POST";
      const res = await fetch("/api/admin/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Header questionsCount={questions.length} />
        <Filter
          days={days}
          filterDayId={filterDayId}
          onFilterChange={setFilterDayId}
          formOpen={formOpen}
          onOpenCreate={openCreate}
        />
      </div>

      <Form
        formOpen={formOpen}
        editingQuestion={editingQuestion}
        saving={saving}
        days={days}
        filterDayId={filterDayId}
        questionsCount={questions.length}
        onCancel={cancelForm}
        onSubmit={onSubmit}
      />

      <div className="flex-1">
        <Table
          questions={questions}
          loading={loading}
          editingQuestion={editingQuestion}
          filterDayId={filterDayId}
          onOpenEdit={openEdit}
          onDeleteQuestion={deleteQuestion}
          onOpenCreate={openCreate}
        />
      </div>
    </div>
  );
}
