// src/components/ExpenseList.js
import { Trash2 } from "lucide-react";

export const ExpenseList = ({ expenses, onDelete }) => {
  return (
    <ul className="space-y-3">
      {expenses.map((exp) => (
        <li
          key={exp.id}
          className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
        >
          <div>
            <p className="font-medium text-foreground">{exp.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(exp.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-semibold text-foreground">
              Rp {exp.amount.toLocaleString('id-ID')}
            </p>
            <button
              onClick={() => onDelete(exp.id)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};