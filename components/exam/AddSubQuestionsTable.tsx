import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSubQuestion {
  numbers: number[];
  answer: number | '';
}

interface AddSubQuestionsTableProps {
  questions: AddSubQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<AddSubQuestion[]>>;
  active?: boolean;
}

export const AddSubQuestionsTable: React.FC<AddSubQuestionsTableProps> = ({ questions, setQuestions, active = true }) => {
  if (!active) return null;

  // افزودن سوال جدید
  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, { numbers: [0, 0], answer: '' }]);
  };

  // حذف سوال
  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  // افزودن عدد به یک سوال
  const handleAddNumber = (qIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, numbers: [...q.numbers, 0] } : q));
  };

  // حذف عدد از یک سوال
  const handleRemoveNumber = (qIdx: number, nIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, numbers: q.numbers.filter((_, i) => i !== nIdx) } : q));
  };

  // تغییر مقدار عدد
  const handleNumberChange = (qIdx: number, nIdx: number, value: string) => {
    const num = Number(value);
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? {
      ...q,
      numbers: q.numbers.map((n, i) => i === nIdx ? num : n)
    } : q));
  };

  // تغییر مقدار جواب
  const handleAnswerChange = (qIdx: number, value: string) => {
    const num = value === '' ? '' : Number(value);
    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, answer: num } : q));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-2 border">#</th>
            <th className="p-2 border">اعداد</th>
            <th className="p-2 border">جواب</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, qIdx) => (
            <tr key={qIdx}>
              <td className="p-2 border text-center font-bold bg-orange-100">{qIdx + 1}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-2">
                  {q.numbers.map((num, nIdx) => (
                    <div key={nIdx} className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={num}
                        onChange={e => handleNumberChange(qIdx, nIdx, e.target.value)}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveNumber(qIdx, nIdx)}
                        disabled={q.numbers.length <= 1}
                        title="حذف عدد"
                      >
                        -
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddNumber(qIdx)} title="افزودن عدد">+</Button>
                </div>
              </td>
              <td className="p-2 border">
                <Input
                  type="number"
                  value={q.answer}
                  onChange={e => handleAnswerChange(qIdx, e.target.value)}
                  className="w-24"
                />
              </td>
              <td className="p-2 border text-center">
                <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveQuestion(qIdx)}>
                  حذف سوال
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={handleAddQuestion} variant="default">
          افزودن سوال جدید
        </Button>
      </div>
    </div>
  );
}; 