import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddSubQuestion {
  numbers: number[];
  operators: ('+' | '-')[];
  answer: number | '';
}

interface AddSubQuestionsTableProps {
  questions: AddSubQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<AddSubQuestion[]>>;
  active?: boolean;
}

export const AddSubQuestionsTable: React.FC<AddSubQuestionsTableProps> = ({ questions, setQuestions, active = true }) => {
  if (!active) return null;

  // محاسبه جواب بر اساس اعداد و عملگرها
  const calculateAnswer = (numbers: number[], operators: ('+' | '-')[]): number | '' => {
    if (!numbers.length) return '';
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      const operator = operators[i - 1] || '+';
      if (operator === '+') {
        result += numbers[i];
      } else {
        result -= numbers[i];
      }
    }
    return Math.abs(result);
  };

  // مهاجرت سوالات موجود
  useEffect(() => {
    const migratedQuestions = questions.map(q => {
      const operators = Array.isArray(q.operators) ? q.operators : Array(Math.max(0, q.numbers.length - 1)).fill('+');
      return {
        ...q,
        operators,
        answer: calculateAnswer(q.numbers, operators)
      };
    });
    setQuestions(migratedQuestions);
  }, []);

  // افزودن سوال جدید
  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, { numbers: [0, 0], operators: ['+'], answer: 0 }]);
  };

  // حذف سوال
  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  // افزودن عدد به یک سوال
  const handleAddNumber = (qIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === qIdx) {
        const newNumbers = [...q.numbers, 0];
        const newOperators = [...(q.operators || []), '+'] as ('+' | '-')[];
        const newAnswer = calculateAnswer(newNumbers, newOperators);
        return {
          ...q,
          numbers: newNumbers,
          operators: newOperators,
          answer: newAnswer
        };
      }
      return q;
    }));
  };

  // حذف عدد از یک سوال
  const handleRemoveNumber = (qIdx: number, nIdx: number) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === qIdx) {
        const newNumbers = q.numbers.filter((_, i) => i !== nIdx);
        const newOperators = (q.operators || []).filter((_, i) => i !== nIdx - 1) as ('+' | '-')[];
        const newAnswer = calculateAnswer(newNumbers, newOperators);
        return {
          ...q,
          numbers: newNumbers,
          operators: newOperators,
          answer: newAnswer
        };
      }
      return q;
    }));
  };

  // تغییر مقدار عدد
  const handleNumberChange = (qIdx: number, nIdx: number, value: string) => {
    const num = Number(value);
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === qIdx) {
        const newNumbers = q.numbers.map((n, i) => i === nIdx ? num : n);
        const newAnswer = calculateAnswer(newNumbers, q.operators || []);
        return {
          ...q,
          numbers: newNumbers,
          answer: newAnswer
        };
      }
      return q;
    }));
  };

  // تغییر عملگر
  const handleOperatorChange = (qIdx: number, opIdx: number, value: '+' | '-') => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === qIdx) {
        const newOperators = [...(q.operators || [])];
        newOperators[opIdx] = value;
        const newAnswer = calculateAnswer(q.numbers, newOperators);
        return {
          ...q,
          operators: newOperators,
          answer: newAnswer
        };
      }
      return q;
    }));
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-2 border">#</th>
            <th className="p-2 border">اعداد و عملگرها</th>
            <th className="p-2 border">جواب</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, qIdx) => (
            <tr key={qIdx}>
              <td className="p-2 border text-center font-bold bg-orange-100">{qIdx + 1}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-2 items-center">
                  {q.numbers.map((num, nIdx) => (
                    <React.Fragment key={nIdx}>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={num}
                          onChange={e => handleNumberChange(qIdx, nIdx, e.target.value)}
                          className="w-20"
                        />
                        {nIdx < q.numbers.length - 1 && (
                          <Select
                            defaultValue="+"
                            value={q.operators?.[nIdx] || '+'}
                            onValueChange={(value: '+' | '-') => handleOperatorChange(qIdx, nIdx, value)}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+">+</SelectItem>
                              <SelectItem value="-">-</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {nIdx < q.numbers.length - 1 && (
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
                      )}
                    </React.Fragment>
                  ))}
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddNumber(qIdx)} title="افزودن عدد">+</Button>
                </div>
              </td>
              <td className="p-2 border">
                <Input
                  type="number"
                  value={q.answer}
                  readOnly
                  className="w-24 bg-gray-100"
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