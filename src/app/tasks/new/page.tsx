import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewTaskPage() {
  return (
    <>
      <PageHeader title="Nova tarefa" description="O título é obrigatório; a descrição é opcional." />
      <Card>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </>
  );
}
